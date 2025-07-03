import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Milestone, Gift, Plane, Ring, Home, Heart } from 'lucide-react';

const timelineEvents = [
  {
    date: 'June 12, 2021',
    title: 'Our First Date',
    description: 'A coffee date that turned into a five-hour conversation. We both knew something special was beginning.',
    icon: <Heart className="h-6 w-6 text-primary" />,
  },
  {
    date: 'September 3, 2021',
    title: 'First Trip Together',
    description: 'Our weekend getaway to the coast. We watched the sunset and made promises we still keep.',
    icon: <Plane className="h-6 w-6 text-primary" />,
  },
  {
    date: 'December 25, 2021',
    title: 'First Holiday',
    description: 'Exchanging gifts and spending a cozy Christmas together, starting our own traditions.',
    icon: <Gift className="h-6 w-6 text-primary" />,
  },
  {
    date: 'May 1, 2022',
    title: 'Moved In Together',
    description: 'Turning a house into a home. The start of countless shared breakfasts and late-night talks.',
    icon: <Home className="h-6 w-6 text-primary" />,
  },
  {
    date: 'July 20, 2023',
    title: 'The Proposal',
    description: 'Under a sky full of stars, we decided on forever. A moment of pure magic and happiness.',
    icon: <Ring className="h-6 w-6 text-primary" />,
  },
];

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <Milestone className="mx-auto h-12 w-12 text-accent mb-4" />
          <h1 className="text-5xl md:text-6xl font-headline text-gray-800">
            Our Relationship Timeline
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            A beautiful journey of our milestones, memories, and moments together.
          </p>
        </div>

        <div className="relative wrap overflow-hidden p-10 h-full">
          <div className="border-2-2 absolute border-opacity-20 border-gray-700 h-full border" style={{left: '50%'}}></div>

          {timelineEvents.map((event, index) => (
            <div key={index} className={`mb-8 flex justify-between items-center w-full ${index % 2 === 0 ? 'flex-row-reverse left-timeline' : 'right-timeline'}`}>
              <div className="order-1 w-5/12"></div>
              <div className="z-20 flex items-center order-1 bg-primary shadow-xl w-12 h-12 rounded-full">
                <div className="mx-auto">
                  {event.icon}
                </div>
              </div>
              <div className="order-1 w-5/12">
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl">{event.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </CardHeader>
                  <CardContent>
                    <p>{event.description}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
