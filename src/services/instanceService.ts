
'use server';

import type { InstanceData, Checklist } from '@/types/instance';

// In-memory store (for prototyping purposes, data will be lost on server restart)
const instances = new Map<string, InstanceData>();

export async function createInstance(creatorName: string, partnerName:string): Promise<InstanceData> {
  const id = crypto.randomUUID().slice(0, 8);
  
  // Start with default data for the new instance
  const newInstance: InstanceData = {
    id,
    creatorName,
    partnerName,
    photos: [
      { src: 'https://placehold.co/600x800.png', alt: 'A romantic moment under the stars.', hint: 'couple stars' },
      { src: 'https://placehold.co/800x600.png', alt: 'Laughing together on a sunny afternoon.', hint: 'couple laughing' },
      { src: 'https://placehold.co/600x600.png', alt: 'A cozy selfie.', hint: 'couple selfie' },
      { src: 'https://placehold.co/600x900.png', alt: 'Walking hand in hand on the beach.', hint: 'couple beach' },
    ],
    timelineEvents: [
      { date: 'June 12, 2021', title: 'Our First Date', description: 'A coffee date that turned into a five-hour conversation.', icon: 'Heart' },
      { date: 'September 3, 2021', title: 'First Trip Together', description: 'Our weekend getaway to the coast.', icon: 'Plane' },
      { date: 'December 25, 2021', title: 'First Holiday', description: 'Exchanging gifts and starting our own traditions.', icon: 'Gift' },
      { date: 'May 1, 2022', title: 'Moved In Together', description: 'Turning a house into a home.', icon: 'Home' },
      { date: 'July 20, 2023', title: 'The Proposal', description: 'Under a sky full of stars, we decided on forever.', icon: 'Diamond' },
    ],
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
