import { Timestamp } from "firebase/firestore";
import { Place, Site } from "./Site";

/*export type SiteVisit = {
  id: string;
  date: Date;
  site: Site;
  weatherOnDay?: number;
};

export type Route = {
  description: string;
  duration: number;
  startTime: Date;
  points?: { x: number; y: number }[];
};

export type TripEntry = {
  id: string;
  name: string;
  ownerId: string;
  //metadata is a dictionary of key-value pairs
  metadata?: Record<string, string>;
  //itinerary: Visit[];
  date?: Date | Timestamp;
  updatedAt?: Date;
  img?: string;
};
*/
export interface HistoricAlert {
  time: number;
  cities: string[];
  threat: number;
  isDrill: boolean;
}
