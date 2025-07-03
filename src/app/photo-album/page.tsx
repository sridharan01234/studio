import PhotoGallery from '@/components/PhotoGallery';
import { Camera } from 'lucide-react';

const photos = [
  { src: 'https://placehold.co/600x800.png', alt: 'A romantic moment under the stars.', hint: 'couple stars' },
  { src: 'https://placehold.co/800x600.png', alt: 'Laughing together on a sunny afternoon.', hint: 'couple laughing' },
  { src: 'https://placehold.co/600x600.png', alt: 'A cozy selfie.', hint: 'couple selfie' },
  { src: 'https://placehold.co/600x900.png', alt: 'Walking hand in hand on the beach.', hint: 'couple beach' },
  { src: 'https://placehold.co/700x500.png', alt: 'A shared meal at our favorite cafe.', hint: 'couple cafe' },
  { src: 'https://placehold.co/500x700.png', alt: 'Adventure in the mountains.', hint: 'couple mountains' },
  { src: 'https://placehold.co/800x800.png', alt: 'Celebrating an anniversary.', hint: 'couple anniversary' },
  { src: 'https://placehold.co/600x800.png', alt: 'A quiet moment at home.', hint: 'couple home' },
];

export default function PhotoAlbumPage() {
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
        </div>
        
        <PhotoGallery photos={photos} />
      </div>
    </div>
  );
}
