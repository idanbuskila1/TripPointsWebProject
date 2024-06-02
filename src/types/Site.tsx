export type Site = {
  id: string;
  name: string;
  images: {
    src: string;
    alt: string;
  }[];
  location: {
    x: string;
    y: string;
  };
  district: 0 | 1 | 2 | 3;
  difficulty: number;
  distance?: number;
  googleRating?: string;
  googleLink?: string;
  wazeLink?: string;
  duration?: number;
  description?: string;
  tags: string[];
  activities?: string[];
  food?: string[];
  openingHours?: {
    sunday: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
  };
  color?: string;
  time?: string;
  date?: Date;
  index?: number;
  cardPosition?: number;
  depTime?: string;
  travelTime?: string;
  stayTime?: string;
  travelMode?: string;
};
/*export type Visit = {
  mainSite: Site;
  nearbyPlaces: Place[];
};*/

export type NearbyPlaces = {
  locationId: string;
  parkings: Place[];
  gasStations: Place[];
  restaurants: Place[];
};
export interface TripStop {
  info: Place | Site;
  type?:
    | "parkings"
    | "gasStations"
    | "restaurants"
    | "entryPoint"
    | "mainSite"
    | "customPoint";
}
export interface Trip {
  id: string;
  ownerId: string;
  name: string;
  date: string;
  googleRouteLink?: string;
  itinerary: TripStop[];
}
export type Place = {
  name: string;
  distanceInKm: number; //distance from the location with locationId
  googleLink?: string;
  wazeLink?: string;
  googleRating?: string;
  location: { x: string; y: string };
  kind?: string;
  color?: string;
  time?: string;
  date?: Date;
  index?: number;
  cardPosition?: number;
  depTime?: string;
  travelTime?: string;
  stayTime?: string;
  travelMode?: string;
};
