"use client";

import { Card, CardContent } from "./ui/card";
import { FC, RefObject, createRef, useEffect, useRef, useState } from "react";
import {
  FuelIcon,
  MapIcon,
  ParkingMeterIcon,
  SquareParkingIcon,
  StarIcon,
  Utensils,
} from "lucide-react";

import { Icons } from "./ui/Icons";
import Link from "next/link";
import { Place } from "@/types/Site";
import { buttonVariants } from "./ui/button";
import { cn, googleMapPlaceLink } from "@/lib/utils";

interface PlaceCardProps {
  place: Place;
  onClick: () => void;
  isSelected: boolean;
  kind: string;
  isHover: boolean;
  setFocus?: ({ x, y }: { x: string; y: string }) => void;
}

const PlaceCard: FC<PlaceCardProps> = ({
  place,
  isSelected,
  isHover,
  onClick,
  kind,
  setFocus,
}) => {
  const ce = useRef<any>();

  useEffect(() => {
    isHover && ce?.current?.scrollIntoView({ behavior: "smooth" });
  }, [isHover]);
  return (
    <Card
      ref={ce}
      onClick={onClick}
      onMouseOver={(e) => setFocus && setFocus(place.location)}
      className={cn(
        `cursor-pointer p-2`,
        isHover && "bg-slate-100",
        isSelected && "bg-slate-300"
      )}
    >
      <CardContent className="p-0 grid grid-cols-12 items-center text-sm lg:text-[1rem] ">
        <div className="flex flex-row gap-1 items-center col-span-5">
          {kind == "parking" && <SquareParkingIcon className="w-4 h-4" />}
          {kind == "restaurant" && <Utensils className="w-4 h-4" />}
          {kind == "gasStation" && <FuelIcon className="w-4 h-4" />}
          <p className="pb-1 truncate">{place.name}</p>
        </div>
        <div className="flex flex-row col-span-2 items-center items-center gap-1">
          <StarIcon className="w-4 h-4" />
          <p>{place.googleRating ? place.googleRating : "--"}</p>
        </div>
        <p className="col-span-3 items-center">
          {place.distanceInKm.toFixed(1)} ק"מ מהאתר
        </p>
        <div className="flex flex-row col-span-1 items-center items-center gap-1">
          {place.wazeLink && (
            <>
              <Link
                href={place.wazeLink}
                target="_blank"
                className={cn(buttonVariants({ variant: "link" }), "p-0  m-0")}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Icons.waze className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
        <div className="flex flex-row col-span-1 items-center items-center gap-1">
          {place.googleLink && (
            <div className="flex flex-row items-center gap-1">
              <Link
                href={googleMapPlaceLink(
                  place.location.x,
                  place.location.y,
                  place.googleLink.split("place_id:")[1]
                )}
                target="_blank"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "p-0  m-0 flex flex-row gap-1"
                )}
              >
                <MapIcon className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaceCard;
