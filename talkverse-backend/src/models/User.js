import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    avatar_url: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ["email", "google", "firebase"],
      default: "email",
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
