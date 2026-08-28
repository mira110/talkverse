# TalkVerse (SouthIndianTutor) — Production Deployment Guide

This guide provides the complete, step-by-step procedure to push your codebase to GitHub, deploy it as a live website, and package it as an Android/iOS mobile application with all features working.

---

## 📑 Table of Contents
1. [Step 1: Push Codebase to GitHub](#step-1-push-codebase-to-github)
2. [Step 2: Deploy the Python AI ML Engine](#step-2-deploy-the-python-ai-ml-engine)
3. [Step 3: Deploy the Express Backend API](#step-3-deploy-the-express-backend-api)
4. [Step 4: Deploy the React Frontend Web Application](#step-4-deploy-the-react-frontend-web-application)
5. [Step 5: Package as a Mobile Application (Android APK / PWA)](#step-5-package-as-a-mobile-application)
6. [Step 6: Production Security & Permissions Checklist](#step-6-production-security--permissions-checklist)

---

## Step 1: Push Codebase to GitHub

1. Open your terminal in the project root:
   ```bash
   cd "c:\Users\Miraclin k\OneDrive\Desktop\SouthIndianTutor"
   ```

2. Initialize Git and make your initial commit:
   ```bash
   git init
   git add .
   git commit -m "feat: complete TalkVerse multi-language platform with AI acoustic model"
   ```

3. Create a new repository on [GitHub](https://github.com/new) named `talkverse` (or `SouthIndianTutor`).

4. Link your remote repository and push to `main`:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/talkverse.git
   git push -u origin main
   ```

---

## Step 2: Deploy the Python AI ML Engine

The Python ML engine serves `indic_pronunciation_model.pkl` for real-time acoustic inference.

### Deploy on [Render.com](https://render.com) (Free / Low Cost)
1. Go to your Render Dashboard and click **New + ➔ Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `talkverse-ai-engine`
   - **Region**: Singapore or closest to your users
   - **Root Directory**: `ai_engine`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
4. Click **Deploy Web Service**.
5. Once deployed, copy the service URL (e.g., `https://talkverse-ai-engine.onrender.com`).

---

## Step 3: Deploy the Express Backend API

The Express server coordinates lessons, dialogues, speech forwarding, and authentication.

### Deploy on [Render.com](https://render.com)
1. In Render Dashboard, click **New + ➔ Web Service**.
2. Connect the same GitHub repository.
3. Configure the service settings:
   - **Name**: `talkverse-backend`
   - **Root Directory**: `talkverse-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In the **Environment Variables** section, add:
   | Key | Value |
   | :--- | :--- |
   | `PORT` | `5000` |
   | `PYTHON_ML_URL` | `https://talkverse-ai-engine.onrender.com` *(from Step 2)* |
   | `MONGODB_URI` | `mongodb+srv://...` *(from your talkverse-backend/.env)* |
   | `VITE_GROQ_API_KEY` | `gsk_...` *(from your talkverse-backend/.env)* |
   | `SUPABASE_URL` | `https://zrerhdcbcfhokkmihyth.supabase.co` |
   | `SUPABASE_ANON_KEY` | `eyJhbGciOi...` |
   | `FIREBASE_PROJECT_ID` | `talkverse-10fcf` |
5. Click **Deploy Web Service**.
6. Copy your deployed Backend URL (e.g., `https://talkverse-backend.onrender.com`).

---

## Step 4: Deploy the React Frontend Web Application

### Option A: Deploy on [Vercel](https://vercel.com) (Recommended)
1. Go to Vercel Dashboard and click **Add New ➔ Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `langbridge`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the Environment Variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
5. Configure API Proxy Rewrites:
   Create or verify `langbridge/vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://talkverse-backend.onrender.com/api/:path*" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
6. Click **Deploy**. Your website is now live!

---

## Step 5: Package as a Mobile Application

### Method 1: Progressive Web App (PWA — One-Click Mobile Installation)
The web app is mobile-responsive and can be added directly to the home screen of any Android or iOS phone:
- On Android (Chrome): Tap menu (three dots) ➔ **"Install App"** or **"Add to Home screen"**.
- On iOS (Safari): Tap Share ➔ **"Add to Home Screen"**.

---

### Method 2: Native Android APK with Capacitor

To build a standalone `.apk` for Android:

1. In your `langbridge` directory, install Capacitor:
   ```bash
   cd langbridge
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. Initialize Capacitor:
   ```bash
   npx cap init TalkVerse com.talkverse.app --web-dir dist
   ```

3. Build the frontend:
   ```bash
   npm run build
   ```

4. Add the Android platform:
   ```bash
   npx cap add android
   npx cap sync android
   ```

5. Open Android Studio to build the APK:
   ```bash
   npx cap open android
   ```
   - In Android Studio, go to **Build ➔ Build Bundle(s) / APK(s) ➔ Build APK(s)**.
   - Your installable `.apk` file will be generated in `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## Step 6: Production Security & Permissions Checklist

1. **MongoDB Atlas Network Access**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com) ➔ **Network Access**.
   - Ensure `0.0.0.0/0` (Allow Access from Anywhere) is added so cloud servers (Render) can connect to the database.

2. **Firebase Auth Authorized Domains**:
   - Go to Firebase Console ➔ **Authentication ➔ Settings ➔ Authorized Domains**.
   - Add your Vercel domain (e.g. `talkverse.vercel.app`) and Render domain.

3. **HTTPS & Microphone Permissions**:
   - Web Speech API and voice recording require an **HTTPS** URL in production. Vercel and Render automatically provide free SSL certificates (`https://`).
