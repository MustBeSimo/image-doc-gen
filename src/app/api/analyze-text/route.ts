import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface AnalysisResponse {
  enhancedText: string;
  imagePrompts: string[];
  recommendedStyle: string;
  recommendedImagesPerPage: number;
  recommendedOrientation: string;
}

export async function POST(req: Request) {
  if (!process.env.TOGETHER_API_KEY) {
    return NextResponse.json(
      { error: 'Together API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid text provided' },
        { status: 400 }
      );
    }

    // Call Together API for text analysis
    const response = await fetch('https://api.together.xyz/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        prompt: `<s>[INST] You are an expert document analyzer. Analyze the following text and provide a JSON response with:
1. enhancedText: Enhanced version with proper markdown formatting and structure
2. imagePrompts: Array of 3-4 relevant image prompts that capture key themes (these will be used with FLUX.1 image model)
3. recommendedStyle: Layout style (modern, classic, magazine)
4. recommendedImagesPerPage: Number of images per page (1-3)
5. recommendedOrientation: Page orientation (portrait, landscape)

Text to analyze:
${text}

Provide your response in valid JSON format. [/INST]</s>`,
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze text with Together API');
    }

    const result = await response.json();
    const content = result.choices[0].text;
    
    if (!content) {
      throw new Error('Empty response from Together API');
    }

    const analysis = JSON.parse(content) as AnalysisResponse;

    // Save analysis to markdown file in /tmp for Vercel
    const analysisDir = join('/tmp', 'analysis');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = join(analysisDir, `analysis-${timestamp}.md`);

    try {
      // Create directory if it doesn't exist
      await mkdir(analysisDir, { recursive: true });

      // Save analysis as markdown
      const markdownContent = `# Document Analysis ${timestamp}

## Original Text
${text}

## Enhanced Text
${analysis.enhancedText}

## Image Prompts
${analysis.imagePrompts.map(prompt => `- ${prompt}`).join('\n')}

## Layout Recommendations
- Style: ${analysis.recommendedStyle}
- Images per page: ${analysis.recommendedImagesPerPage}
- Orientation: ${analysis.recommendedOrientation}
`;

      await writeFile(filename, markdownContent);
    } catch (error) {
      console.error('Failed to save analysis file:', error);
      // Continue execution even if file save fails
    }

    return NextResponse.json({
      enhancedText: analysis.enhancedText || text,
      imagePrompts: analysis.imagePrompts || [
        "A visual summary of the key concepts",
        "An illustration of the main themes",
        "A conceptual representation of the content"
      ],
      recommendedStyle: analysis.recommendedStyle || 'modern',
      recommendedImagesPerPage: analysis.recommendedImagesPerPage || 1,
      recommendedOrientation: analysis.recommendedOrientation || 'portrait',
      savedToFile: filename
    });
  } catch (error) {
    console.error('Error in analyze-text route:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
} 