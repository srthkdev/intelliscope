import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { ChatCompletionChunk, Stream } from 'groq-sdk/resources/chat/completions';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Groq API key is not configured' },
        { status: 500 }
      );
    }
    
    const groq = new Groq({ apiKey });
    
    // Create a TransformStream to handle the streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Start the response stream
    const response = NextResponse.json(
      { message: 'Streaming response' },
      { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
    
    response.body = stream.readable;
    
    // Process in the background
    (async () => {
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
        
        for await (const chunk of chatCompletion as Stream<ChatCompletionChunk>) {
          const content = chunk.choices[0]?.delta?.content || '';
          await writer.write(encoder.encode(content));
        }
      } catch (error) {
        console.error('Error streaming from Groq:', error);
        // Write error message to the stream
        const errorMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        await writer.write(encoder.encode(errorMessage));
      } finally {
        await writer.close();
      }
    })();
    
    return response;
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}