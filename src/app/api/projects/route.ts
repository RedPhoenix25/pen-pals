import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ProjectModel from '@/lib/models/Project';

// GET /api/projects — list all projects the current user owns or is a collaborator on
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const userId = session.user.id;
  const projects = await ProjectModel.find({
    $or: [{ ownerId: userId }, { 'collaborators.userId': userId }],
  }).sort({ updatedAt: -1 });

  return NextResponse.json(projects);
}

// POST /api/projects — create a new project
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, description, coverColor } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  await dbConnect();
  const project = await ProjectModel.create({
    title: title.trim(),
    description: description || '',
    ownerId: session.user.id,
    coverColor: coverColor || '#44403c',
    collaborators: [],
  });

  return NextResponse.json(project, { status: 201 });
}
