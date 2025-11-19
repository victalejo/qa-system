import mongoose, { Document, Schema } from 'mongoose';

export interface IComment {
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IStatusHistory {
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'pending-test';
  changedBy: mongoose.Types.ObjectId;
  changedAt: Date;
}

export interface ITesterDecision {
  decision: 'fixed' | 'regression' | 'not-fixed';
  comment: string;
  decidedAt: Date;
}

export interface IBugReport extends Document {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'pending-test';
  application: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  screenshots?: string[];
  environment: string;
  consoleErrors?: string;
  queries?: string;
  comments?: IComment[];
  statusHistory?: IStatusHistory[];
  testerDecision?: ITesterDecision;
  isRegression?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bugReportSchema = new Schema<IBugReport>({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  stepsToReproduce: {
    type: String,
    required: true
  },
  expectedBehavior: {
    type: String,
    required: true
  },
  actualBehavior: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed', 'pending-test'],
    default: 'open'
  },
  application: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  screenshots: [{
    type: String
  }],
  environment: {
    type: String,
    required: true
  },
  consoleErrors: {
    type: String,
    required: false
  },
  queries: {
    type: String,
    required: false
  },
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed', 'pending-test'],
      required: true
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  }],
  testerDecision: {
    decision: {
      type: String,
      enum: ['fixed', 'regression', 'not-fixed'],
      required: false
    },
    comment: {
      type: String,
      required: false
    },
    decidedAt: {
      type: Date,
      required: false
    }
  },
  isRegression: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

bugReportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IBugReport>('BugReport', bugReportSchema);
