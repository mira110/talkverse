import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, ArrowLeft, Globe, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithGoogle, isFirebaseConfigured } from "../config/firebase";
import Button from "../components/ui/Button";
import useStore from "../store/useStore";

export default function Signup() {
  const navigate = useNavigate();
  const { setUser, setToken } = useStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper to synchronize Google authenticated user into MongoDB
  const syncWithBackend = async (firebaseUser, idToken) => {
    const response = await fetch("/api/auth/firebase-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || name.trim(),
        photoURL: firebaseUser.photoURL,
        uid: firebaseUser.uid,
        token: idToken,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("Unable to parse server response. Please ensure the backend server is running.");
    }

    if (!response.ok) {
      throw new Error(data?.error || "Failed to sync with MongoDB database.");
    }

    setUser(data.user, data.progress);
    setToken(data.token);
  };

  // 🌟 Firebase Google Sign-In (Syncs directly to MongoDB Atlas)
  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      setError("Please add your Firebase API key in langbridge/.env first.");
      return;
    }

    setError("");
    setGoogleLoading(true);

    try {
      const fbUser = await loginWithGoogle();
      const idToken = await fbUser.getIdToken();
      await syncWithBackend(fbUser, idToken);
      navigate("/select");
    } catch (err) {
      console.error("Firebase Google Signup error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign-up failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Direct registration into MongoDB Atlas
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Unable to connect to backend server. Please verify the server is running on port 5000.");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Signup failed. Please try again.");
      }

      setUser(data.user, data.progress);
      setToken(data.token);
      navigate("/select");
    } catch (err) {
      setError(err.message || "Registration failed. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light text-text-main flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Top Left Navigation Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-light-card/90 backdrop-blur-md border border-light-border text-text-muted hover:text-text-main hover:border-primary/40 shadow-xs hover:shadow-md transition-all text-xs font-bold active:scale-95 cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </button>

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5 text-[4rem] font-bold text-text-main flex flex-wrap justify-center gap-4 p-10">
        {["அ", "ஆ", "ക", "ഖ", "ಗ", "ಘ", "చ", "छ", "அ", "ஆ"].map((l, i) => (
          <span key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>
            {l}
          </span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-light-card border border-light-border rounded-3xl p-8 shadow-xl shadow-black/5 relative z-10"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Globe size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold">Create Account</h1>
          <p className="text-text-muted mt-1 text-sm">Register to start your Indic language learning</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs flex items-center gap-2"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* 🌟 Firebase Google Sign-Up Button */}
        <div className="flex flex-col items-center justify-center mb-5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-light-border rounded-full py-3 px-4 shadow-sm hover:shadow transition-all text-sm disabled:opacity-50 group"
          >
            <svg className="w-5 h-5 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{googleLoading ? "Connecting..." : "Sign up with Google"}</span>
          </button>

          <div className="w-full flex items-center gap-3 my-4">
            <div className="h-[1px] bg-light-border flex-1" />
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">or register with email</span>
            <div className="h-[1px] bg-light-border flex-1" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-main mb-1.5">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-light border border-light-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="Ananya"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-main mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-light border border-light-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="learner@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-main mb-1.5">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-light border border-light-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="Min 6 characters"
              />
            </div>
          </div>

          <Button variant="primary" size="lg" className="w-full mt-2" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"} <ArrowRight size={18} />
          </Button>
        </form>

        <p className="text-center text-xs text-text-muted mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}