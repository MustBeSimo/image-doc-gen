'use client';

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';

interface PageData {
  id: number;
  title: string;
  text: string;
  layout: string;
  orientation: string;
  images: Array<{
    id: string;
    prompt: string;
    url: string;
  }>;
  textDisplay?: string;
}

interface LayoutTemplate {
  container: string;
  imageClass: string;
  textClass: string;
  titleClass: string;
}

export default function Home() {
  const [step, setStep] = useState<number>(1); // 1: Input, 2: Analysis, 3: Layout Selection, 4: Preview, 5: Generate
  const [inputType, setInputType] = useState<string>('prompt'); // 'prompt' or 'file'
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [uploadedText, setUploadedText] = useState<string>('');
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [imagePrompts, setImagePrompts] = useState<string[]>([]);
  const [layoutOptions, setLayoutOptions] = useState({
    orientation: 'portrait', // portrait or landscape
    totalPages: 1,
    imagesPerPage: 1,
    layoutStyle: 'modern' // modern, classic, minimal, etc.
  });
  const [generatedPages, setGeneratedPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [currentPageLayoutOptions, setCurrentPageLayoutOptions] = useState({
    layout: 'modern',
    imagesPerPage: 1,
    textDisplay: 'compact' // Can be 'compact' or 'expanded'
  });
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [sequentialGenerationComplete, setSequentialGenerationComplete] = useState<boolean>(false);

  // Handle text input via prompt
  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setUserPrompt(e.target.value);
  };

  // Handle file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        // Clean up binary content for PDFs or other non-text files
        const result = event.target.result;
        const cleanText = result.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
        setUploadedText(cleanText);
        setFileUploaded(true);
      }
    };
    reader.readAsText(file);
  };

  // Generate text content from prompt using LLM (mock for now)
  const generateContentFromPrompt = async () => {
    setIsLoading(true);
    
    // In a real implementation, this would be an API call to a service like OpenAI
    // For now, we'll create a more sophisticated mock to simulate LLM content generation
    setTimeout(() => {
      try {
        // Analyze the prompt for key themes and topics
        const promptWords = userPrompt.toLowerCase()
          .split(/[\s.,!?;:()\[\]{}'"]/g)
          .filter(word => word.length > 3)
          .filter(word => !['about', 'with', 'that', 'this', 'these', 'those', 'there', 'their', 'from', 'have', 'been'].includes(word));
          
        // Categorize prompt type
        let promptType = 'general';
        const educationalTerms = ['guide', 'learn', 'course', 'tutorial', 'education', 'study', 'teach'];
        const businessTerms = ['business', 'market', 'company', 'startup', 'enterprise', 'corporate', 'industry'];
        const technicalTerms = ['software', 'hardware', 'code', 'programming', 'technology', 'system', 'data'];
        const creativeTerms = ['art', 'design', 'creative', 'story', 'novel', 'poetry', 'fiction'];
        
        // Determine the prompt type based on keyword presence
        if (promptWords.some(word => educationalTerms.includes(word))) {
          promptType = 'educational';
        } else if (promptWords.some(word => businessTerms.includes(word))) {
          promptType = 'business';
        } else if (promptWords.some(word => technicalTerms.includes(word))) {
          promptType = 'technical';
        } else if (promptWords.some(word => creativeTerms.includes(word))) {
          promptType = 'creative';
        }
        
        // Generate a title from the prompt
        const capitalizedPrompt = userPrompt.trim().charAt(0).toUpperCase() + userPrompt.trim().slice(1);
        let title = '';
        
        switch (promptType) {
          case 'educational':
            title = `The Complete Guide to ${capitalizedPrompt}`;
            break;
          case 'business':
            title = `${capitalizedPrompt}: Market Analysis and Insights`;
            break;
          case 'technical':
            title = `Understanding ${capitalizedPrompt}: Technical Overview`;
            break;
          case 'creative':
            title = `Exploring ${capitalizedPrompt} Through Creative Expression`;
            break;
          default:
            title = `${capitalizedPrompt}: An In-depth Analysis`;
        }
        
        // Generate structured content based on prompt type
        let generatedContent = `# ${title}\n\n`;
        
        // Introduction
        generatedContent += `## Introduction\n\n`;
        generatedContent += `${capitalizedPrompt} has become increasingly important in today's rapidly evolving world. `;
        generatedContent += `This document explores the key aspects, benefits, and applications of ${userPrompt.toLowerCase()}, `;
        generatedContent += `providing valuable insights for readers interested in this subject.\n\n`;
        
        // Generate 2-4 main sections with relevant content based on prompt type
        const sectionCount = Math.floor(Math.random() * 3) + 2; // 2-4 sections
        
        // Generate section topics based on prompt type
        const sections = [];
        
        if (promptType === 'educational') {
          sections.push('Key Concepts');
          sections.push('Learning Approaches');
          sections.push('Practical Applications');
          sections.push('Future Directions');
        } else if (promptType === 'business') {
          sections.push('Market Overview');
          sections.push('Strategic Considerations');
          sections.push('Competitive Analysis');
          sections.push('Growth Opportunities');
        } else if (promptType === 'technical') {
          sections.push('Technical Foundation');
          sections.push('System Architecture');
          sections.push('Implementation Strategies');
          sections.push('Performance Optimization');
        } else if (promptType === 'creative') {
          sections.push('Creative Process');
          sections.push('Artistic Elements');
          sections.push('Inspiration Sources');
          sections.push('Expressive Techniques');
        } else {
          sections.push('Background');
          sections.push('Main Considerations');
          sections.push('Key Benefits');
          sections.push('Future Outlook');
        }
        
        // Take only the required number of sections
        const selectedSections = sections.slice(0, sectionCount);
        
        // Generate content for each section
        selectedSections.forEach(section => {
          generatedContent += `## ${section}\n\n`;
          
          // Generate 2-3 paragraphs for each section
          const paragraphCount = Math.floor(Math.random() * 2) + 2; // 2-3 paragraphs
          
          for (let i = 0; i < paragraphCount; i++) {
            // Generate paragraph with 3-5 sentences
            const sentenceCount = Math.floor(Math.random() * 3) + 3; // 3-5 sentences
            let paragraph = '';
            
            for (let j = 0; j < sentenceCount; j++) {
              // Sentence templates relevant to the section
              const templates = [
                `${capitalizedPrompt} provides significant advantages in the context of ${section.toLowerCase()}.`,
                `Many experts consider ${userPrompt.toLowerCase()} essential when discussing ${section.toLowerCase()}.`,
                `Research has shown that ${userPrompt.toLowerCase()} can dramatically improve outcomes related to ${section.toLowerCase()}.`,
                `When implementing ${userPrompt.toLowerCase()}, it's crucial to consider various aspects of ${section.toLowerCase()}.`,
                `The relationship between ${userPrompt.toLowerCase()} and ${section.toLowerCase()} continues to evolve in interesting ways.`,
                `Recent developments in ${userPrompt.toLowerCase()} have transformed our understanding of ${section.toLowerCase()}.`,
                `Organizations that effectively leverage ${userPrompt.toLowerCase()} often excel in ${section.toLowerCase()}.`,
                `A comprehensive approach to ${userPrompt.toLowerCase()} must address key elements of ${section.toLowerCase()}.`
              ];
              
              // Select a random sentence template
              paragraph += templates[Math.floor(Math.random() * templates.length)] + ' ';
            }
            
            generatedContent += paragraph + '\n\n';
          }
        });
        
        // Add a conclusion
        generatedContent += `## Conclusion\n\n`;
        generatedContent += `In summary, ${userPrompt.toLowerCase()} represents a critical area worthy of attention and further exploration. `;
        generatedContent += `By understanding the key elements discussed in this document, readers can better appreciate the significance `;
        generatedContent += `and potential applications of ${userPrompt.toLowerCase()} in various contexts. `;
        generatedContent += `As developments continue to emerge, the importance of staying informed about ${userPrompt.toLowerCase()} `;
        generatedContent += `will only increase in the coming years.\n\n`;
        
        // Generate more sophisticated image prompts based on the content sections
        const imagePromptTypes = [
          'A photorealistic representation of',
          'A detailed illustration showing',
          'An abstract visualization depicting',
          'A conceptual diagram explaining',
          'A high-quality infographic about'
        ];
        
        // Generate prompts based on the document sections
        const generatedPrompts = selectedSections.map((section, index) => {
          const promptType = imagePromptTypes[index % imagePromptTypes.length];
          return `${promptType} ${userPrompt} in the context of ${section}`;
        });
        
        // Ensure we have at least 3 prompts
        while (generatedPrompts.length < 3) {
          generatedPrompts.push(`A creative visualization of ${userPrompt} from a unique perspective`);
        }
        
        // Set state with the generated content
        setGeneratedText(generatedContent);
        setImagePrompts(generatedPrompts);
        
        // Also recommend layout options based on the content
        // For educational/technical content, prefer classic layout
        // For creative content, prefer magazine layout
        // For business content, prefer modern layout
        let recommendedStyle = 'modern';
        switch (promptType) {
          case 'educational':
          case 'technical':
            recommendedStyle = 'classic';
            break;
          case 'creative':
            recommendedStyle = 'magazine';
            break;
          case 'business':
            recommendedStyle = 'modern';
            break;
        }
        
        // Update layout recommendations
        setLayoutOptions(prev => ({
          ...prev,
          layoutStyle: recommendedStyle
        }));
        
        setIsLoading(false);
        setStep(2); // Move to analysis step
      } catch (error) {
        console.error("Error generating content:", error);
        // Fallback to simple generation
        setGeneratedText(`# ${userPrompt}\n\nThis is a basic overview of ${userPrompt}. The content generation encountered an error.`);
        setImagePrompts([
          `A visualization of ${userPrompt}`,
          `An illustration related to ${userPrompt}`,
          `A conceptual image of ${userPrompt}`
        ]);
        setIsLoading(false);
        setStep(2);
      }
    }, 2000);
  };

  // Analyze uploaded text (mock for now)
  const analyzeUploadedText = async () => {
    setIsLoading(true);
    try {
      // Call OpenAI API to analyze the text
      const response = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: uploadedText })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const analysis = await response.json();
      
      // Set the analyzed content
      setGeneratedText(analysis.enhancedText || uploadedText);
      setImagePrompts(analysis.imagePrompts || [
        "A visual summary of the key concepts",
        "An illustration of the main themes",
        "A conceptual representation of the content"
      ]);

      // Update layout based on content analysis
      setLayoutOptions(prev => ({
        ...prev,
        imagesPerPage: analysis.recommendedImagesPerPage || 1,
        layoutStyle: analysis.recommendedStyle || 'modern',
        orientation: analysis.recommendedOrientation || 'portrait'
      }));

      setIsLoading(false);
      setStep(2);
    } catch (error) {
      console.error("Error analyzing text:", error);
      // Fallback to basic analysis
      setGeneratedText(uploadedText);
      setImagePrompts([
        "A visual summary of the key concepts",
        "An illustration of the main themes",
        "A conceptual representation of the content"
      ]);
      setIsLoading(false);
      setStep(2);
    }
  };

  // Update layout options
  const updateLayoutOption = (option: string, value: string | number) => {
    setLayoutOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  // Get layout template based on layout style and orientation
  const getLayoutTemplate = (style: string, orientation: string, imageCount: number): LayoutTemplate => {
    const baseClasses = {
      container: 'w-full bg-white shadow-lg rounded-lg overflow-hidden flex flex-col',
      imageContainer: 'flex flex-wrap gap-4 justify-center p-4',
      textContainer: 'prose prose-sm max-w-none p-6',
      titleContainer: 'text-xl font-bold mb-4 px-4 pt-4'
    };

    const templates: Record<string, LayoutTemplate> = {
      modern: {
        container: `${baseClasses.container} min-h-[800px]`,
        imageClass: `${baseClasses.imageContainer} flex-shrink-0 min-h-[300px] max-h-[400px]`,
        textClass: `${baseClasses.textContainer} flex-grow overflow-y-auto`,
        titleClass: `${baseClasses.titleContainer} text-center`
      },
      classic: {
        container: `${baseClasses.container} min-h-[800px]`,
        imageClass: `${baseClasses.imageContainer} flex-shrink-0 min-h-[300px] max-h-[400px]`,
        textClass: `${baseClasses.textContainer} flex-grow overflow-y-auto`,
        titleClass: `${baseClasses.titleContainer} font-serif`
      },
      magazine: {
        container: `${baseClasses.container} min-h-[800px]`,
        imageClass: `${baseClasses.imageContainer} flex-shrink-0 min-h-[250px] max-h-[350px]`,
        textClass: `${baseClasses.textContainer} flex-grow overflow-y-auto`,
        titleClass: `${baseClasses.titleContainer} text-2xl tracking-tight`
      },
      minimal: {
        container: `${baseClasses.container} min-h-[800px]`,
        imageClass: `${baseClasses.imageContainer} flex-shrink-0 min-h-[200px] max-h-[300px]`,
        textClass: `${baseClasses.textContainer} flex-grow overflow-y-auto`,
        titleClass: `${baseClasses.titleContainer} font-light`
      }
    };

    const template = templates[style] || templates.modern;
    const isLandscape = orientation === 'landscape';

    // Adjust container class based on orientation
    let containerClass = template.container;
    if (isLandscape) {
      containerClass = containerClass.replace('flex-col', 'grid grid-cols-2 gap-4');
    }

    // Adjust image container based on count and orientation
    let imageClass = template.imageClass;
    if (imageCount > 1) {
      imageClass = imageClass.replace('min-h-[300px]', 'min-h-[200px]');
      if (isLandscape) {
        imageClass += ' grid grid-cols-2';
      }
    }

    return {
      ...template,
      container: containerClass,
      imageClass: imageClass
    };
  };

  // Generate page layouts with placeholder images
  const generateLayoutPreview = () => {
    setIsLoading(true);
    // Create mock pages with layout and placeholder images
    setTimeout(() => {
      const pages = Array(layoutOptions.totalPages).fill(null).map((_, i) => ({
        id: i,
        title: `Page ${i + 1}`, // Add default title
        layout: layoutOptions.layoutStyle,
        orientation: layoutOptions.orientation,
        images: Array(layoutOptions.imagesPerPage).fill(null).map((_, j) => ({
          id: `img-${i}-${j}`,
          prompt: imagePrompts[j % imagePrompts.length] || "Default image prompt",
          url: 'https://placehold.co/600x400/gray/white?text=Placeholder+Image'
        })),
        text: generatedText,
        textDisplay: 'compact' // Default text display mode
      }));
      
      setGeneratedPages(pages);
      setIsLoading(false);
      setStep(4); // Move to layout preview step
    }, 1500);
  };

  // Edit individual page layout
  const startEditingPage = (pageId: number) => {
    const page = generatedPages.find(p => p.id === pageId);
    if (page) {
      setCurrentPageLayoutOptions({
        layout: page.layout,
        imagesPerPage: page.images.length,
        textDisplay: page.textDisplay || 'compact' // Use existing value or default to 'compact'
      });
      setEditingPageId(pageId);
    }
  };

  // Update individual page layout
  const updatePageLayout = () => {
    if (editingPageId === null) return;
    
    setGeneratedPages(pages => 
      pages.map(page => 
        page.id === editingPageId 
          ? {
              ...page,
              layout: currentPageLayoutOptions.layout,
              orientation: generatedPages[editingPageId].orientation, // Preserve any orientation changes
              images: Array(currentPageLayoutOptions.imagesPerPage).fill(null).map((_, j) => {
                // Keep existing images if available, otherwise create new ones
                return j < page.images.length 
                  ? page.images[j] 
                  : {
                      id: `img-${page.id}-${j}`,
                      prompt: imagePrompts[j % imagePrompts.length] || "Default image prompt",
                      url: 'https://placehold.co/600x400/gray/white?text=Placeholder+Image'
                    };
              }),
              textDisplay: currentPageLayoutOptions.textDisplay // Store the text display option
            }
          : page
      )
    );
    
    setEditingPageId(null);
  };

  // Generate final document with real images
  const generateFinalDocument = () => {
    setIsLoading(true);
    // Prepare pages with placeholder images first
    const pages = generatedPages.map(page => ({
      ...page,
      images: page.images.map(img => ({
        ...img,
        url: 'https://placehold.co/600x400/gray/white?text=Waiting+To+Generate'
      }))
    }));
    setGeneratedPages(pages);
    setCurrentImageIndex(0);
    setCurrentPageIndex(0);
    setSequentialGenerationComplete(false);
    setIsLoading(false);
    setStep(5);
  };

  // Update the generateImageWithTogether function to use our API route
  const generateImageWithTogether = async (prompt: string): Promise<string> => {
    console.log(`Generating image for prompt: ${prompt}`);
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      if (data.data && data.data.length > 0) {
        return "data:image/png;base64," + data.data[0].b64_json;
      }

      throw new Error('No image data received');
    } catch (error) {
      console.error("Error generating image with Together API:", error);
      return 'https://placehold.co/600x400/ff0000/white?text=Error+Generating+Image';
    }
  };

  // Update the generateNextImage function to use the Together API integration
  const generateNextImage = async () => {
    if (currentPageIndex >= generatedPages.length) {
      setSequentialGenerationComplete(true);
      return;
    }

    const currentPage = generatedPages[currentPageIndex];
    if (currentImageIndex >= currentPage.images.length) {
      // Move to next page
      setCurrentPageIndex(prev => prev + 1);
      setCurrentImageIndex(0);
      return;
    }

    setIsLoading(true);
    
    try {
      // Get the current image prompt
      const currentPrompt = currentPage.images[currentImageIndex].prompt;
      
      // Call the Together API (mock)
      const imageUrl = await generateImageWithTogether(currentPrompt);
      
      // Update the generated pages with the new image
      setGeneratedPages(pages => 
        pages.map((page, pageIdx) => 
          pageIdx === currentPageIndex 
            ? {
                ...page,
                images: page.images.map((img, imgIdx) => 
                  imgIdx === currentImageIndex
                    ? { ...img, url: imageUrl }
                    : img
                )
              }
            : page
        )
      );
      
      setIsLoading(false);
      setCurrentImageIndex(prev => prev + 1);
    } catch (error) {
      console.error("Error generating image:", error);
      setIsLoading(false);
      // Show error state or fallback image
      setGeneratedPages(pages => 
        pages.map((page, pageIdx) => 
          pageIdx === currentPageIndex 
            ? {
                ...page,
                images: page.images.map((img, imgIdx) => 
                  imgIdx === currentImageIndex
                    ? { ...img, url: 'https://placehold.co/600x400/ff0000/white?text=Error+Generating+Image' }
                    : img
                )
              }
            : page
        )
      );
      // Still advance to next image
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  // Also update the regenerateImage function to use the Together API
  const regenerateImage = async (pageId: number, imageId: string) => {
    // Find the image to regenerate
    const page = generatedPages.find(p => p.id === pageId);
    if (!page) return;
    
    const image = page.images.find(img => img.id === imageId);
    if (!image) return;
    
    setIsLoading(true);
    
    try {
      // Call the Together API with the image prompt
      const imageUrl = await generateImageWithTogether(image.prompt);
      
      // Update the generated pages with the new image
      setGeneratedPages(pages => 
        pages.map(page => 
          page.id === pageId 
            ? {
                ...page,
                images: page.images.map(img => 
                  img.id === imageId 
                    ? { ...img, url: imageUrl }
                    : img
                )
              }
            : page
        )
      );
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error regenerating image:", error);
      setIsLoading(false);
      // Show error state
      setGeneratedPages(pages => 
        pages.map(page => 
          page.id === pageId 
            ? {
                ...page,
                images: page.images.map(img => 
                  img.id === imageId 
                    ? { ...img, url: 'https://placehold.co/600x400/ff0000/white?text=Error+Regenerating+Image' }
                    : img
                )
              }
            : page
        )
      );
    }
  };

  // Add a helper function to determine the expanded text container class
  const getExpandedTextContainerClass = (template: LayoutTemplate, textLength: number): string => {
    const baseClasses = 'prose prose-sm max-w-none p-4 text-gray-800';
    const overflowClasses = 'overflow-y-auto';
    
    // Determine height based on text length
    let heightClass = 'min-h-[300px] flex-grow';
    if (textLength > 1000) {
      heightClass = 'min-h-[400px] flex-grow';
    } else if (textLength > 2000) {
      heightClass = 'min-h-[500px] flex-grow';
    }

    return `${template.textClass} ${baseClasses} ${overflowClasses} ${heightClass}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800">Image Document Generator</h1>
          <p className="text-gray-700 mt-1">Create beautiful documents with AI-generated images</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((num) => (
              <div 
                key={num} 
                className={`rounded-full h-10 w-10 flex items-center justify-center ${
                  step >= num ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm font-medium text-gray-700">
            <span>Input</span>
            <span>Analysis</span>
            <span>Layout</span>
            <span>Preview</span>
            <span>Generate</span>
          </div>
        </div>

        {/* Step 1: Text Input */}
        {step === 1 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Provide Your Content</h2>
            
            <div className="flex space-x-4 mb-6">
              <button
                className={`px-4 py-2 rounded-lg ${
                  inputType === 'prompt' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => setInputType('prompt')}
              >
                Use Prompt
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  inputType === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => setInputType('file')}
              >
                Upload File
              </button>
            </div>

            {inputType === 'prompt' && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your topic or description:
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 h-40"
                  placeholder="Describe your topic in detail... (e.g., 'A comprehensive guide to sustainable living in urban environments')"
                  value={userPrompt}
                  onChange={handlePromptChange}
                ></textarea>
                <button
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                  onClick={generateContentFromPrompt}
                  disabled={!userPrompt.trim() || isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate Content'}
                </button>
              </>
            )}

            {inputType === 'file' && (
              <>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="space-y-4">
                    <p className="text-gray-700">Upload a text file (.txt, .docx, etc.)</p>
                    <input
                      type="file"
                      accept=".txt,.doc,.docx,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer inline-block"
                    >
                      Browse Files
                    </label>
                    {fileUploaded && <p className="text-green-500">File uploaded successfully!</p>}
                  </div>
                </div>
                <button
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                  onClick={analyzeUploadedText}
                  disabled={!fileUploaded || isLoading}
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Content'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 2: Analysis */}
        {step === 2 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Content Analysis</h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Generated Content</h3>
              <div className="border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto text-gray-800">
                {generatedText}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Suggested Image Concepts</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-800">
                {imagePrompts.map((prompt, index) => (
                  <li key={index}>{prompt}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-gray-800"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                onClick={() => setStep(3)}
              >
                Continue to Layout Options
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Layout Options */}
        {step === 3 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Layout Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orientation
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-800"
                  value={layoutOptions.orientation}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => updateLayoutOption('orientation', e.target.value)}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout Style
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-800"
                  value={layoutOptions.layoutStyle}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => updateLayoutOption('layoutStyle', e.target.value)}
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                  <option value="magazine">Magazine</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Pages
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-800"
                  value={layoutOptions.totalPages}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateLayoutOption('totalPages', parseInt(e.target.value) || 1)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images Per Page (Default)
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-800"
                  value={layoutOptions.imagesPerPage}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateLayoutOption('imagesPerPage', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-gray-800"
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                onClick={generateLayoutPreview}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Preview Layout'}
              </button>
            </div>
        </div>
        )}

        {/* Step 4: Layout Preview */}
        {step === 4 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Layout Preview</h2>
            <p className="text-gray-800 mb-6">Review and customize the layout of each page before generating images.</p>
            
            {editingPageId !== null ? (
              <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200">
                <h3 className="text-lg font-bold mb-4">Edit Page {editingPageId + 1} Layout</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Layout Style
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2 text-gray-800"
                      value={currentPageLayoutOptions.layout}
                      onChange={(e) => setCurrentPageLayoutOptions(prev => ({...prev, layout: e.target.value}))}
                    >
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="minimal">Minimal</option>
                      <option value="magazine">Magazine</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images Per Page
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      className="w-full border border-gray-300 rounded-lg p-2 text-gray-800"
                      value={currentPageLayoutOptions.imagesPerPage}
                      onChange={(e) => setCurrentPageLayoutOptions(prev => ({
                        ...prev, 
                        imagesPerPage: parseInt(e.target.value) || 1
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orientation
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2 text-gray-800"
                      value={generatedPages[editingPageId].orientation}
                      onChange={(e) => {
                        setGeneratedPages(pages => 
                          pages.map((page, i) => 
                            i === editingPageId 
                              ? {...page, orientation: e.target.value}
                              : page
                          )
                        );
                      }}
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Content Display
                  </label>
                  <div className="flex space-x-3">
                    <button 
                      className={`px-3 py-1 rounded ${currentPageLayoutOptions.textDisplay === 'compact' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                      onClick={() => setCurrentPageLayoutOptions(prev => ({...prev, textDisplay: 'compact'}))}
                    >
                      Compact
                    </button>
                    <button 
                      className={`px-3 py-1 rounded ${currentPageLayoutOptions.textDisplay === 'expanded' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                      onClick={() => setCurrentPageLayoutOptions(prev => ({...prev, textDisplay: 'expanded'}))}
                    >
                      Expanded
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-gray-800"
                    onClick={() => setEditingPageId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    onClick={updatePageLayout}
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            ) : null}
            
            {generatedPages.map((page, pageIndex) => {
              const template = getLayoutTemplate(page.layout, page.orientation, page.images.length);
              
              // Create a title from the text content if possible
              const title = (() => {
                const firstLine = page.text.split('\n')[0];
                if (firstLine.startsWith('#')) {
                  return firstLine.replace(/^#+\s*/, '');
                }
                
                // Look for potential title in first paragraph
                const firstWords = page.text.split(/\s+/).slice(0, 5).join(' ');
                return firstWords.length > 20 ? firstWords.substring(0, 20) + '...' : firstWords;
              })();
              
              // Determine text length to adjust layout proportions
              const textLength = page.text.length;
              const isTextHeavy = textLength > 500;
              
              // Adjust image container height based on text length
              const imageContainerClass = page.images.length > 2
                ? template.imageClass.replace(
                    /h-\[\d+%\]/g,
                    isTextHeavy ? 'min-h-[35%] max-h-[45%]' : 'min-h-[45%] max-h-[55%]'
                  )
                : isTextHeavy 
                  ? template.imageClass.replace(/h-\[\d+%\]/g, 'min-h-[30%] max-h-[40%]')
                  : template.imageClass;
              
              // Adjust text container height accordingly
              const textContainerClass = getExpandedTextContainerClass(template, textLength);
              
              return (
                <div 
                  key={pageIndex} 
                  className={`border rounded-lg p-4 mb-8 ${
                    page.orientation === 'landscape' 
                      ? 'aspect-[16/9] min-h-[400px] max-h-[600px]' 
                      : 'aspect-[9/16] min-h-[600px] max-h-[800px]'
                  } w-full max-w-2xl mx-auto relative flex flex-col overflow-hidden`}
                >
                  <button
                    className="absolute top-2 right-2 z-10 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                    onClick={() => startEditingPage(page.id)}
                  >
                    Edit Layout
                  </button>
                  
                  <div className={template.container}>
                    <h3 className={template.titleClass}>{title}</h3>
                    
                    <div className={imageContainerClass}>
                      {page.images.map((image, imgIndex) => (
                        <div key={image.id} className="relative h-full">
          <Image
                            src={image.url} 
                            alt={`Generated image ${imgIndex + 1}`}
                            className={`w-full h-full object-cover rounded-md ${
                              pageIndex === currentPageIndex && imgIndex === currentImageIndex ? 'ring-2 ring-green-500' : ''
                            }`}
                            width={600}
                            height={400}
                            unoptimized={image.url.startsWith('data:')} // For base64 images
                          />
                          {(sequentialGenerationComplete || (pageIndex < currentPageIndex || (pageIndex === currentPageIndex && imgIndex < currentImageIndex))) && (
                            <button
                              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                              onClick={() => regenerateImage(page.id, image.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          )}
                          <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1 text-xs truncate">
                            {image.prompt}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className={textContainerClass}>
                      {page.text.split('\n\n').map((paragraph, i) => {
                        // Handle headers
                        if (paragraph.startsWith('# ')) {
                          return <h1 key={i} className="text-xl font-bold mt-2 mb-2">{paragraph.substring(2)}</h1>;
                        } else if (paragraph.startsWith('## ')) {
                          return <h2 key={i} className="text-lg font-semibold mt-2 mb-2">{paragraph.substring(3)}</h2>;
                        } else if (paragraph.startsWith('### ')) {
                          return <h3 key={i} className="text-md font-semibold mt-2 mb-1">{paragraph.substring(4)}</h3>;
                        }
                        // Regular paragraph
                        return <p key={i} className="mb-2">{paragraph}</p>;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between mt-6">
              <button
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-gray-800"
                onClick={() => setStep(3)}
              >
                Back to Layout Options
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                onClick={generateFinalDocument}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Images'}
              </button>
            </div>
          </div>
        )}
        
        {/* Step 5: Final Document with Generated Images */}
        {step === 5 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Generated Document</h2>
            <p className="text-gray-800 mb-6">Generate each image sequentially.</p>
            
            {!sequentialGenerationComplete && currentPageIndex < generatedPages.length && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                <h3 className="text-lg font-medium mb-2 text-gray-800">
                  Generating Page {currentPageIndex + 1}, Image {currentImageIndex + 1}
                </h3>
                <p className="text-gray-800 mb-4">
                  Review and accept each generated image before proceeding to the next.
                </p>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg mr-3"
                  onClick={generateNextImage}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate Next Image'}
                </button>
              </div>
            )}
            
            {generatedPages.map((page, pageIndex) => {
              const template = getLayoutTemplate(page.layout, page.orientation, page.images.length);
              
              // Create a title from the text content if possible
              const title = (() => {
                const firstLine = page.text.split('\n')[0];
                if (firstLine.startsWith('#')) {
                  return firstLine.replace(/^#+\s*/, '');
                }
                
                // Look for potential title in first paragraph
                const firstWords = page.text.split(/\s+/).slice(0, 5).join(' ');
                return firstWords.length > 20 ? firstWords.substring(0, 20) + '...' : firstWords;
              })();
              
              // Determine text length to adjust layout proportions
              const textLength = page.text.length;
              const isTextHeavy = textLength > 500;
              
              // Adjust image container height based on text length
              const imageContainerClass = page.images.length > 2
                ? template.imageClass.replace(
                    /h-\[\d+%\]/g,
                    isTextHeavy ? 'min-h-[35%] max-h-[45%]' : 'min-h-[45%] max-h-[55%]'
                  )
                : isTextHeavy 
                  ? template.imageClass.replace(/h-\[\d+%\]/g, 'min-h-[30%] max-h-[40%]')
                  : template.imageClass;
              
              // Adjust text container height accordingly
              const textContainerClass = getExpandedTextContainerClass(template, textLength);
              
              return (
                <div 
                  key={pageIndex} 
                  className={`border rounded-lg p-4 mb-8 ${
                    page.orientation === 'landscape' 
                      ? 'aspect-[16/9] min-h-[400px] max-h-[600px]' 
                      : 'aspect-[9/16] min-h-[600px] max-h-[800px]'
                  } w-full max-w-2xl mx-auto relative flex flex-col overflow-hidden`}
                >
                  <button
                    className="absolute top-2 right-2 z-10 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                    onClick={() => startEditingPage(page.id)}
                  >
                    Edit Layout
                  </button>
                  
                  <div className={template.container}>
                    <h3 className={template.titleClass}>{title}</h3>
                    
                    <div className={imageContainerClass}>
                      {page.images.map((image, imgIndex) => (
                        <div key={image.id} className="relative h-full">
          <Image
                            src={image.url} 
                            alt={`Generated image ${imgIndex + 1}`}
                            className={`w-full h-full object-cover rounded-md ${
                              pageIndex === currentPageIndex && imgIndex === currentImageIndex ? 'ring-2 ring-green-500' : ''
                            }`}
                            width={600}
                            height={400}
                            unoptimized={image.url.startsWith('data:')} // For base64 images
                          />
                          {(sequentialGenerationComplete || (pageIndex < currentPageIndex || (pageIndex === currentPageIndex && imgIndex < currentImageIndex))) && (
                            <button
                              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                              onClick={() => regenerateImage(page.id, image.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          )}
                          <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1 text-xs truncate">
                            {image.prompt}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className={textContainerClass}>
                      {page.text.split('\n\n').map((paragraph, i) => {
                        // Handle headers
                        if (paragraph.startsWith('# ')) {
                          return <h1 key={i} className="text-xl font-bold mt-2 mb-2">{paragraph.substring(2)}</h1>;
                        } else if (paragraph.startsWith('## ')) {
                          return <h2 key={i} className="text-lg font-semibold mt-2 mb-2">{paragraph.substring(3)}</h2>;
                        } else if (paragraph.startsWith('### ')) {
                          return <h3 key={i} className="text-md font-semibold mt-2 mb-1">{paragraph.substring(4)}</h3>;
                        }
                        // Regular paragraph
                        return <p key={i} className="mb-2">{paragraph}</p>;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between mt-6">
              <button
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-gray-800"
                onClick={() => setStep(4)}
              >
                Back to Layout Preview
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                onClick={() => window.print()}
                disabled={!sequentialGenerationComplete}
              >
                Print to PDF
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
