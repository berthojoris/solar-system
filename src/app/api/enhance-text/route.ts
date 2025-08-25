import { NextRequest, NextResponse } from 'next/server';
import { PlanetData } from '@/data/planetData';

interface EnhanceTextRequest {
  planetData: PlanetData;
  useIndonesian: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { planetData, useIndonesian }: EnhanceTextRequest = await request.json();

    if (!planetData) {
      return NextResponse.json({ error: 'Planet data is required' }, { status: 400 });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey || openRouterApiKey === 'your_openrouter_api_key_here') {
      console.log('OpenRouter API key not configured, using basic narration');
      return NextResponse.json({
        enhancedText: generateBasicNarration(planetData, useIndonesian)
      });
    }

    try {
      // Use DeepSeek AI to enhance the narration text
      const enhancedText = await generateEnhancedNarration(planetData, useIndonesian, openRouterApiKey);

      return NextResponse.json({
        enhancedText,
        source: 'ai'
      });

    } catch (error) {
      console.error('AI text enhancement failed:', error);
      // Fallback to basic narration
      return NextResponse.json({
        enhancedText: generateBasicNarration(planetData, useIndonesian),
        source: 'fallback'
      });
    }

  } catch (error) {
    console.error('Text enhancement API Error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance text' },
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const enhancedText = data.choices[0]?.message?.content?.trim();

  if (!enhancedText) {
    throw new Error('No content generated from DeepSeek');
  }

  return enhancedText;
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