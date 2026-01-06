"use client";

interface LoaderProps {
  size?: number;
  color?: string;
  className?: string; 
}

export default function Loader({ size = 50, color = "text-blue-500", className = "" }: LoaderProps) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div
        className={`animate-spin rounded-full h-${size} w-${size} border-b-2 ${color}`}
        style={{ width: size, height: size }}
      ></div>
    </div>
  );
}
