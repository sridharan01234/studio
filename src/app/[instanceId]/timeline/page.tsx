
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Milestone, Gift, Plane, Diamond, Home, Heart, FilePlus } from 'lucide-react';
import { getInstance } from '@/services/instanceService';
import { notFound } from 'next/navigation';
import type { TimelineEvent } from '@/types/instance';
import { AddTimelineEventForm } from '@/components/AddTimelineEventForm';

const iconMap: { [key: string]: React.ReactElement } = {
  Heart: <Heart className="h-6 w-6 text-primary" />,
  Plane: <Plane className="h-6 w-6 text-primary" />,
  Gift: <Gift className="h-6 w-6 text-primary" />,
  Home: <Home className="h-6 w-6 text-primary" />,
  Diamond: <Diamond className="h-6 w-6 text-primary" />,
};

export default async function TimelinePage({ 
    params,
    searchParams
}: { 
    params: { instanceId: string };
    searchParams: { [key: string]: string | string[] | undefined };
}) {
  const instance = await getInstance(params.instanceId);
  const isPartnerView = searchParams.partner === 'true';

  if (!instance) {
    notFound();
  }
  
  const timelineEvents: TimelineEvent[] = instance.timelineEvents || [];

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
          {!isPartnerView && (
            <div className="mt-8">
              <AddTimelineEventForm instanceId={params.instanceId} />
            </div>
          )}
        </div>

        {timelineEvents.length === 0 ? (
           <div className="text-center py-16">
            <FilePlus className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-headline text-gray-700">Your Timeline is Empty</h2>
            <p className="text-muted-foreground mt-2">
              {isPartnerView
                ? 'Your partner is still adding memories!'
                : 'Click "Add Timeline Event" to start building your story.'}
            </p>
          </div>
        ) : (
          <div className="relative wrap overflow-hidden p-10 h-full">
            <div className="border-2-2 absolute border-opacity-20 border-gray-700 h-full border" style={{left: '50%'}}></div>

            {timelineEvents.map((event, index) => (
              <div key={index} className={`mb-8 flex justify-between items-center w-full ${index % 2 === 0 ? 'flex-row-reverse left-timeline' : 'right-timeline'}`}>
                <div className="order-1 w-5/12"></div>
                <div className="z-20 flex items-center order-1 bg-primary shadow-xl w-12 h-12 rounded-full">
                  <div className="mx-auto">
                    {iconMap[event.icon] || <Heart className="h-6 w-6 text-primary" />}
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
        )}
      </div>
    </div>
  );
}
