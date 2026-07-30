import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import NotificationModel from '@/lib/models/Notification';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const notifications = await NotificationModel.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(20);

  return NextResponse.json(notifications);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ids } = await req.json(); // array of notification IDs to mark as read
  await dbConnect();

  if (ids && ids.length > 0) {
    await NotificationModel.updateMany(
      { _id: { $in: ids }, userId: session.user.id },
      { $set: { read: true } }
    );
  } else {
    // Mark all as read
    await NotificationModel.updateMany(
      { userId: session.user.id, read: false },
      { $set: { read: true } }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const id = req.nextUrl.searchParams.get('id');

  if (id) {
    await NotificationModel.deleteOne({ _id: id, userId: session.user.id });
  } else {
    // Delete all notifications for current user
    await NotificationModel.deleteMany({ userId: session.user.id });
  }

  return NextResponse.json({ success: true });
}
