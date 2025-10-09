import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface AnimalCardProps {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  status: 'lost' | 'found';
  breed?: string;
  color: string;
  location: string;
  dateReported: string;
  description: string;
  imageUrl: string;
  contactInfo?: string;
  onViewDetails?: () => void;
  onContact?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function AnimalCard({
  id,
  name,
  type,
  status,
  breed,
  color,
  location,
  dateReported,
  description,
  imageUrl,
  contactInfo,
  onViewDetails,
  onContact,
  size = 'medium'
}: AnimalCardProps) {
  const cardSizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg'
  };

  return (
    <Card className={`${cardSizeClasses[size]} overflow-hidden hover:shadow-lg transition-shadow`}>
      <div className="relative">
        <ImageWithFallback
          src={imageUrl}
          alt={`${status} ${type} named ${name}`}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 left-2">
          <Badge variant={status === 'lost' ? 'destructive' : 'default'}>
            {status === 'lost' ? 'ПОТЕРЯН' : 'НАЙДЕН'}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary">
            {type === 'dog' ? 'Собака' : type === 'cat' ? 'Кошка' : 'Другое'}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{name}</h3>
            {breed && (
              <span className="text-sm text-muted-foreground">{breed}</span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Окрас: {color}</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{location}</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v4"/>
              <path d="M16 2v4"/>
              <rect width="18" height="18" x="3" y="4" rx="2"/>
              <path d="M3 10h18"/>
            </svg>
            <span>{dateReported}</span>
          </div>
          
          <p className="text-sm text-foreground line-clamp-2">{description}</p>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={onViewDetails}
        >
          Подробнее
        </Button>
        {contactInfo && (
          <Button 
            size="sm" 
            className="flex-1 flex items-center gap-1"
            onClick={onContact}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Связаться
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}