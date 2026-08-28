import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Globe } from "lucide-react";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // TODO: Connect to /api/auth/login
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.status === 401) return setError(data.error || "Invalid email or password");
      
      // Save token to Zustand
      login(data.token);

      navigate("/dashboard");
    } catch {
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="min-h-screen bg-light text-text-main flex flex-col items-center justify-center px-6 relative overflow-hidden">

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5 text-[4rem] font-bold text-text-main flex flex-wrap justify-center gap-4 p-10">
        {["அ","ஆ","இ","க","ச","த","ந","ப","ம","ய","ர","ல","வ"];
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 15 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-light-card border border border-light-border rounded-3xl p-8 shadow-xl shadow-black/5 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Globe size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-text-main">Welcome Back</h1>
          <p className="text-text-muted mt-2">Login to save your progress permanently</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-300 text-red-600 px-5 py-3 rounded-lg text-sm mt-4 text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-light border border-light-border rounded-xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-light border border-light-border rounded-xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="•••••••••"
              />
            </div>
          </div>

          <Button variant="primary" size="lg" className="w-full" type="submit">
            Sign In <ArrowRight size={20} />
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Don't have an account?{' '}
          <a href="/signup" className="text-primary font-bold hover:text-primary-light transition-colors">Sign up for Free</a>
        </p>
      </motion.div>
    </div>
  );
}