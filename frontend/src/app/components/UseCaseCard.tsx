import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface UseCaseCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
}

export function UseCaseCard({
  icon,
  title,
  description,
  gradient,
}: UseCaseCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-8 rounded-2xl ${gradient} text-white cursor-pointer group`}
    >
      <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-2xl mb-3">{title}</h3>
      <p className="text-white/90 mb-4 leading-relaxed">{description}</p>
      <div className="flex items-center gap-2 text-white/90 group-hover:gap-3 transition-all">
        <span className="text-sm font-medium">Learn more</span>
        <ArrowRight size={16} />
      </div>
    </motion.div>
  );
}
