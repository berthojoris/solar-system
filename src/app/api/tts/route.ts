import { NextRequest, NextResponse } from 'next/server';
import { PlanetData } from '@/data/planetData';

interface TTSRequest {
  planetData: PlanetData;
  useIndonesian: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { planetData, useIndonesian }: TTSRequest = await request.json();

    if (!planetData) {
      return NextResponse.json({ error: 'Planet data is required' }, { status: 400 });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey || openRouterApiKey === 'your_openrouter_api_key_here') {
      console.error('OPENROUTER_API_KEY is not configured properly');
      return NextResponse.json({
        error: 'AI TTS service not configured. Please set OPENROUTER_API_KEY in .env.local file.'
      }, { status: 500 });
    }

    console.log('Starting TTS generation for planet:', planetData.name, 'Language:', useIndonesian ? 'Indonesian' : 'English');

    // Step 1: Use DeepSeek AI to enhance the narration text
    let enhancedText: string;
    try {
      enhancedText = await generateEnhancedNarration(planetData, useIndonesian, openRouterApiKey);
      console.log('Enhanced text generated successfully, length:', enhancedText.length);
    } catch (error) {
      console.error('DeepSeek generation failed:', error);
      enhancedText = generateBasicNarration(planetData, useIndonesian);
      console.log('Using fallback narration, length:', enhancedText.length);
    }

    // Step 2: Convert enhanced text to speech using OpenRouter TTS
    try {
      const audioBuffer = await generateSpeech(enhancedText, useIndonesian, openRouterApiKey);
      console.log('Speech generated successfully, buffer size:', audioBuffer.byteLength);

      // Step 3: Return audio as response
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } catch (speechError) {
      console.error('Speech generation failed:', speechError);
      return NextResponse.json({
        error: 'Failed to generate speech audio: ' + (speechError instanceof Error ? speechError.message : 'Unknown error')
      }, { status: 500 });
    }

  } catch (error) {
    console.error('TTS API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        error: 'TTS API failed: ' + errorMessage,
        details: error instanceof Error ? error.stack : 'No additional details'
      },
      { status: 500 }
    );
  }
}

async function generateEnhancedNarration(
  planetData: PlanetData,
  useIndonesian: boolean,
  apiKey: string
): Promise<string> {
  const name = useIndonesian ? planetData.nameId : planetData.name;
  const description = useIndonesian ? planetData.descriptionId : planetData.description;
  const facts = useIndonesian ? planetData.factsId : planetData.facts;

  const language = useIndonesian ? 'Bahasa Indonesia' : 'English';
  const targetAudience = useIndonesian ? 'anak-anak Indonesia' : 'children';

  const prompt = `
Create an engaging, educational narration about ${name} for ${targetAudience}.
The narration should be:
- Written in ${language}
- Friendly and enthusiastic tone suitable for children aged 6-12
- Include natural pauses and emphasis
- Educational but fun and memorable
- About 2-3 minutes when spoken aloud

Planet Information:
- Name: ${name}
- Description: ${description}
- Facts: ${facts.join(', ')}

Structure the narration as:
1. Exciting introduction with greeting
2. Brief description
3. 3-4 amazing facts presented in an engaging way
4. Encouraging conclusion that sparks curiosity about space

Make it sound like a friendly teacher or science show host speaking to children. Use exclamations, questions, and wonder to keep children engaged.

${useIndonesian ? 'Tulis dalam bahasa Indonesia yang mudah dipahami anak-anak.' : 'Write in simple English that children can easily understand.'}
`;

  try {
    console.log('Calling DeepSeek API...');
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Solar System Explorer'
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an expert educational content creator specializing in children's science content. Create engaging, age-appropriate narrations about space and planets.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.8
      })
    });

    console.log('DeepSeek API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error response:', errorText);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('DeepSeek API response received');

    const enhancedText = data.choices[0]?.message?.content?.trim();

    if (!enhancedText) {
      throw new Error('No content generated from DeepSeek');
    }

    console.log('Enhanced text generated successfully');
    return enhancedText;

  } catch (error) {
    console.error('DeepSeek generation error:', error);
    // Fallback to basic narration
    console.log('Using fallback basic narration');
    return generateBasicNarration(planetData, useIndonesian);
  }
}

async function generateSpeech(
  text: string,
  useIndonesian: boolean,
  apiKey: string
): Promise<ArrayBuffer> {
  try {
    console.log('Calling TTS API with text length:', text.length);

    // Note: OpenRouter may not have a direct TTS endpoint
    // Let's try the OpenAI-compatible endpoint first
    const response = await fetch('https://openrouter.ai/api/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Solar System Explorer'
      },
      body: JSON.stringify({
        model: process.env.TTS_MODEL || 'openai/tts-1',
        input: text,
        voice: process.env.TTS_VOICE || 'nova',
        response_format: 'mp3',
        speed: parseFloat(process.env.TTS_SPEED || '0.85')
      })
    });

    console.log('TTS API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TTS API error response:', errorText);

      // If OpenRouter TTS fails, try direct OpenAI API as fallback
      console.log('Trying direct OpenAI TTS as fallback...');
      return await generateSpeechOpenAI(text, useIndonesian, apiKey);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('TTS generation successful, buffer size:', arrayBuffer.byteLength);
    return arrayBuffer;

  } catch (error) {
    console.error('TTS generation error:', error);
    // Try fallback to OpenAI direct
    console.log('Attempting OpenAI direct fallback...');
    try {
      return await generateSpeechOpenAI(text, useIndonesian, apiKey);
    } catch (fallbackError) {
      console.error('Fallback TTS also failed:', fallbackError);
      throw new Error(`TTS generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Fallback function to use OpenAI directly (if user has OpenAI API key)
async function generateSpeechOpenAI(
  text: string,
  useIndonesian: boolean,
  apiKey: string
): Promise<ArrayBuffer> {
  // This is a fallback - user would need OpenAI API key for this to work
  // For now, we'll generate a simple text-based audio response
  throw new Error('Direct OpenAI TTS fallback not implemented. Please check your OpenRouter API key and TTS model configuration.');
}

// Fallback function for basic narration
function generateBasicNarration(planetData: PlanetData, useIndonesian: boolean): string {
  const name = useIndonesian ? planetData.nameId : planetData.name;
  const description = useIndonesian ? planetData.descriptionId : planetData.description;
  const facts = useIndonesian ? planetData.factsId : planetData.facts;

  const introduction = useIndonesian
    ? `Halo teman-teman! Ayo kita jelajahi ${name}! ${description}`
    : `Hello friends! Let's explore ${name}! ${description}`;

  const factsIntro = useIndonesian
    ? "Mari kita pelajari fakta-fakta menakjubkan berikut:"
    : "Let's learn these amazing facts:";

  const factsList = facts.map((fact: string, index: number) => {
    const factNumber = useIndonesian ? `Fakta ke-${index + 1}` : `Fact number ${index + 1}`;
    return `${factNumber}: ${fact}`;
  }).join(' ');

  const conclusion = useIndonesian
    ? `Wah, sungguh menakjubkan sekali ya ${name}! Ayo terus belajar tentang tata surya kita yang luar biasa! Sampai jumpa di petualangan luar angkasa berikutnya!`
    : `Wow, how amazing ${name} is! Keep exploring our incredible solar system! See you on the next space adventure!`;

  return `${introduction} ${factsIntro} ${factsList} ${conclusion}`;
}