
import LoveLetterForm from "@/components/LoveLetterForm";
import { Flower2 } from "lucide-react";
import { getInstance } from '@/services/instanceService';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoveLetterPage({ params }: { params: Promise<{ instanceId: string }> }) {
  const { instanceId } = await params;
  const instance = await getInstance(instanceId);
  if (!instance) {
    notFound();
  }

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
          <LoveLetterForm instance={instance} />
        </div>

        {instance.loveLetters && instance.loveLetters.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-3xl text-center">Your Saved Letters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {instance.loveLetters.map((letter, index) => (
                  <div key={index} className="prose-lg max-w-none text-gray-700 whitespace-pre-wrap p-4 bg-primary/5 rounded-lg border">
                    <p>{letter}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
