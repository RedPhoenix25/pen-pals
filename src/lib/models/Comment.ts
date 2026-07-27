import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  chapterId: string;
  projectId: string;
  authorId: string;
  authorName: string;
  text: string;
  from: number;
  to: number;
  commentId: string;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    chapterId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    text: { type: String, required: true },
    from: { type: Number, required: true },
    to: { type: Number, required: true },
    commentId: { type: String, required: true },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
