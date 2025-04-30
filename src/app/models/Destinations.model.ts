export interface Destinations {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  country?: string;
  city?: string;
  price?: number; 
  isActive: boolean;
}
