import '@/ai/dev';
import { NextRequest, NextResponse } from 'next/server';

// Temporary placeholder - you may need to update this based on your Genkit version
export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'Genkit endpoint' });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'Genkit endpoint' });
}
