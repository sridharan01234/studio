
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import type { Photo } from '@/types/instance';

type PhotoGalleryProps = {
  photos: Photo[];
};

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {photos.map((photo, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <div 
                className="overflow-hidden rounded-lg shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300"
                onClick={() => setSelectedPhoto(photo)}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={800}
                  height={800}
                  className="w-full h-auto object-cover"
                  data-ai-hint={photo.hint}
                />
              </div>
            </DialogTrigger>
          </Dialog>
        ))}
      </div>

      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={(isOpen) => !isOpen && setSelectedPhoto(null)}>
          <DialogContent className="max-w-3xl p-0 border-0">
            <Image
              src={selectedPhoto.src}
              alt={selectedPhoto.alt}
              width={1200}
              height={1200}
              className="w-full h-auto object-contain rounded-lg"
              data-ai-hint={selectedPhoto.hint}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
