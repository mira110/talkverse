import mongoose from "mongoose";

const UserProgressSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    xp: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 1,
    },
    level: {
      type: Number,
      default: 1,
    },
    wordsLearned: {
      type: Number,
      default: 0,
    },
    completedLessons: {
      type: [String],
      default: [],
    },
    nativeLang: {
      type: String,
      default: "ta",
    },
    targetLang: {
      type: String,
      default: "kn",
    },
    todayXP: {
      type: Number,
      default: 0,
    },
    hasSelectedLanguages: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const UserProgress =
  mongoose.models.UserProgress ||
  mongoose.model("UserProgress", UserProgressSchema);
