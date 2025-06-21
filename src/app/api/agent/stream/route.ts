import { NextRequest } from 'next/server';
import { Groq } from 'groq-sdk';
import { ChatCompletionChunk } from 'groq-sdk/resources/chat/completions';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Groq API key is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const groq = new Groq({ apiKey });
    const encoder = new TextEncoder();
    // Use a ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
          stream: true,
          stop: null
        });
          for await (const chunk of chatCompletion as AsyncIterable<ChatCompletionChunk>) {
          const content = chunk.choices[0]?.delta?.content || '';
            controller.enqueue(encoder.encode(content));
        }
      } catch (error) {
        const errorMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
          controller.enqueue(encoder.encode(errorMessage));
      } finally {
          controller.close();
      }
      }
    });
    return new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}