
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Heart, Milestone, Puzzle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getInstance } from '@/services/instanceService';
import { notFound } from 'next/navigation';
import CompletionChecklist from '@/components/CompletionChecklist';
import ShareCard from '@/components/ShareCard';

export default async function InstanceHomePage({ params, searchParams }: { params: { instanceId: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const instance = await getInstance(params.instanceId);
  const isPartnerView = searchParams.partner === 'true';

  if (!instance) {
    notFound();
  }

  const isComplete = instance.checklist && Object.values(instance.checklist).every(Boolean);
  
  const features = [
    {
      title: 'AI Love Letter',
      description: 'Craft the perfect love letter with the help of AI.',
      href: `/${instance.id}/love-letter`,
      icon: <Sparkles className="h-8 w-8 text-accent" />,
    },
    {
      title: 'Photo Album',
      description: 'Create a gallery of your favorite moments.',
      href: `/${instance.id}/photo-album`,
      icon: <Camera className="h-8 w-8 text-accent" />,
    },
    {
      title: 'Relationship Timeline',
      description: 'Build a beautiful journey of your love.',
      href: `/${instance.id}/timeline`,
      icon: <Milestone className="h-8 w-8 text-accent" />,
    },
    {
      title: 'Love Quizzes',
      description: 'Discover more about each other, in a fun way!',
      href: `/${instance.id}/quizzes`,
      icon: <Puzzle className="h-8 w-8 text-accent" />,
    },
  ];

  const getHref = (baseHref: string) => {
    return isPartnerView ? `${baseHref}?partner=true` : baseHref;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="text-center my-12">
        <div className="flex justify-center items-center mb-4">
          <Heart className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl md:text-7xl font-headline text-gray-800 mb-2">
          {instance.creatorName} & {instance.partnerName}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {isPartnerView
            ? `Welcome! ${instance.creatorName} has prepared this special place just for you.`
            : 'A special place to celebrate, cherish, and grow your love story. Explore your journey, create new memories, and express your heart.'
          }
        </p>
      </div>

      {!isPartnerView && (
        <div className="w-full max-w-4xl mb-12">
           {isComplete ? (
             <ShareCard instanceId={instance.id} />
          ) : (
            <CompletionChecklist checklist={instance.checklist} />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 w-full max-w-4xl">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-primary/50">
            <CardHeader className="flex flex-row items-center gap-4">
              {feature.icon}
              <div>
                <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary-foreground">
                <Link href={getHref(feature.href)}>
                  Explore
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
    </div>
  );
}
