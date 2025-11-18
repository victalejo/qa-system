import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  name: string;
  description: string;
  version: string;
  platform: string;
  assignedQAs: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  assignedQAs: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

applicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IApplication>('Application', applicationSchema);
