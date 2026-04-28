import { ReactNode } from "react";
import { motion } from "motion/react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#22C55E]/30 transition-all duration-300 hover:shadow-lg"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white mb-4">
        {icon}
      </div>
      <h3 className="text-xl mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
