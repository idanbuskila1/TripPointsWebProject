import Fuse from "fuse.js";
import { firestoreDb } from "../lib/firebase/firebase-config";

export async function getTags() {
  // select all distinct tags from the locations collection
  const locations = await firestoreDb.locations();
  const tags = locations.flatMap((loc) => loc.tags);
  return [...new Set(tags)];
}

export const translateTag = (tag: string) => {
  const translations: Record<string, string> = {
    forFamilies: "מתאים למשפחות",
    roundTrip: "טיול מעגלי",
    blossom: "פריחה",
    dogsCompatible: "מתאים לכלבים",
    winterCompatible: "מתאים לחורף",
    picnic: "פיקניק",
    water: "מים",
    summerCompatible: "מתאים לקיץ",
    bikesCompatible: "מתאים לאופניים",
    viewpoint: "נוף",
    romantic: "רומנטי",
    accessibility: "נגיש",
    walk: "הליכה",
    historic: "היסטורי",
  };
  return translations[tag] || tag;
};

export const translateDifficulty = (difficulty: number) => {
  if (difficulty === 1) return "קל";
  if (difficulty === 2) return "בינוני";
  if (difficulty === 3) return "קשה";
  return "קל";
};

export const translateDistrict = (district: number) => {
  if (district === 0) return "צפון";
  if (district === 1) return "מרכז";
  if (district === 2) return "דרום";
  if (district === 3) return "ירושלים";
  return "כללי";
};

export const translateDuration = (duration: number) => {
  if (duration === 0) return "חצי יום";
  if (duration === 1) return "יום מלא";
  if (duration === 2) return "יותר מיום";
  return "חצי יום";
};

// searches the locations collection based on filters
export async function searchLocations({
  query,
  difficulties,
  districts,
  tags,
}: {
  query?: string;
  difficulties?: number[];
  districts?: number[];
  tags?: string[];
} = {}) {
  const fuseOptions = {
    // isCaseSensitive: false,
    // includeScore: false,
    // shouldSort: true,
    // includeMatches: false,
    // findAllMatches: false,
    // minMatchCharLength: 1,
    // location: 0,
    // threshold: 0.6,
    // distance: 100,
    // useExtendedSearch: false,
    // ignoreLocation: false,
    // ignoreFieldNorm: false,
    // fieldNormWeight: 1,
    keys: ["name", "description", "tags"],
  };

  let locations = await firestoreDb.locations();
  if (difficulties && difficulties.length > 0) {
    locations = locations.filter((loc) => {
      if (difficulties.includes(1)) {
        return difficulties.includes(loc.difficulty) || !loc.difficulty;
      } else return difficulties.includes(loc.difficulty);
    });
  }
  if (districts && districts.length > 0) {
    locations = locations.filter((loc) => districts.includes(loc.district));
  }
  if (tags && tags.length > 0) {
    locations = locations.filter((loc) =>
      tags.every((tag) => loc.tags.includes(tag))
    );
  }
  if (!query) {
    return locations;
  }

  const fuse = new Fuse(locations, fuseOptions);
  return fuse.search(query, { limit: 50 }).map((result) => result.item);
}
