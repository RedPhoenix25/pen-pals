import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import VersionModel from '@/lib/models/Version';

// GET /api/versions?chapterId=... — list versions for a chapter
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const chapterId = req.nextUrl.searchParams.get('chapterId');
  if (!chapterId) return NextResponse.json({ error: 'chapterId is required' }, { status: 400 });

  await dbConnect();
  const versions = await VersionModel.find({ chapterId })
    .sort({ createdAt: -1 })
    .select('-content'); // Don't send full content in list view — only on detail

  return NextResponse.json(versions);
}

// POST /api/versions — save a new version snapshot
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { chapterId, projectId, content, wordCount, label } = await req.json();
  if (!chapterId || !projectId || !content) {
    return NextResponse.json({ error: 'chapterId, projectId, and content are required' }, { status: 400 });
  }

  await dbConnect();
  const version = await VersionModel.create({
    chapterId,
    projectId,
    authorId: session.user.id,
    authorName: session.user.name || 'Unknown',
    content,
    wordCount: wordCount || 0,
    label: label || '',
  });

  return NextResponse.json(version, { status: 201 });
}
