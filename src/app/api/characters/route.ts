import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Character from '@/lib/models/Character';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get('projectId');
  if (!projectId) return NextResponse.json({ error: 'projectId is required' }, { status: 400 });

  await dbConnect();
  try {
    const characters = await Character.find({ projectId }).sort({ createdAt: -1 });
    return NextResponse.json(characters);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  try {
    const body = await req.json();
    if (!body.projectId) return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    const character = await Character.create(body);
    return NextResponse.json(character, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}
