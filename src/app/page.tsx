import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Heart, Milestone, Puzzle, Sparkles } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: 'AI Love Letter',
    description: 'Craft the perfect love letter with the help of AI.',
    href: '/love-letter',
    icon: <Sparkles className="h-8 w-8 text-accent" />,
  },
  {
    title: 'Photo Album',
    description: 'Relive your favorite moments together.',
    href: '/photo-album',
    icon: <Camera className="h-8 w-8 text-accent" />,
  },
  {
    title: 'Relationship Timeline',
    description: 'Visualize the beautiful journey of your love.',
    href: '/timeline',
    icon: <Milestone className="h-8 w-8 text-accent" />,
  },
  {
    title: 'Love Quizzes',
    description: 'Discover more about each other, in a fun way!',
    href: '/quizzes',
    icon: <Puzzle className="h-8 w-8 text-accent" />,
  },
];

export default function Home() {
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
          A special place to celebrate, cherish, and grow your love story. Explore your journey, create new memories, and express your heart.
        </p>
      </div>

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
                <Link href={feature.href}>
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
