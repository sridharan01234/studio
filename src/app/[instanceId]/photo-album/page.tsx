
import PhotoGallery from '@/components/PhotoGallery';
import { Camera, ImagePlus } from 'lucide-react';
import { getInstance } from '@/services/instanceService';
import { notFound } from 'next/navigation';
import { AddPhotoForm } from '@/components/AddPhotoForm';

export default async function PhotoAlbumPage({
  params,
  searchParams,
}: {
  params: { instanceId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const instance = await getInstance(params.instanceId);
  const isPartnerView = searchParams.partner === 'true';

  if (!instance) {
    notFound();
  }

  const photos = instance.photos || [];

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Camera className="mx-auto h-12 w-12 text-accent mb-4" />
          <h1 className="text-5xl md:text-6xl font-headline text-gray-800">
            Our Photo Album
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            A collection of moments that tell our story. Click on any photo to see it larger.
          </p>
          {!isPartnerView && (
            <div className="mt-8">
              <AddPhotoForm instanceId={params.instanceId} />
            </div>
          )}
        </div>
        
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <ImagePlus className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-headline text-gray-700">Your Photo Album is Empty</h2>
            <p className="text-muted-foreground mt-2">
              {isPartnerView
                ? 'Your partner is still curating your photos!'
                : 'Click "Add Photo" to start your collection.'}
            </p>
          </div>
        ) : (
          <PhotoGallery photos={photos} />
        )}
      </div>
    </div>
  );
}
