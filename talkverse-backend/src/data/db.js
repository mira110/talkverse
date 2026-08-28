import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { UserProgress } from "../models/UserProgress.js";
import dotenv from "dotenv";

dotenv.config();

// Ensure SRV DNS lookup succeeds on all networks/Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "../../data");
const DB_FILE = path.join(DATA_DIR, "database.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultData = {
  users: [],
  user_progress: [],
};

function readDiskDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

function writeDiskDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database.json:", err);
  }
}

// Track MongoDB connection state
let isMongoConnected = false;

export async function connectMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log("🍃 MongoDB Atlas Cloud Database successfully connected!");
  } catch (err) {
    isMongoConnected = false;
    console.warn("MongoDB connection note:", err.message);
    console.log("ℹ️ Running with local persistent database storage (Fallback active).");
  }
}

// Auto-attempt connection on module load
connectMongoDB();

export const db = {
  // User operations
  async findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected && mongoose.connection.readyState === 1) {
      try {
        const doc = await User.findOne({ email: cleanEmail });
        if (doc) return doc.toObject();
      } catch (err) {
        console.warn("MongoDB read error, falling back to disk DB:", err.message);
      }
    }

    const data = readDiskDb();
    return data.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async createUser(userObj) {
    const cleanEmail = userObj.email.toLowerCase().trim();
    const newUser = {
      id: userObj.id || `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: userObj.name || "Learner",
      email: cleanEmail,
      passwordHash: userObj.passwordHash || null,
      avatar_url: userObj.avatar_url || null,
      authProvider: userObj.authProvider || "email",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // Save to MongoDB Atlas if connected
    if (isMongoConnected && mongoose.connection.readyState === 1) {
      try {
        const doc = await User.create({
          name: newUser.name,
          email: newUser.email,
          passwordHash: newUser.passwordHash,
          avatar_url: newUser.avatar_url,
          authProvider: newUser.authProvider,
          lastLoginAt: new Date(),
        });
        newUser.id = doc._id.toString();
      } catch (err) {
        console.warn("MongoDB insert error:", err.message);
      }
    }

    // Always persist to local disk as well
    const data = readDiskDb();
    data.users.push(newUser);
    writeDiskDb(data);

    return newUser;
  },

  async updateUser(email, updates) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected && mongoose.connection.readyState === 1) {
      try {
        const doc = await User.findOneAndUpdate(
          { email: cleanEmail },
          { ...updates, lastLoginAt: new Date() },
          { new: true }
        );
        if (doc) return doc.toObject();
      } catch (err) {
        console.warn("MongoDB update error:", err.message);
      }
    }

    const data = readDiskDb();
    const idx = data.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (idx !== -1) {
      data.users[idx] = {
        ...data.users[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      writeDiskDb(data);
      return data.users[idx];
    }
    return null;
  },

  // User Progress operations
  async getProgress(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected && mongoose.connection.readyState === 1) {
      try {
        const doc = await UserProgress.findOne({ email: cleanEmail });
        if (doc) return doc.toObject();
      } catch (err) {
        console.warn("MongoDB getProgress error:", err.message);
      }
    }

    const data = readDiskDb();
    return data.user_progress.find((p) => p.email.toLowerCase() === cleanEmail) || null;
  },

  async saveProgress(progressObj) {
    if (!progressObj?.email) return null;
    const cleanEmail = progressObj.email.toLowerCase().trim();

    const record = {
      email: cleanEmail,
      xp: Number(progressObj.xp) || 0,
      streak: Number(progressObj.streak) || 1,
      level: Number(progressObj.level) || 1,
      wordsLearned: Number(progressObj.wordsLearned) || 0,
      todayXP: Number(progressObj.todayXP) || 0,
      completedLessons: Array.isArray(progressObj.completedLessons) ? progressObj.completedLessons : [],
      nativeLang: progressObj.nativeLang || "ta",
      targetLang: progressObj.targetLang || "kn",
      hasSelectedLanguages: typeof progressObj.hasSelectedLanguages === "boolean"
        ? progressObj.hasSelectedLanguages
        : Boolean((Number(progressObj.xp) || 0) > 0 || (Array.isArray(progressObj.completedLessons) && progressObj.completedLessons.length > 0)),
      updatedAt: new Date().toISOString(),
    };

    if (isMongoConnected && mongoose.connection.readyState === 1) {
      try {
        await UserProgress.findOneAndUpdate(
          { email: cleanEmail },
          record,
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn("MongoDB saveProgress error:", err.message);
      }
    }

    const data = readDiskDb();
    const idx = data.user_progress.findIndex((p) => p.email.toLowerCase() === cleanEmail);
    if (idx !== -1) {
      data.user_progress[idx] = record;
    } else {
      data.user_progress.push(record);
    }
    writeDiskDb(data);

    return record;
  },
};
