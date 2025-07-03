
'use client';

import type { Checklist } from '@/types/instance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';
import { useMemo } from 'react';

type CompletionChecklistProps = {
  checklist?: Checklist;
};

const checklistItems = [
  { key: 'loveLetter', label: 'Generate a Love Letter' },
  { key: 'photoAlbum', label: 'View the Photo Album' },
  { key: 'timeline', label: 'Review the Timeline' },
  { key: 'quiz', label: 'Complete the Quiz' },
];

export default function CompletionChecklist({ checklist }: CompletionChecklistProps) {
  const { completedCount, totalCount, progress } = useMemo(() => {
    if (!checklist) {
      return { completedCount: 0, totalCount: checklistItems.length, progress: 0 };
    }
    const completedCount = Object.values(checklist).filter(Boolean).length;
    const totalCount = checklistItems.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    return { completedCount, totalCount, progress };
  }, [checklist]);

  if (!checklist) {
    return null;
  }

  const allComplete = completedCount === totalCount;

  return (
    <Card className="w-full mt-12 shadow-lg border-2 border-accent/30">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Your Progress</CardTitle>
        <CardDescription>
          {allComplete 
            ? "You've completed everything! Your space is ready to be shared."
            : "Complete these steps to prepare this special space for your partner."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Progress value={progress} className="h-3" />
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {completedCount} / {totalCount}
          </span>
        </div>
        <div className="space-y-3 mt-6">
          {checklistItems.map((item) => {
            const isCompleted = checklist[item.key as keyof Checklist];
            return (
              <div key={item.key} className="flex items-center gap-3">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={isCompleted ? 'text-muted-foreground line-through' : ''}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
