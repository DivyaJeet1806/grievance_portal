import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    message: {
      type: String,
      required: true
    },
    actor: {
      type: String,
      default: 'System'
    }
  },
  { _id: false }
);

const grievanceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Grievance title is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    location: {
      type: String,
      default: 'Main Campus',
      trim: true
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved'],
      default: 'Submitted',
      index: true
    },
    submittedBy: {
      type: String,
      default: 'Student Complainant'
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    assignedTo: {
      type: String,
      default: 'Pending Assignment'
    },
    assignedDepartment: {
      type: String,
      default: 'General Administration'
    },
    slaHours: {
      type: Number,
      default: 48
    },
    timeline: {
      type: [timelineEventSchema],
      default: []
    },
    resolutionNotes: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    feedback: {
      type: String,
      default: null
    },
    attachment: {
      type: String,
      default: null
    },
    departmentConfirmed: {
      type: Boolean,
      default: false
    },
    departmentConfirmedAt: {
      type: Date,
      default: null
    },
    departmentConfirmedBy: {
      type: String,
      default: null
    },
    complainantConfirmed: {
      type: Boolean,
      default: false
    },
    complainantConfirmedAt: {
      type: Date,
      default: null
    },
    complainantConfirmedBy: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Add index on category and urgency for filtering performance
grievanceSchema.index({ category: 1, urgency: 1, createdAt: -1 });

const Grievance = mongoose.models.Grievance || mongoose.model('Grievance', grievanceSchema);

export default Grievance;
