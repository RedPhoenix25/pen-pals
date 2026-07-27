import mongoose, { Schema, Document } from 'mongoose';

export interface IChapter extends Document {
  title: string;
  content: string;
  order: number;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: '' },
    order: { type: Number, default: 0 },
    projectId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Chapter || mongoose.model<IChapter>('Chapter', ChapterSchema);
