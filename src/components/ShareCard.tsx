'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Link as LinkIcon, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ShareCard({ instanceId }: { instanceId: string }) {
    const { toast } = useToast();
    const [origin, setOrigin] = React.useState('');

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    const shareLink = origin ? `${origin}/${instanceId}?partner=true` : `Loading share link...`;

    const copyToClipboard = () => {
        if (!origin) return;
        navigator.clipboard.writeText(`${origin}/${instanceId}?partner=true`);
        toast({
            title: "Copied!",
            description: "The shareable link has been copied to your clipboard.",
        });
    }

    return (
        <Card className="w-full mt-12 shadow-lg border-2 border-green-500/50 bg-green-500/10">
            <CardHeader className="text-center">
              <Share2 className="mx-auto h-10 w-10 text-green-600 mb-2" />
              <CardTitle className="font-headline text-3xl text-green-700">All Done! Share Your Creation</CardTitle>
              <CardDescription>
                Your space is ready! Share this link with your partner so they can see what you've created.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4 bg-green-500/10 p-4 rounded-lg mx-6 mb-6">
                <LinkIcon className="h-5 w-5 text-green-700" />
                <code className="text-green-800 font-mono text-sm flex-1 overflow-x-auto">
                    {shareLink}
                </code>
                 <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!origin}>
                    <Copy className="mr-2 h-4 w-4"/>
                    Copy
                </Button>
            </CardContent>
        </Card>
    )
}
