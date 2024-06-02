"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ClockIcon,
  CloudSunIcon,
  FlagIcon,
  FootprintsIcon,
  MapPinIcon,
  Plus,
  Trash,
  XIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FC, useEffect, useState } from "react";
import {
  translateDifficulty,
  translateDistrict,
  translateDuration,
  translateTag,
} from "@/lib/search-utils";

import { Button } from "@/components/ui/button";
import { Site, Trip } from "@/types/Site";
import { firestoreDb } from "@/lib/firebase/firebase-config";
import { getLocWeather } from "@/lib/handleWeather";
import { useRouter } from "next/navigation";
import { useSiteContext } from "@/context/SiteContext";
import { useToast } from "./ui/use-toast";

interface SavedTripCardProps {
  site: any; //actually Site
  trip: Trip;
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
}

const SavedTripCard: FC<SavedTripCardProps> = ({ site, trip, setTrips }) => {
  const [weather, setWeather] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { setCurrentTrip, setSite } = useSiteContext();
  const { toast } = useToast();
  const router = useRouter();
  useEffect(() => {
    if (site.location) {
      getLocWeather(site.id).then((weather) => {
        setWeather(weather);
      });
    }
  });

  const deleteTrip = () => {
    firestoreDb.deleteTrip(trip.id).then(() => {
      console.log("Trip saved:", trip);
      setIsDeleteDialogOpen(false);
      setTrips((prev) => prev.filter((t) => t.id !== trip.id));
      toast({
        title: "הטיול נמחק בהצלחה",
      });
    });
  };

  return (
    <div dir="rtl" className="justify-starts text-right">
      <div
        className="rounded-xl relative hover:scale-105 transition-transform cursor-pointer"
        dir="rtl"
      >
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <XIcon className="w-4 h-4 absolute top-3 left-3 cursor-pointer z-50 text-white" />
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>האם אתם בטוחים שתרצו למחוק את הטיול?</DialogTitle>
              <DialogDescription>
                שימו לב, פעולה זו אינה הפיכה.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              {/* <DialogCancel>Cancel</DialogCancel> */}
              {/* <DialogAction>Continue</DialogAction> */}
              <Button
                variant={"outline"}
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                }}
              >
                ביטול
              </Button>
              <Button variant={"destructive"} onClick={deleteTrip}>
                מחק
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div
          className="absolute flex flex-col justify-between w-full h-full bg-black/40 rounded-xl text-white"
          onClick={() => {
            setSite(site);
            setCurrentTrip(trip);
            router.push("/view-trip");
          }}
        >
          <div>
            <p className="font-bold text-2xl px-2 pt-4">{trip.name} </p>
            <p className="px-2 line-clamp-2">{site.description}</p>
          </div>
          <div className="flex flex-row gap-6 p-2">
            {/* {site.googleRating && <span>⭐{site.googleRating?.stars}</span>} */}
            <span className="flex items-center flex-row gap-1 text-sm  font-semibold ">
              <CloudSunIcon className="w-4 h-4" /> {weather}°
            </span>

            {(site.location || site.location === 0) && (
              <span className="flex items-center flex-row gap-1 text-sm font-semibold ">
                <MapPinIcon className="w-4 h-4" />{" "}
                {translateDistrict(site.district)}
              </span>
            )}
            {(site.duration || site.duration === 0) && (
              <span className="flex items-center flex-row gap-1 text-sm  font-semibold ">
                <ClockIcon className="w-4 h-4" />{" "}
                {translateDuration(site.duration)}
              </span>
            )}
            {(site.distance || site.distance === 0) && (
              <span className="flex items-center flex-row gap-1 text-sm  font-semibold ">
                <FootprintsIcon className="w-4 h-4" /> {site.distance} ק"מ
              </span>
            )}
            {site.difficulty || site.difficulty === 0 ? (
              <span className="flex items-center flex-row gap-[1vw] text-sm font-semibold ">
                <FlagIcon className="w-4 h-4" />
                {translateDifficulty(site.difficulty)}
              </span>
            ) : (
              <span className="flex items-center flex-row gap-[1vw] text-sm font-semibold ">
                <FlagIcon className="w-4 h-4" />
                {translateDifficulty(0)}
              </span>
            )}
          </div>
        </div>
        {site?.images?.length && (
          <img
            className="max-h-[160px]  md:max-h-[200px] w-full object-cover rounded-xl"
            src={site.images[0]?.src}
            alt="/"
          />
        )}
      </div>
    </div>
  );
};

export default SavedTripCard;
