import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import StoryboardEvent from '@/lib/models/StoryboardEvent';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await request.json();
    const event = await StoryboardEvent.findByIdAndUpdate(id, body, { new: true });
    if (!event) {
      return NextResponse.json({ error: 'Storyboard event not found' }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update storyboard event' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    const event = await StoryboardEvent.findByIdAndDelete(id);
    if (!event) {
      return NextResponse.json({ error: 'Storyboard event not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Storyboard event deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete storyboard event' }, { status: 500 });
  }
}
