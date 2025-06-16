import Image from 'next/image';
import Link from 'next/link';

interface ArtworkCardProps {
  id: string;
  title: string;
  image: string;
  price?: number;
  artistName: string;
  artistAvatar?: string | null;
}

export function ArtworkCard({ id, title, image, price, artistName, artistAvatar }: ArtworkCardProps) {
  return (
    <Link href={`/art-details/${id}`} className="group block">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl">
          <Image
            src={image}
            alt={title}
            width={400}
            height={300}
            className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold group-hover:text-orange-600 transition-colors line-clamp-1">{title}</h3>
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden">
              <Image
                src={artistAvatar || '/default-avatar.png'}
                alt={artistName}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-sm text-muted-foreground truncate">by {artistName}</p>
          </div>
          {typeof price === 'number' && (
            <p className="text-lg font-bold text-orange-600">
              ${price.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
} 