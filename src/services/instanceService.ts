
'use server';

import type { InstanceData, Checklist, TimelineEvent, Photo } from '@/types/instance';

// In-memory store (for prototyping purposes, data will be lost on server restart)
const instances = new Map<string, InstanceData>();

export async function createInstance(creatorName: string, partnerName:string): Promise<InstanceData> {
  const id = crypto.randomUUID().slice(0, 8);
  
  // Start with empty data for the new instance
  const newInstance: InstanceData = {
    id,
    creatorName,
    partnerName,
    loveLetters: [],
    photos: [], // Start with empty photos
    timelineEvents: [], // Start with empty timeline
    checklist: {
      loveLetter: false,
      photoAlbum: false,
      timeline: false,
      quiz: false,
    }
  };

  instances.set(id, newInstance);
  return newInstance;
}

export async function getInstance(id: string): Promise<InstanceData | null> {
  if (!instances.has(id)) {
    return null;
  }
  return instances.get(id)!;
}

export async function saveLoveLetter(instanceId: string, letter: string): Promise<boolean> {
  const instance = await getInstance(instanceId);
  if (!instance) return false;

  if (!instance.loveLetters) {
    instance.loveLetters = [];
  }
  instance.loveLetters.push(letter);
  if (instance.checklist) {
    instance.checklist.loveLetter = true;
  }
  instances.set(instanceId, instance);
  return true;
}

export async function updateChecklistItem(instanceId: string, item: keyof Checklist): Promise<boolean> {
    const instance = await getInstance(instanceId);
    if (!instance || !instance.checklist) return false;

    if (instance.checklist[item] === false) {
      instance.checklist[item] = true;
      instances.set(instanceId, instance);
    }
    return true;
}

export async function addTimelineEvent(instanceId: string, event: TimelineEvent): Promise<boolean> {
  const instance = await getInstance(instanceId);
  if (!instance) return false;

  if (!instance.timelineEvents) {
    instance.timelineEvents = [];
  }
  instance.timelineEvents.push(event);
  if (instance.checklist) {
    instance.checklist.timeline = true;
  }
  instances.set(instanceId, instance);
  return true;
}

export async function addPhoto(instanceId: string, photo: Photo): Promise<boolean> {
  const instance = await getInstance(instanceId);
  if (!instance) return false;

  if (!instance.photos) {
    instance.photos = [];
  }
  instance.photos.push(photo);
  if (instance.checklist) {
    instance.checklist.photoAlbum = true;
  }
  instances.set(instanceId, instance);
  return true;
}
