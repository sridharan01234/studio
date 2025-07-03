
import PhotoGallery from '@/components/PhotoGallery';
import { Camera } from 'lucide-react';
import { getInstance } from '@/services/instanceService';
import { notFound } from 'next/navigation';
import ChecklistUpdater from '@/components/ChecklistUpdater';

export default async function PhotoAlbumPage({ params }: { params: { instanceId: string } }) {
  const instance = await getInstance(params.instanceId);

  if (!instance) {
    notFound();
  }

  const photos = instance.photos || [];

  return (
    <div className="min-h-screen bg-background w-full">
      <ChecklistUpdater instanceId={params.instanceId} item="photoAlbum" />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Camera className="mx-auto h-12 w-12 text-accent mb-4" />
          <h1 className="text-5xl md:text-6xl font-headline text-gray-800">
            Our Photo Album
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            A collection of moments that tell our story. Click on any photo to see it larger.
          </p>
        </div>
        
        <PhotoGallery photos={photos} />
      </div>
    </div>
  );
}
