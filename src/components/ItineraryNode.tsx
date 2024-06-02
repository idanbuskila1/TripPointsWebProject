import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import "react-datepicker/dist/react-datepicker.css";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "./ui/card";
import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import {
  FuelIcon,
  GripVerticalIcon,
  MapIcon,
  SquareParkingIcon,
  StarIcon,
  Utensils,
  XIcon,
} from "lucide-react";

import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { Icons } from "./ui/Icons";
import Link from "next/link";
import { Place } from "@/types/Site";
import TimePicker from "react-time-picker";
import { buttonVariants } from "./ui/button";
import { cn, googleMapPlaceLink } from "@/lib/utils";
import { he } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TripStop } from "@/types/Site";

registerLocale("he", he);
interface ItineraryNodeProps {
  stop: TripStop;
  setSelectedPlaces: React.Dispatch<React.SetStateAction<TripStop[]>>;
  disableClose: boolean;
  index: number;
  bColor?: string;
  hour?: string;
  date?: Date;
  renderKey?: boolean;
  isDraggable: boolean;
  onUpdateColor?: (color: string) => void;
  onUpdateTime?: (time: string) => void;
  onUpdateDate?: (date: Date) => void;
  onDelete?: (n: number) => void;
  dragHandle?: DraggableProvidedDragHandleProps | null | undefined;
}

const SelectedPlaceCard: FC<ItineraryNodeProps> = ({
  stop,
  setSelectedPlaces,
  disableClose,
  bColor = "#000000",
  hour = "00:00",
  date = new Date(),
  renderKey,
  index,
  onUpdateColor,
  onUpdateTime,
  onUpdateDate,
  onDelete,
  dragHandle,
  isDraggable,
}) => {
  return (
    <Card className={cn("relative cursor-pointer p-4 text-sm")} key={index}>
      {!disableClose && (
        <XIcon
          className="w-4 h-4 absolute top-3 left-3 cursor-pointer"
          onClick={() => {
            if (disableClose) return;
            setSelectedPlaces((prev) =>
              prev?.filter((p) => p.info !== stop.info)
            );
          }}
        />
      )}

      <CardContent className="p-0 flex gap-4">
        {isDraggable && (
          <div
            className="drag-button flex items-center max-w-min"
            {...dragHandle}
          >
            <GripVerticalIcon className="h-4 w-4" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-2">
              {stop.type && stop.type == "parkings" && (
                <SquareParkingIcon className="w-4 h-4" />
              )}
              {stop.type && stop.type == "restaurants" && (
                <Utensils className="w-4 h-4" />
              )}
              {stop.type && stop.type == "gasStations" && (
                <FuelIcon className="w-4 h-4" />
              )}
              <p className="pb-1" style={{ fontWeight: "bolder" }}>
                {stop.info.name}
              </p>
            </div>
          </div>
          <div className="flex flex-row gap-[1rem]">
            {stop.info.googleRating && (
              <div className="flex flex-row items-center gap-1">
                <StarIcon className="w-4 h-4" />
                <p>{stop.info.googleRating}</p>
              </div>
            )}
            {stop.info.wazeLink && (
              <div className="flex flex-row items-center gap-1">
                <Link
                  href={stop.info.wazeLink}
                  target="_blank"
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "p-0  m-0 flex flex-row gap-1"
                  )}
                >
                  <Icons.waze className="w-4 h-4" />
                  קישור לניווט
                </Link>
              </div>
            )}
            {stop.info.googleLink && (
              <div className="flex flex-row items-center gap-1">
                <Link
                  href={googleMapPlaceLink(
                    stop.info.location.x,
                    stop.info.location.y,
                    stop.info.googleLink.split("place_id:")[1]
                  )}
                  target="_blank"
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "p-0  m-0 flex flex-row gap-1"
                  )}
                >
                  <MapIcon className="w-4 h-4" />
                  גוגל מפות
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default SelectedPlaceCard;
