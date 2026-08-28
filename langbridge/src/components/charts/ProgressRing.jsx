import { motion } from "framer-motion";

export default function ProgressRing({ radius = 50, stroke = 6, progress = 0, color = "#E8A317" }) {
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        {/* Background Circle */}
        <circle
          stroke="#F0E6D6"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Circle */}
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + " " + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-xl font-bold text-text-main">{progress}%</span>
      </div>
    </div>
  );
}