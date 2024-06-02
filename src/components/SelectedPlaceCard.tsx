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
import { cn } from "@/lib/utils";
import { he } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

registerLocale("he", he);
interface SelectedPlaceCardProps {
  place: Place;
  setSelectedPlaces: React.Dispatch<React.SetStateAction<Place[]>>;
  disableClose: boolean;
  bColor?: string;
  hour?: string;
  date?: Date;
  renderKey?: boolean;
  index?: number;
  onUpdateColor?: (color: string) => void;
  onUpdateTime?: (time: string) => void;
  onUpdateDate?: (date: Date) => void;
  onDelete?: (n: number) => void;
  dragHandle?: DraggableProvidedDragHandleProps | null | undefined;
}

interface DigitalTimePickerProps {
  value: string;
  onChange: (newValue: string) => void;
}

const DigitalTimePicker: FC<DigitalTimePickerProps> = ({ value, onChange }) => {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialHours = value.slice(0, 2);
    const initialMinutes = value.slice(3, 5);
    setHours(initialHours);
    setMinutes(initialMinutes);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        // Clicked outside of the DigitalTimePicker component
        setIsEditing(false);
        const formattedHours = hours.padStart(2, "0");
        const formattedMinutes = minutes.padStart(2, "0");
        const newValue = `${formattedHours}:${formattedMinutes}`;
        onChange(newValue);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [hours, minutes, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "hours") {
      setHours(value);
    } else if (name === "minutes") {
      setMinutes(value);
    }
  };

  const handleInputClick = () => {
    setIsEditing(true);
  };

  return (
    <div ref={wrapperRef}>
      <input
        type="text"
        name="minutes"
        value={minutes}
        onChange={handleInputChange}
        onClick={handleInputClick}
        maxLength={2}
        style={{ width: "20px", marginRight: "5px" }}
        placeholder="mm"
        readOnly={!isEditing}
      />
      :
      <input
        type="text"
        name="hours"
        value={hours}
        onChange={handleInputChange}
        onClick={handleInputClick}
        maxLength={2}
        style={{ width: "20px", marginLeft: "5px" }}
        placeholder="HH"
        readOnly={!isEditing}
      />
    </div>
  );
};

const SelectedPlaceCard: FC<SelectedPlaceCardProps> = ({
  place,
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
}) => {
  const [selectedOption, setSelectedOption] = useState("DRIVING");
  const [borderColor, setBorderColor] = useState(bColor);
  const [startDate, setStartDate] = useState(date);
  const [value, setStartTime] = useState(hour);
  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setBorderColor(newColor); // Update the border color state
    place.color = newColor;
    bColor = newColor;
  };

  const handleTimeChange = (newValue: string) => {
    // Update place.time with the new value
    place.time = newValue;
    hour = newValue;
    setStartTime(newValue);
  };

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      // Update place.date with the new value
      place.date = newDate;
      date = newDate;
      setStartDate(newDate);
    }
  };

  useEffect(() => {
    setBorderColor(place.color || "#000000");
  }, [place.color]);

  useEffect(() => {
    setStartTime(place.time || "00:00");
  }, [place.time]);

  useEffect(() => {
    setStartDate(place.date || new Date());
  }, [place.date]);

  useEffect(() => {
    place.travelMode = selectedOption;
  }, [selectedOption]);

  if (!place.index) {
    place.index = new Date().getTime(); // Initialize place.index with the provided index
  }

  return (
    <Card
      className={cn("relative cursor-pointer p-4 text-sm")}
      key={place.index}
    >
      {!disableClose && (
        <XIcon
          className="w-4 h-4 absolute top-3 left-3 cursor-pointer"
          onClick={() => {
            if (disableClose) return;
            setSelectedPlaces((prev) =>
              prev?.filter((p) => p.index !== place.index)
            );
          }}
        />
      )}

      <CardContent className="p-0 flex gap-4">
        <div
          className="drag-button flex items-center max-w-min"
          {...dragHandle}
        >
          <GripVerticalIcon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-2">
              {place.kind == "parking" && (
                <SquareParkingIcon className="w-4 h-4" />
              )}
              {place.kind == "restaurant" && <Utensils className="w-4 h-4" />}
              {place.kind == "gasStation" && <FuelIcon className="w-4 h-4" />}
              <p className="pb-1 truncate" style={{ fontWeight: "bolder" }}>
                {place.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <h4>זמן הגעה :</h4>
              <DigitalTimePicker value={value} onChange={handleTimeChange} />
              <DatePicker
                locale="he"
                selected={startDate}
                dateFormat={"dd/MM/yyyy"}
                onChange={handleDateChange}
                popperPlacement="left"
              />
              <h4>אופן הגעה :</h4>
              <Select
                value={selectedOption}
                onValueChange={(value) => {
                  setSelectedOption(value);
                }}
              >
                <SelectTrigger
                  className="w-[180px]"
                  style={{ direction: "rtl" }}
                >
                  <SelectValue placeholder="רכב" />
                </SelectTrigger>
                <SelectContent style={{ direction: "rtl" }}>
                  <SelectItem value="DRIVING">רכב</SelectItem>
                  <SelectItem value="WALKING">הליכה</SelectItem>
                  <SelectItem value="BICYCLING">אופניים</SelectItem>
                  <SelectItem value="TRANSIT">תחב"צ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-0">
              <AccordionTrigger>פרטים נוספים </AccordionTrigger>
              <AccordionContent style={{ overflow: "visible" }}>
                <div className="flex  items-center gap-1">
                  <StarIcon className="w-4 h-4" />
                  <p className="pb-1">
                    {place.googleRating ? place.googleRating : "--"}
                  </p>
                </div>
                <p>{place.distanceInKm.toFixed(2)} ק"מ מהאתר</p>
                {place.wazeLink && (
                  <div className="flex  items-center gap-1">
                    <Icons.waze className="w-4 h-4" />
                    <Link
                      href={place.wazeLink}
                      target="_blank"
                      className={cn(
                        buttonVariants({ variant: "link" }),
                        "p-0 pb-1 m-0"
                      )}
                    >
                      קישור לניווט
                    </Link>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectedPlaceCard;
