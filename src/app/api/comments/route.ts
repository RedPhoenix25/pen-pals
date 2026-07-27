import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import CommentModel from '@/lib/models/Comment';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const chapterId = req.nextUrl.searchParams.get('chapterId');
  if (!chapterId) return NextResponse.json({ error: 'chapterId is required' }, { status: 400 });

  await dbConnect();
  const comments = await CommentModel.find({ chapterId, resolved: false }).sort({ createdAt: -1 });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { chapterId, projectId, text, from, to, commentId } = await req.json();
  if (!chapterId || !projectId || !text) {
    return NextResponse.json({ error: 'chapterId, projectId, and text are required' }, { status: 400 });
  }

  await dbConnect();
  const comment = await CommentModel.create({
    chapterId,
    projectId,
    authorId: session.user.id,
    authorName: session.user.name || 'Anonymous',
    text,
    from: from || 0,
    to: to || 0,
    commentId,
  });

  return NextResponse.json(comment, { status: 201 });
}
