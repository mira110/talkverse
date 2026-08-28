import { motion } from "framer-motion";
import { SearchX, Home } from "lucide-react";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-light text-text-main flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-light-card border border-light-border rounded-3xl p-12 max-w-md w-full shadow-xl"
      >
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <SearchX size={40} className="text-red-400" />
        </div>
        <h1 className="text-6xl font-extrabold text-light-border mb-2">404</h1>
        <h2 className="text-2xl font-bold text-text-main mb-3">Page Not Found</h2>
        <p className="text-text-muted mb-8">
          Oops! The page you are looking for doesn't exist or has been moved. Let's get you back on track to learning.
        </p>
        <Button variant="primary" size="lg" className="w-full" onClick={() => navigate("/")}>
          <Home size={20} /> Go Back Home
        </Button>
      </motion.div>
    </div>
  );
}