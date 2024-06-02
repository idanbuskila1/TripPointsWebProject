"use client";

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
import { Place, Site } from "@/types/Site";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { haversineDistance } from "@/lib/utils";

interface AddPlaceButtonProps {
  setSelectedPlaces: React.Dispatch<React.SetStateAction<Place[]>>;
  placeName: string;
  autocomplete: google.maps.places.Autocomplete | null;
  site: Site;
}

type AutocompleteType = google.maps.places.Autocomplete;
type PlaceType = google.maps.places.PlaceResult;

const AddPlaceButton: FC<AddPlaceButtonProps> = ({
  setSelectedPlaces,
  placeName,
  site,
  autocomplete,
}) => {
  const [newName, setNewName] = useState<string>(placeName);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    setNewName(placeName);
  }, [placeName]);

  const onAddPlace = () => {
    if (autocomplete !== null && site.location !== undefined) {
      const place: PlaceType = autocomplete.getPlace() as PlaceType;
      if (place.geometry && place.geometry.location) {
        const { lat, lng } = place.geometry.location;
        if (newName !== null || newName !== "") {
          const distance = haversineDistance(
            parseFloat(site.location.x),
            parseFloat(site.location.y),
            lat(),
            lng()
          );
          const newPlace: Place = {
            name: newName, // Assigning an empty string if place.name is undefined
            location: { x: lat().toString(), y: lng().toString() }, // Converting lat and lng to strings
            distanceInKm: distance, // Calculated distance
          };
          setSelectedPlaces((prevSelectedPlaces) => {
            if (prevSelectedPlaces === undefined) {
              return [newPlace];
            } else {
              return [...prevSelectedPlaces, newPlace];
            }
          });
          setIsDialogOpen(false);
        }
      }
    }
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>הוסף</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>איך תרצו לשמור את שם המקום?</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="name"
              defaultValue={placeName}
              className="col-span-3"
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={onAddPlace}
            type="submit"
            className="bg-primary text-white p-2 rounded-lg justify-self-end"
          >
            הוסף עצירה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlaceButton;
