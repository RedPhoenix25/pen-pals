import mongoose, { Schema, Document } from 'mongoose';

export interface IVersion extends Document {
  chapterId: string;
  projectId: string;
  authorId: string;
  authorName: string;
  content: string;
  wordCount: number;
  label: string;
  createdAt: Date;
  updatedAt: Date;
}

const VersionSchema: Schema = new Schema(
  {
    chapterId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    wordCount: { type: Number, default: 0 },
    label: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Version || mongoose.model<IVersion>('Version', VersionSchema);
