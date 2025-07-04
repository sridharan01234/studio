
'use server';

import type { InstanceData, Checklist, TimelineEvent, Photo } from '@/types/instance';
import { getDb } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  type Firestore,
} from 'firebase/firestore';
import { differenceInDays } from 'date-fns';

const INSTANCES_COLLECTION = 'instances';

// Helper to get DB or return an error object.
// This is the single point of entry for getting the db in this service.
function getDbSafe(): { db: Firestore | null; error: string | null } {
  try {
    return { db: getDb(), error: null };
  } catch (e: any) {
    // The error from getDb is already user-friendly.
    console.error("Firebase connection error:", e.message);
    return { db: null, error: e.message };
  }
}

export async function createInstance(creatorName: string, partnerName:string): Promise<{ data: InstanceData | null; error: string | null }> {
    const { db, error: dbError } = getDbSafe();
    if (dbError || !db) {
        return { data: null, error: dbError };
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
        
        const instance = {
            ...newInstanceData,
            id: docRef.id,
        };
        return { data: instance, error: null };

    } catch (error: any) {
        console.error('Firestore operation error in createInstance:', error);
        return { data: null, error: `Could not connect to the database. This might be a network issue or a problem with your Firestore Security Rules. Original error: ${error.message}` };
    }
}

export async function getInstance(id: string): Promise<InstanceData | null> {
    const { db, error: dbError } = getDbSafe();
    if (dbError || !db) {
        // This function returns null on error, so we log and return.
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
        console.error('Firestore operation error in getInstance:', error);
        return null;
    }
}

export async function saveLoveLetter(instanceId: string, letter: string): Promise<boolean> {
    const { db, error: dbError } = getDbSafe();
    if (dbError || !db) return false;

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
    const { db, error: dbError } = getDbSafe();
    if (dbError || !db) return false;

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
    const { db, error: dbError } = getDbSafe();
    if (dbError || !db) return false;

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
    const { db, error: dbError } = getDbSafe();
    if (dbError || !db) return false;
    
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
