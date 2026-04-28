import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  image: string;
  rating: number;
}

export function TestimonialCard({
  name,
  role,
  content,
  image,
  rating,
}: TestimonialCardProps) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={16} fill="#22C55E" className="text-[#22C55E]" />
        ))}
      </div>
      <p className="text-gray-700 mb-6 leading-relaxed">{content}</p>
      <div className="flex items-center gap-3">
        <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover" />
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
    </div>
  );
}
