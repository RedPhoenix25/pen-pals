import mongoose, { Schema, Document } from 'mongoose';

export interface ICollaborator {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface IProject extends Document {
  title: string;
  description: string;
  ownerId: string;
  collaborators: ICollaborator[];
  wordCountTarget: number;
  acts: string[];
  coverColor: string;
  createdAt: Date;
  updatedAt: Date;
}

const CollaboratorSchema = new Schema({
  userId: { type: String, required: true },
  role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'editor' },
}, { _id: false });

const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, default: 'Untitled Novel' },
    description: { type: String, default: '' },
    ownerId: { type: String, required: true },
    collaborators: { type: [CollaboratorSchema], default: [] },
    wordCountTarget: { type: Number, default: 50000 },
    acts: { type: [String], default: ['Prologue', 'Act 1', 'Epilogue'] },
    coverColor: { type: String, default: '#44403c' },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
