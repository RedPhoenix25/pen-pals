import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'collaborator_joined'
  | 'comment_added'
  | 'comment_resolved'
  | 'version_restored'
  | 'project_invite'
  | 'project_removed';

export interface INotification extends Document {
  userId: string;
  type: NotificationType;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['collaborator_joined', 'comment_added', 'comment_resolved', 'version_restored', 'project_invite', 'project_removed'],
      required: true,
    },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
