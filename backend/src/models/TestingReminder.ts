import mongoose, { Document, Schema } from 'mongoose';

export interface ITestingReminder extends Document {
  application: mongoose.Types.ObjectId;
  sentBy: mongoose.Types.ObjectId;
  notifiedQAs: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const testingReminderSchema = new Schema<ITestingReminder>({
  application: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  sentBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notifiedQAs: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

testingReminderSchema.index({ application: 1, createdAt: -1 });

export default mongoose.model<ITestingReminder>('TestingReminder', testingReminderSchema);
