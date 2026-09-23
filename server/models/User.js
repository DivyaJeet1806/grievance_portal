import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'student'],
      default: 'student'
    },
    rollNumber: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true,
      default: 'General'
    }
  },
  {
    timestamps: true
  }
);

// Method to return safe user object (omits sensitive password hash)
userSchema.methods.toSafeObject = function () {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    role: this.role,
    department: this.department,
    rollNumber: this.rollNumber,
    createdAt: this.createdAt
  };
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
