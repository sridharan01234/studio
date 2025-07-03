import LoveLetterForm from "@/components/LoveLetterForm";
import { Flower2 } from "lucide-react";

export default function LoveLetterPage() {
  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Flower2 className="mx-auto h-12 w-12 text-accent mb-4" />
          <h1 className="text-5xl md:text-6xl font-headline text-gray-800">
            AI Love Letter Generator
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Words from the heart, crafted by AI. Fill in the details below to create a unique and personal love letter.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <LoveLetterForm />
        </div>
      </div>
    </div>
  );
}
