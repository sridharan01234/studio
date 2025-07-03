
'use server';

import type { InstanceData, Checklist, TimelineEvent, Photo } from '@/types/instance';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from 'firebase/firestore';
import { differenceInDays } from 'date-fns';

const INSTANCES_COLLECTION = 'instances';

export async function createInstance(creatorName: string, partnerName:string): Promise<InstanceData | null> {
  if (!db) {
    console.error("Firestore is not initialized. Cannot create instance.");
    return null;
  }
  const newInstanceData = {
    creatorName,
    partnerName,
    loveLetters: [],
    photos: [],
    timelineEvents: [],
    checklist: {
      loveLetter: false,
      photoAlbum: false,
      timeline: false,
      quiz: false,
    }
  };

  try {
    const docRef = await addDoc(collection(db, INSTANCES_COLLECTION), newInstanceData);
    
    return {
      ...newInstanceData,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Firestore connection error in createInstance:', error);
    return null;
  }
}

export async function getInstance(id: string): Promise<InstanceData | null> {
  if (!db) {
    console.error("Firestore is not initialized. Cannot get instance.");
    return null;
  }
  const instanceRef = doc(db, INSTANCES_COLLECTION, id);
  try {
    const docSnap = await getDoc(instanceRef);

    if (!docSnap.exists()) {
      return null;
    }

    const instance = { id: docSnap.id, ...docSnap.data() } as InstanceData;

    if (instance.completedAt) {
      const completedDate = new Date(instance.completedAt);
      const daysSinceCompletion = differenceInDays(new Date(), completedDate);

      if (daysSinceCompletion > 3) {
        await deleteDoc(instanceRef);
        return null;
      }
    }

    return instance;
  } catch (error) {
    console.error('Firestore connection error in getInstance:', error);
    return null;
  }
}

export async function saveLoveLetter(instanceId: string, letter: string): Promise<boolean> {
  if (!db) {
    console.error("Firestore is not initialized. Cannot save love letter.");
    return false;
  }
  const instanceRef = doc(db, INSTANCES_COLLECTION, instanceId);
  try {
    await updateDoc(instanceRef, {
      loveLetters: arrayUnion(letter),
      'checklist.loveLetter': true,
    });
    return true;
  } catch (error) {
    console.error("Error saving love letter: ", error);
    return false;
  }
}

export async function updateChecklistItem(instanceId: string, item: keyof Checklist): Promise<boolean> {
    if (!db) {
      console.error("Firestore is not initialized. Cannot update checklist.");
      return false;
    }
    const instanceRef = doc(db, INSTANCES_COLLECTION, instanceId);
    try {
        const docSnap = await getDoc(instanceRef);
        if (!docSnap.exists()) return false;

        const instance = docSnap.data() as InstanceData;
        const currentChecklist = instance.checklist || { loveLetter: false, photoAlbum: false, timeline: false, quiz: false };
        
        if (currentChecklist[item]) {
          return true;
        }
        
        const updatedChecklist = { ...currentChecklist, [item]: true };
        
        const updatePayload: { [key: string]: any } = {
            checklist: updatedChecklist
        };
        
        const allComplete = Object.values(updatedChecklist).every(Boolean);

        if (allComplete && !instance.completedAt) {
            updatePayload.completedAt = new Date().toISOString();
        }

        await updateDoc(instanceRef, updatePayload);
        return true;

    } catch (error) {
        console.error("Error updating checklist item: ", error);
        return false;
    }
}

export async function addTimelineEvent(instanceId: string, event: TimelineEvent): Promise<boolean> {
  if (!db) {
    console.error("Firestore is not initialized. Cannot add timeline event.");
    return false;
  }
  const instanceRef = doc(db, INSTANCES_COLLECTION, instanceId);
  try {
    await updateDoc(instanceRef, {
      timelineEvents: arrayUnion(event),
      'checklist.timeline': true,
    });
    return true;
  } catch (error)
 {
    console.error("Error adding timeline event: ", error);
    return false;
  }
}

export async function addPhoto(instanceId: string, photo: Photo): Promise<boolean> {
  if (!db) {
    console.error("Firestore is not initialized. Cannot add photo.");
    return false;
  }
  const instanceRef = doc(db, INSTANCES_COLLECTION, instanceId);
  try {
    await updateDoc(instanceRef, {
      photos: arrayUnion(photo),
      'checklist.photoAlbum': true,
    });
    return true;
  } catch (error) {
    console.error("Error adding photo: ", error);
    return false;
  }
}
