import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/lib/models/Project';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // For this proof of concept, we just use the first project document or create it
    let project = await Project.findOne();
    if (!project) {
      project = await Project.create({ title: 'Pen Pals Project', wordCountTarget: 50000, acts: ['Act 1', 'Act 2', 'Act 3'] });
    }
    
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    let project = await Project.findOne();
    if (!project) {
      project = await Project.create({ title: 'Pen Pals Project', wordCountTarget: 50000, acts: ['Act 1', 'Act 2', 'Act 3'] });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      project._id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, data: updatedProject });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update project' }, { status: 500 });
  }
}
