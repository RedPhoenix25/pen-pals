import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Character from '@/lib/models/Character';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await request.json();
    const character = await Character.findByIdAndUpdate(id, body, { new: true });
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    return NextResponse.json(character);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    const character = await Character.findByIdAndDelete(id);
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Character deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
}
