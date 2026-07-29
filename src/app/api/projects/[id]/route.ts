import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ProjectModel from '@/lib/models/Project';
import UserModel from '@/lib/models/User';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await dbConnect();
  const project = await ProjectModel.findById(id);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const userId = session.user.id;
  const hasAccess =
    project.ownerId === userId ||
    project.collaborators.some((c: { userId: string }) => c.userId === userId);
  if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Fetch emails for the collaborators so the frontend can display them nicely
  const collaboratorUserIds = project.collaborators.map((c: any) => c.userId);
  const users = await UserModel.find({ _id: { $in: collaboratorUserIds } }, 'email');
  
  const enrichedProject = project.toObject();
  enrichedProject.collaborators = enrichedProject.collaborators.map((c: any) => {
    const user = users.find(u => u._id.toString() === c.userId);
    return { ...c, email: user ? user.email : c.userId };
  });

  return NextResponse.json(enrichedProject);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  await dbConnect();

  const project = await ProjectModel.findById(id);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (project.ownerId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const updated = await ProjectModel.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(updated);
}

import ChapterModel from '@/lib/models/Chapter';
import CharacterModel from '@/lib/models/Character';
import StoryboardEventModel from '@/lib/models/StoryboardEvent';
import CommentModel from '@/lib/models/Comment';
import VersionModel from '@/lib/models/Version';

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  const project = await ProjectModel.findById(id);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (project.ownerId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Cascade delete all associated data
  await Promise.all([
    ChapterModel.deleteMany({ projectId: id }),
    CharacterModel.deleteMany({ projectId: id }),
    StoryboardEventModel.deleteMany({ projectId: id }),
    CommentModel.deleteMany({ projectId: id }),
    VersionModel.deleteMany({ projectId: id })
  ]);

  await ProjectModel.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
