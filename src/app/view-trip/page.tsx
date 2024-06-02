"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Autocomplete,
  DirectionsRenderer,
  GoogleMap,
  MarkerF,
  useLoadScript,
} from "@react-google-maps/api";
import {
  ClockIcon,
  CloudSunIcon,
  FlagIcon,
  FootprintsIcon,
  MapIcon,
  MapPinIcon,
} from "lucide-react";

import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { NearbyPlaces, Place, Site } from "@/types/Site";
import { auth, firestoreDb } from "@/lib/firebase/firebase-config";
import {
  translateDifficulty,
  translateDistrict,
  translateDuration,
} from "@/lib/search-utils";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PlaceCard from "@/components/PlaceCard";
import { getLocWeather } from "@/lib/handleWeather";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { useSiteContext } from "@/context/SiteContext";
import { Label } from "@/components/ui/label";
import ItineraryNode from "@/components/ItineraryNode";
import { Trip, TripStop } from "@/types/Site";
import Link from "next/link";
import { cn } from "@/lib/utils";
type AutocompleteType = google.maps.places.Autocomplete;
type PlaceType = google.maps.places.PlaceResult;
type DirectionsResult = google.maps.DirectionsResult;

const ViewTrip = () => {
  const libraries = useMemo(() => ["places"], []);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
    libraries: libraries as any,
  });
  const { currentTrip, setSite, site } = useSiteContext();
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [itinerary, setItinerary] = useState<TripStop[]>([]);
  const [weather, setWeather] = useState(null);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: true,
    scrollwheel: false,
  };
  const mapRef = useRef<google.maps.Map | null>(null);
  useEffect(() => {
    if (!user) router.push("/");
    if (!currentTrip || !site) router.push("/sites");
    //update site context to the trip's site
    setSite(
      currentTrip?.itinerary.find((stop: TripStop) => stop.type == "mainSite")
        ?.info
    );
    //update weather
    if (site) {
      getLocWeather(site.id).then((weather) => {
        setWeather(weather);
      });
    }
    //update itinerary and set ready
    if (currentTrip) setItinerary(currentTrip?.itinerary);
    if (isMapReady == false) setIsMapReady(true);
  }, []);
  useEffect(() => {
    if (isMapReady && isLoaded) generateRoute();
  }, [isMapReady, isLoaded]);
  const generateRoute = () => {
    if (itinerary) {
      if (itinerary.length < 2) {
        setDirections(null);
        mapRef.current?.setZoom(14);
        return;
      }
      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(
          +itinerary[0].info.location.x,
          +itinerary[0].info.location.y
        ),
        destination: new google.maps.LatLng(
          +itinerary[itinerary.length - 1].info.location.x,
          +itinerary[itinerary.length - 1].info.location.y
        ),
        waypoints: itinerary
          .slice(1, itinerary.length - 1)
          .map((e: TripStop) => {
            return {
              stopover: true,
              location: new google.maps.LatLng(
                +e.info.location.x,
                +e.info.location.y
              ),
            };
          }),
        provideRouteAlternatives: false,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
      };

      directionsService.route(request, (res, stat) => {
        if (stat === "OK") {
          setDirections(res);
        }
      });
    }
  };

  if (!isLoaded) {
    return <p>Loading...</p>;
  }
  const directionsService = new google.maps.DirectionsService();

  return (
    currentTrip &&
    site && (
      <div className="flex flex-col lg:grid  lg:grid-cols-2 ">
        <div className=" max-h-[50vh] lg:max-h-[100%] lg:h-[calc(100vh-55px)] flex-col bg-muted text-white flex dark:border-r">
          <GoogleMap
            options={mapOptions}
            zoom={14}
            center={{
              lat: parseFloat(site.location.x),
              lng: parseFloat(site.location.y),
            }}
            mapTypeId={google.maps.MapTypeId.ROADMAP}
            mapContainerStyle={{ height: "800px" }} //NECESSARY?
            onLoad={(map) => {
              mapRef.current = map;
            }}
            //onClick={handleMapClick}
          >
            <DirectionsRenderer
              directions={directions || undefined}
              options={{
                suppressMarkers: false,
              }}
            />
          </GoogleMap>
        </div>
        <div
          className="py-8 lg:p-8 h-max px-4 lg:max-h-[calc(100vh-55px)] overflow-scroll"
          dir="rtl"
        >
          <div className="mx-auto flex w-full flex-col h-full">
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight  ">
              {currentTrip?.name}
            </h2>
            <p className="leading-7 ">{site?.description}</p>
            <div className="flex flex-row gap-6 pt-2">
              {/* {site.googleRating && <span>⭐{site.googleRating?.stars}</span>} */}
              <span className="flex items-center flex-row gap-1 text-sm  font-semibold ">
                <CloudSunIcon className="w-4 h-4" /> {weather}°
              </span>

              {(site?.district || site?.district === 0) && (
                <span className="flex items-center flex-row gap-1 text-sm font-semibold ">
                  <MapPinIcon className="w-4 h-4" />{" "}
                  {translateDistrict(site?.district)}
                </span>
              )}
              {(site?.duration || site?.duration === 0) && (
                <span className="flex items-center flex-row gap-1 text-sm  font-semibold ">
                  <ClockIcon className="w-4 h-4" />{" "}
                  {translateDuration(site.duration)}
                </span>
              )}
              {(site?.distance || site?.distance === 0) && (
                <span className="flex items-center flex-row gap-1 text-sm  font-semibold ">
                  <FootprintsIcon className="w-4 h-4" /> {site.distance} ק"מ
                </span>
              )}

              <span className="flex items-center flex-row gap-1 text-sm  font-semibold ">
                <FlagIcon className="w-4 h-4" /> מסלול{" "}
                {translateDifficulty(site?.difficulty || 1)}
              </span>
            </div>
          </div>
          {currentTrip.googleRouteLink && (
            <div>
              <Link
                href={currentTrip.googleRouteLink}
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "p-0  m-0 flex flex-row gap-1 justify-start"
                )}
              >
                <MapIcon className="w-4 h-4" />
                הצג מסלול בגוגל מפות
              </Link>
            </div>
          )}
          <div className="pt-[1rem] flex flex-col gap-[1rem]">
            {itinerary?.map((stop, idx) => (
              <div className="">
                <ItineraryNode
                  index={idx}
                  disableClose={true}
                  setSelectedPlaces={setItinerary}
                  isDraggable={false}
                  stop={itinerary[idx]}
                  dragHandle={undefined}
                />
              </div>
            ))}
          </div>
          <div className="mt-[1rem]">
            <Button
              className=""
              onClick={() => {
                if (user && site && user.uid == currentTrip.ownerId) {
                  router.push("/plan");
                }
              }}
            >
              עריכה
            </Button>
          </div>
        </div>
      </div>
    )
  );
};

export default ViewTrip;
