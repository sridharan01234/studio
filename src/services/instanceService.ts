'use server';

import type { InstanceData, Checklist, TimelineEvent, Photo, InstanceDocument } from '@/types/instance';
import { documentToInstanceData } from '@/types/instance';
import { getInstancesCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { differenceInDays } from 'date-fns';

// Helper to safely execute database operations
async function executeDatabaseOperation<T>(
  operation: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error: any) {
    console.error('Database operation error:', error.message);
    return { data: null, error: error.message || 'Database operation failed' };
  }
}

export async function createInstance(
  creatorName: string, 
  partnerName: string
): Promise<{ data: InstanceData | null; error: string | null }> {
  return executeDatabaseOperation(async () => {
    const collection = await getInstancesCollection();
    
    const newInstanceDocument: any = {
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
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newInstanceDocument);
    
    const instanceData: InstanceData = {
      id: result.insertedId.toString(),
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
      },
    };

    return instanceData;
  });
}

export async function getInstance(instanceId: string): Promise<InstanceData | null> {
  try {
    if (!ObjectId.isValid(instanceId)) {
      throw new Error('Invalid instance ID format');
    }

    const collection = await getInstancesCollection();
    const doc = await collection.findOne({ _id: new ObjectId(instanceId) });
    
    if (!doc) {
      return null;
    }

    // Check if instance is expired (more than 3 days after completion)
    if (doc.completedAt) {
      const completedDate = new Date(doc.completedAt);
      const daysSinceCompletion = differenceInDays(new Date(), completedDate);

      if (daysSinceCompletion > 3) {
        await collection.deleteOne({ _id: new ObjectId(instanceId) });
        return null;
      }
    }

    return documentToInstanceData(doc);
  } catch (error: any) {
    console.error('Database operation error:', error.message);
    return null;
  }
}

// New function with error handling for other operations
export async function getInstanceWithError(instanceId: string): Promise<{ data: InstanceData | null; error: string | null }> {
  return executeDatabaseOperation(async () => {
    if (!ObjectId.isValid(instanceId)) {
      throw new Error('Invalid instance ID format');
    }

    const collection = await getInstancesCollection();
    const doc = await collection.findOne({ _id: new ObjectId(instanceId) });
    
    if (!doc) {
      throw new Error('Instance not found');
    }

    return documentToInstanceData(doc);
  });
}

// Legacy function for compatibility with existing code
export async function getInstanceLegacy(instanceId: string): Promise<InstanceData | null> {
  const { data, error } = await getInstanceWithError(instanceId);
  if (error) {
    console.error('Error getting instance:', error);
    return null;
  }
  return data;
}

export async function updateInstance(
  instanceId: string, 
  updateData: Partial<Omit<InstanceDocument, '_id' | 'createdAt'>>
): Promise<{ data: InstanceData | null; error: string | null }> {
  return executeDatabaseOperation(async () => {
    if (!ObjectId.isValid(instanceId)) {
      throw new Error('Invalid instance ID format');
    }

    const collection = await getInstancesCollection();
    
    await collection.updateOne(
      { _id: new ObjectId(instanceId) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date(),
        }
      }
    );

    // Fetch and return the updated document
    const doc = await collection.findOne({ _id: new ObjectId(instanceId) });
    if (!doc) {
      throw new Error('Instance not found or update failed');
    }

    return documentToInstanceData(doc);
  });
}

export async function deleteInstance(instanceId: string): Promise<{ data: boolean; error: string | null }> {
  try {
    if (!ObjectId.isValid(instanceId)) {
      throw new Error('Invalid instance ID format');
    }

    const collection = await getInstancesCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(instanceId) });
    
    return { data: result.deletedCount > 0, error: null };
  } catch (error: any) {
    console.error('Database operation error:', error.message);
    return { data: false, error: error.message || 'Database operation failed' };
  }
}

export async function addLoveLetter(
  instanceId: string, 
  loveLetter: string
): Promise<{ data: InstanceData | null; error: string | null }> {
  return executeDatabaseOperation(async () => {
    if (!ObjectId.isValid(instanceId)) {
      throw new Error('Invalid instance ID format');
    }

    const collection = await getInstancesCollection();
    
    await collection.updateOne(
      { _id: new ObjectId(instanceId) },
      { 
        $push: { loveLetters: loveLetter } as any,
        $set: { 
          "checklist.loveLetter": true,
          updatedAt: new Date()
        }
      }
    );

    // Fetch and return the updated document
    const doc = await collection.findOne({ _id: new ObjectId(instanceId) });
    if (!doc) {
      throw new Error('Instance not found');
    }

    return documentToInstanceData(doc);
  });
}

// Legacy function for compatibility
export async function saveLoveLetter(instanceId: string, letter: string): Promise<boolean> {
  const { data, error } = await addLoveLetter(instanceId, letter);
  if (error) {
    console.error('Error saving love letter:', error);
    return false;
  }
  return true;
}

// Legacy function for compatibility  
export async function updateChecklistItem(instanceId: string, item: keyof Checklist): Promise<boolean> {
  const { data, error } = await updateChecklist(instanceId, { [item]: true });
  if (error) {
    console.error('Error updating checklist item:', error);
    return false;
  }
  
  // Check if all items are complete and mark instance as complete
  if (data?.checklist) {
    const allComplete = Object.values(data.checklist).every(Boolean);
    if (allComplete && !data.completedAt) {
      await markInstanceComplete(instanceId);
    }
  }
  
  return true;
}

export async function addPhoto(
  instanceId: string, 
  photo: Photo
): Promise<{ data: InstanceData | null; error: string | null }> {
  return executeDatabaseOperation(async () => {
    if (!ObjectId.isValid(instanceId)) {
      throw new Error('Invalid instance ID format');
    }

    const collection = await getInstancesCollection();
    
    await collection.updateOne(
      { _id: new ObjectId(instanceId) },
      { 
        $push: { photos: photo } as any,
        $set: { 
          "checklist.photoAlbum": true,
          updatedAt: new Date()
        }
      }
    );

    // Fetch and return the updated document
    const doc = await collection.findOne({ _id: new ObjectId(instanceId) });
    if (!doc) {
      throw new Error('Instance not found');
    }

    return documentToInstanceData(doc);
  });
}

export async function addTimelineEvent(
  instanceId: string, 
  event: TimelineEvent
): Promise<{ data: InstanceData | null; error: string | null }> {
  return executeDatabaseOperation(async () => {
    if (!ObjectId.isValid(instanceId)) {
      throw new Error('Invalid instance ID format');
    }

    const collection = await getInstancesCollection();
    
    await collection.updateOne(
      { _id: new ObjectId(instanceId) },
      { 
        $push: { timelineEvents: event } as any,
        $set: { 
          "checklist.timeline": true,
          updatedAt: new Date()
        }
      }
    );

    // Fetch and return the updated document
    const doc = await collection.findOne({ _id: new ObjectId(instanceId) });
    if (!doc) {
      throw new Error('Instance not found');
    }

    return documentToInstanceData(doc);
  });
}

export async function updateChecklist(
  instanceId: string, 
  checklist: Partial<Checklist>
): Promise<{ data: InstanceData | null; error: string | null }> {
  return executeDatabaseOperation(async () => {
    if (!ObjectId.isValid(instanceId)) {
      throw new Error('Invalid instance ID format');
    }

    const collection = await getInstancesCollection();
    
    // Build the update object for nested checklist fields
    const updateFields: any = { updatedAt: new Date() };
    Object.entries(checklist).forEach(([key, value]) => {
      updateFields[`checklist.${key}`] = value;
    });
    
    await collection.updateOne(
      { _id: new ObjectId(instanceId) },
      { $set: updateFields }
    );

    // Fetch and return the updated document
    const doc = await collection.findOne({ _id: new ObjectId(instanceId) });
    if (!doc) {
      throw new Error('Instance not found');
    }

    return documentToInstanceData(doc);
  });
}

export async function markInstanceComplete(instanceId: string): Promise<{ data: InstanceData | null; error: string | null }> {
  return executeDatabaseOperation(async () => {
    if (!ObjectId.isValid(instanceId)) {
      throw new Error('Invalid instance ID format');
    }

    const collection = await getInstancesCollection();
    
    await collection.updateOne(
      { _id: new ObjectId(instanceId) },
      { 
        $set: { 
          completedAt: new Date().toISOString(),
          updatedAt: new Date()
        }
      }
    );

    // Fetch and return the updated document
    const doc = await collection.findOne({ _id: new ObjectId(instanceId) });
    if (!doc) {
      throw new Error('Instance not found');
    }

    return documentToInstanceData(doc);
  });
}

export async function getCompletionStatus(instanceId: string): Promise<{ data: any | null; error: string | null }> {
  return executeDatabaseOperation(async () => {
    const instance = await getInstance(instanceId);
    
    if (!instance) {
      throw new Error('Instance not found');
    }

    const checklist = instance.checklist || {
      loveLetter: false,
      photoAlbum: false,
      timeline: false,
      quiz: false,
    };

    const completedTasks = Object.values(checklist).filter(Boolean).length;
    const totalTasks = Object.keys(checklist).length;
    const progress = Math.round((completedTasks / totalTasks) * 100);
    
    const daysSinceCreation = instance.completedAt 
      ? differenceInDays(new Date(instance.completedAt), new Date())
      : 0;

    return {
      progress,
      completedTasks,
      totalTasks,
      isComplete: completedTasks === totalTasks,
      daysSinceCreation,
      checklist,
    };
  });
}
