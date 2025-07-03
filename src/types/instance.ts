
import { z } from 'zod';

export const PhotoSchema = z.object({
  src: z.string(),
  alt: z.string(),
  hint: z.string(),
});
export type Photo = z.infer<typeof PhotoSchema>;

export const TimelineEventSchema = z.object({
  date: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const ChecklistSchema = z.object({
  loveLetter: z.boolean(),
  photoAlbum: z.boolean(),
  timeline: z.boolean(),
  quiz: z.boolean(),
});
export type Checklist = z.infer<typeof ChecklistSchema>;

export const InstanceDataSchema = z.object({
  id: z.string(),
  creatorName: z.string(),
  partnerName: z.string(),
  loveLetters: z.array(z.string()).optional(),
  photos: z.array(PhotoSchema).optional(),
  timelineEvents: z.array(TimelineEventSchema).optional(),
  checklist: ChecklistSchema.optional(),
});
export type InstanceData = z.infer<typeof InstanceDataSchema>;
