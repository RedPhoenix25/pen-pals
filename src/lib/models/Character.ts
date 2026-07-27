import mongoose, { Schema, Document } from 'mongoose';

export interface ICharacter extends Document {
  name: string;
  role: string;
  traits: string;
  age: string;
  projectId: string;
  relations: Array<{
    characterId: string;
    relationshipType: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CharacterSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: '' },
    traits: { type: String, default: '' },
    age: { type: String, default: '' },
    projectId: { type: String, required: true, index: true },
    relations: [
      {
        characterId: { type: String },
        relationshipType: { type: String }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.Character || mongoose.model<ICharacter>('Character', CharacterSchema);
