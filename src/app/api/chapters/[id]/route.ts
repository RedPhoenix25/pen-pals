import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chapter from '@/lib/models/Chapter';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await request.json();
    const chapter = await Chapter.findByIdAndUpdate(id, body, { new: true });
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
    return NextResponse.json(chapter);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    const chapter = await Chapter.findByIdAndDelete(id);
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Chapter deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
}
