import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import CommentModel from '@/lib/models/Comment';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  const comment = await CommentModel.findOne({ commentId: id });
  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  if (comment.authorId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden: You can only delete your own comments' }, { status: 403 });
  }

  await CommentModel.findOneAndDelete({ commentId: id });
  return NextResponse.json({ success: true });
}
