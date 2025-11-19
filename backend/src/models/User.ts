import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'qa';
  whatsappNumber?: string;
  notificationPreferences?: {
    email: boolean;
    whatsapp: boolean;
  };
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'qa'],
    required: true
  },
  whatsappNumber: {
    type: String,
    required: false,
    trim: true
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    whatsapp: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IUser>('User', userSchema);
