"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Heart, Loader2, AlertCircle } from 'lucide-react';
import { createInstance } from '@/services/instanceService';

export default function CreateInstancePage() {
  const [yourName, setYourName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!yourName || !partnerName) {
      return;
    }
    setIsLoading(true);
    
    const { data: newInstance, error: creationError } = await createInstance(yourName, partnerName);

    if (newInstance) {
      router.push(`/${newInstance.id}`);
    } else {
      setError(creationError || "An unknown error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="text-center mb-12">
        <div className="flex justify-center items-center mb-4">
          <Heart className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl md:text-7xl font-headline text-gray-800 mb-2">
          LunaLove
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Create a private, digital space to celebrate your unique love story.
        </p>
      </div>

      <p className="text-center text-xs text-red-500 font-mono my-4">DEBUG: Project ID is: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT LOADED'}</p>

      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-center">Start Your Journey</CardTitle>
          <CardDescription className="text-center">
            Just enter your names to begin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="your-name" className="font-headline text-lg">Your Name</Label>
              <Input
                id="your-name"
                placeholder="e.g. Sol"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner-name" className="font-headline text-lg">Your Partner's Name</Label>
              <Input
                id="partner-name"
                placeholder="e.g. Luna"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                required
              />
            </div>
            
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Connection Failed</AlertTitle>
                    <AlertDescription>
                        {error} Please ensure the .env file is correct and that you have restarted the server.
                    </AlertDescription>
                </Alert>
            )}

            <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 bg-accent text-accent-foreground hover:bg-accent/90">
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Create Your Love Space
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
