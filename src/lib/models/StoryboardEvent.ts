import mongoose, { Schema, Document } from 'mongoose';

export interface IStoryboardEvent extends Document {
  title: string;
  description: string;
  order: number;
  act: string;
  status: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoryboardEventSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    act: { type: String, default: 'Act 1' },
    status: { type: String, default: 'Idea' },
    projectId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.StoryboardEvent || mongoose.model<IStoryboardEvent>('StoryboardEvent', StoryboardEventSchema);
