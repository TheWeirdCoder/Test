import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface BackButtonProps {
  to?: string;
  className?: string;
}

export default function BackButton({ to = "/", className = "" }: BackButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 bg-[#2F3136] border-gray-700 hover:bg-[#36393F] text-white ${className}`}
      asChild
    >
      <Link href={to}>
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Link>
    </Button>
  );
}