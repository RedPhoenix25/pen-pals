import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ProjectModel from '@/lib/models/Project';
import UserModel from '@/lib/models/User';
import NotificationModel from '@/lib/models/Notification';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { email, role } = await req.json();

  if (!email || !role) return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });

  await dbConnect();
  const project = await ProjectModel.findById(id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  if (project.ownerId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const invitedUser = await UserModel.findOne({ email: email.toLowerCase() });
  if (!invitedUser) return NextResponse.json({ error: 'No user found with that email' }, { status: 404 });

  const alreadyCollaborator = project.collaborators.some(
    (c: { userId: string }) => c.userId === invitedUser._id.toString()
  );
  if (alreadyCollaborator) return NextResponse.json({ error: 'User is already a collaborator' }, { status: 409 });

  project.collaborators.push({ userId: invitedUser._id.toString(), role });
  await project.save();

  // Create in-app notification for the invited user
  await NotificationModel.create({
    userId: invitedUser._id.toString(),
    type: 'project_invite',
    message: `${session.user.name} invited you to collaborate on "${project.title}"`,
    link: `/editor/${project._id}`,
  });

  return NextResponse.json({ success: true, collaborators: project.collaborators });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { userId } = await req.json();

  await dbConnect();
  const project = await ProjectModel.findById(id);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (project.ownerId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  project.collaborators = project.collaborators.filter(
    (c: { userId: any }) => c.userId.toString() !== userId
  );
  await project.save();

  // Create in-app notification for the removed user
  await NotificationModel.create({
    userId: userId,
    type: 'project_removed',
    message: `${session.user.name} removed you from "${project.title}"`,
    link: `/dashboard`,
  });

  return NextResponse.json({ success: true });
}
