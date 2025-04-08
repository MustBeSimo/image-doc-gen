import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface TogetherAPIError {
  error?: string;
  message?: string;
  status?: number;
}

interface TogetherAPIResponse {
  output: string[];
  status: string;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

    if (!TOGETHER_API_KEY) {
      console.error('Together API key not configured');
      return NextResponse.json(
        { error: 'Together API key not configured' },
        { status: 500 }
      );
    }

    if (!prompt || typeof prompt !== 'string') {
      console.error('Invalid prompt:', prompt);
      return NextResponse.json(
        { error: 'Invalid prompt provided' },
        { status: 400 }
      );
    }

    console.log('Generating image for prompt:', prompt);

    const response = await fetch("https://api.together.xyz/v1/images/generation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOGETHER_API_KEY}`
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell",
        prompt: prompt,
        n: 1,
        steps: 20,
        width: 1024,
        height: 1024,
        seed: Math.floor(Math.random() * 1000000),
        scheduler: "euler_a",
        guidance_scale: 7.5
      })
    });

    let responseData;
    try {
      responseData = await response.json();
      console.log('Together API response:', responseData);
    } catch (error) {
      console.error('Failed to parse Together API response:', error);
      throw new Error('Invalid response from Together API');
    }

    if (!response.ok) {
      console.error('Together API error response:', responseData);
      const errorMessage = responseData.error || responseData.message || 'Failed to generate image';
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    if (!responseData.output || !Array.isArray(responseData.output) || !responseData.output.length) {
      console.error('Invalid response format from Together API:', responseData);
      return NextResponse.json(
        { error: 'Invalid response format from Together API' },
        { status: 500 }
      );
    }

    if (typeof responseData.output[0] !== 'string' || !responseData.output[0].length) {
      console.error('Invalid image data from Together API:', responseData);
      return NextResponse.json(
        { error: 'Invalid image data received' },
        { status: 500 }
      );
    }

    // Save image data to file in /tmp for Vercel
    const imagesDir = join('/tmp', 'generated-images');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = join(imagesDir, `image-${timestamp}.json`);

    try {
      // Create directory if it doesn't exist
      await mkdir(imagesDir, { recursive: true });

      // Save image data and metadata
      const imageData = {
        timestamp,
        prompt,
        b64_json: responseData.output[0]
      };

      await writeFile(filename, JSON.stringify(imageData, null, 2));
    } catch (error) {
      console.error('Failed to save image data:', error);
      // Continue execution even if file save fails
    }

    return NextResponse.json({
      data: [{
        b64_json: responseData.output[0]
      }],
      savedToFile: filename
    });
  } catch (error) {
    console.error('Error in generate-image route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 