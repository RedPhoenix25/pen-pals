import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import VersionModel from '@/lib/models/Version';
import ChapterModel from '@/lib/models/Chapter';

// GET /api/versions/[id] — get full content of a specific version
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await dbConnect();
  const version = await VersionModel.findById(id);
  if (!version) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(version);
}

// POST /api/versions/[id]/restore — restore chapter content to this version
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  const version = await VersionModel.findById(id);
  if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 });

  // Restore the chapter content
  const chapter = await ChapterModel.findByIdAndUpdate(
    version.chapterId,
    { content: version.content },
    { new: true }
  );

  if (!chapter) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });

  return NextResponse.json({ success: true, chapter });
}
