import { motion } from "framer-motion";

export default function Button({ children, variant = "primary", size = "md", onClick, className = "" }) {
  const base = "font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/30",
    secondary: "bg-secondary hover:bg-orange-600 text-white shadow-lg shadow-secondary/30",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
    ghost: "text-text-muted hover:text-text-main hover:bg-black/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </motion.button>
  );
}