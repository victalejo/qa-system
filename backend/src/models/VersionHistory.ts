import mongoose, { Document, Schema } from 'mongoose';

export interface IVersionHistory extends Document {
  application: mongoose.Types.ObjectId;
  version: string;
  previousVersion: string;
  changelog: string;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const versionHistorySchema = new Schema<IVersionHistory>({
  application: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  version: {
    type: String,
    required: true
  },
  previousVersion: {
    type: String,
    required: true
  },
  changelog: {
    type: String,
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índice para búsquedas rápidas por aplicación
versionHistorySchema.index({ application: 1, createdAt: -1 });

export default mongoose.model<IVersionHistory>('VersionHistory', versionHistorySchema);
