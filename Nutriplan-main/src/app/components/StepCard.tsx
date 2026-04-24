import { ReactNode } from "react";

interface StepCardProps {
  number: number;
  icon: ReactNode;
  title: string;
  description: string;
}

export function StepCard({ number, icon, title, description }: StepCardProps) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white text-2xl mb-4">
        {icon}
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#22C55E] text-white flex items-center justify-center text-sm font-bold">
        {number}
      </div>
      <h3 className="text-xl mb-2">{title}</h3>
      <p className="text-gray-600 max-w-xs">{description}</p>
    </div>
  );
}
