import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Chapter from '@/lib/models/Chapter';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get('projectId');
  if (!projectId) return NextResponse.json({ error: 'projectId is required' }, { status: 400 });

  await dbConnect();
  try {
    const chapters = await Chapter.find({ projectId }).sort({ order: 1 });
    return NextResponse.json(chapters);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  try {
    const body = await req.json();
    if (!body.projectId) return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    const chapter = await Chapter.create(body);
    return NextResponse.json(chapter, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}
