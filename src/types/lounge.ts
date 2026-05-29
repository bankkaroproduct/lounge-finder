
export interface Lounge {
  id: number;
  name: string;
  airport: string;
  city: string;
  state: string;
  terminal?: string;
  location: string;
  hours: string;
  amenities: string[];
  guestPolicy: string;
  paidAccess?: string;
  rating: string;
  reviews: string;
  image: string;
  allImages: string[];
  eligibleCards: string[];
  networks: string[];
  mapLink?: string;
  contactNo?: string;
  website?: string;
  google_rating?: number;
  google_reviews?: number;
  google_address?: string;
  map_link_new?: string;
  email?: string;
}

export interface CreditCard {
  id: number;
  name: string;
  logo?: string;
  network?: string;
  bank?: string;
}

export interface Network {
  name: string;
  cardCount: number;
}
