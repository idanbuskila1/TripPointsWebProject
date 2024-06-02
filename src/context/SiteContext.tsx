"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import React from "react";
import { Place, Site } from "@/types/Site";
import { Trip } from "@/types/Site";

// Define the type for the context value
type SiteContextType = {
  site: any;
  setSite: (newSite: Site | Place | undefined | null) => void;
  currentTrip: Trip | undefined | null;
  setCurrentTrip: (trip: Trip | undefined | null) => void;
};

// Create the context
const SiteContext = createContext<SiteContextType | undefined>(undefined);

// Custom hook to use the site context
export const useSiteContext = (): SiteContextType => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSiteContext must be used within a SiteContextProvider");
  }
  return context;
};

// Provider component to wrap your application
export const SiteContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentTrip, setCurrentTripState] = useState<Trip | undefined | null>(
    () => {
      if (typeof window !== "undefined") {
        const storedTrip = localStorage.getItem("currentTrip");
        return storedTrip ? JSON.parse(storedTrip) : undefined;
      }
      return undefined;
    }
  );

  const [site, setSiteState] = useState<Site | Place | undefined | null>(() => {
    if (typeof window !== "undefined") {
      const storedSite = localStorage.getItem("site");
      return storedSite ? JSON.parse(storedSite) : null;
    }
    return null;
  });

  const setSite: SiteContextType["setSite"] = (newSite) => {
    setSiteState(newSite);
    localStorage.setItem("site", JSON.stringify(newSite));
  };

  const setCurrentTrip: SiteContextType["setCurrentTrip"] = (trip) => {
    setCurrentTripState(trip);
    if (trip) {
      localStorage.setItem("currentTrip", JSON.stringify(trip));
    } else {
      localStorage.removeItem("currentTrip");
    }
  };

  return (
    <SiteContext.Provider
      value={{ site, setSite, currentTrip, setCurrentTrip }}
    >
      {children}
    </SiteContext.Provider>
  );
};
