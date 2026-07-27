import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const user = await UserModel.findById(session.user.id).select('-passwordHash');
  
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, image, currentPassword, newPassword } = body;

  await dbConnect();
  const user = await UserModel.findById(session.user.id);
  
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Update profile fields
  if (name) user.name = name.trim();
  if (image !== undefined) user.image = image; // Allow empty string to clear image

  // Update password if requested
  if (newPassword) {
    if (user.provider !== 'credentials') {
      return NextResponse.json({ error: 'Cannot change password for OAuth accounts' }, { status: 400 });
    }
    
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
    }
    
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash || '');
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 403 });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await user.save();
  
  const updatedUser = user.toObject();
  delete updatedUser.passwordHash;
  
  return NextResponse.json(updatedUser);
}
