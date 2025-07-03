
import InteractiveQuiz from "@/components/InteractiveQuiz";
import { Puzzle } from "lucide-react";

export default function QuizzesPage({ params }: { params: { instanceId: string } }) {
  return (
    <div className="min-h-screen bg-background w-full flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Puzzle className="mx-auto h-12 w-12 text-accent mb-4" />
          <h1 className="text-5xl md:text-6xl font-headline text-gray-800">
            Love Language Quiz
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Discover how you and your partner express and receive love. Answer a few questions to find your primary love language.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <InteractiveQuiz instanceId={params.instanceId} />
        </div>
      </div>
    </div>
  );
}
