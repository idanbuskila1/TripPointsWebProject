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
    Sparkle,
    Sparkles,
} from "lucide-react";

import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { NearbyPlaces, Place } from "@/types/Site";
import { auth, firestoreDb } from "@/lib/firebase/firebase-config";
import {
    translateDifficulty,
    translateDistrict,
    translateDuration,
} from "@/lib/search-utils";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getTripConcerns, TripConcerns } from "../../lib/llm";
import { LoadingSpinner } from "../../components/ui/loadingspinner";
import { Badge } from "../../components/ui/badge";
import TripTip from "../../components/TripTip";
type AutocompleteType = google.maps.places.Autocomplete;
type PlaceType = google.maps.places.PlaceResult;
type DirectionsResult = google.maps.DirectionsResult;
const Plan = () => {
    /*************** */
    /*** GOOGLE LIRARY LOAD ***/
    /*************** */
    const libraries = useMemo(() => ["places"], []);
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
        libraries: libraries as any,
    });

    /*************** */
    /*** STATES ***/
    /*************** */
    //stepper component states
    const [activeStep, setActiveStep] = useState<number>(0);
    const [completed, setCompleted] = useState<any>({});
    const [isNextDisabled, setIsNextDisabled] = useState<boolean>(true);
    //site details
    const { site, currentTrip, setCurrentTrip, setSite } = useSiteContext();
    const [weather, setWeather] = useState(null);
    const [availablePlaces, setAvailablePlaces] = useState<NearbyPlaces>();
    const [hoverPlace, setHoverPlace] = useState<Place | undefined>(undefined);
    const [directions, setDirections] = useState<DirectionsResult | null>(null);
    //returned trip states
    const [tripName, setTripName] = useState<string>(
        site ? `טיול ל${site.name}` : ""
    );
    const [date, setDate] = useState<string>("");
    const [entryPoint, setEntryPoint] = useState<TripStop | undefined>(
        undefined
    );
    const [customPoint, setCustomPoint] = useState<TripStop>();
    const [routeURL, setRouteURL] = useState<string>("");
    const [itinerary, setItinerary] = useState<TripStop[]>([]);
    //entry point open search states
    const [searchValue, setSearchValue] = useState<string>();
    const [autocomplete, setAutocomplete] = useState<AutocompleteType | null>(
        null
    );
    //custom point open search states
    const [searchValueCustom, setSearchValueCustom] = useState<string>();
    const [autocompleteCustom, setAutocompleteCustom] =
        useState<AutocompleteType | null>(null);
    const [tripTips, setTripTips] = useState<TripConcerns | null>(null);
    const [loadingTips, setLoadingTips] = useState<boolean>(false);
    /*************** */
    /***VARIABLES ***/
    /*************** */
    const STEPS: (undefined | "parkings" | "gasStations" | "restaurants")[] = [
        undefined,
        "parkings",
        "gasStations",
        "restaurants",
        undefined,
    ];
    const router = useRouter();
    const [user] = useAuthState(auth);
    const steps = ["פרטי מסלול", "חניה", "דלק", "מסעדות", "סיום"];
    const totalSteps = steps.length;

    /*************** */
    /*** MAP CONSTS ***/
    /*************** */
    const mapOptions: google.maps.MapOptions = {
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: true,
        scrollwheel: false,
    };
    const mapRef = useRef<google.maps.Map | null>(null);
    /*************** */
    /*** MAP && ITINERARY HANDLERS ***/
    /*************** */
    //generate route for all the stops currently on itinerary state variable
    const generateRoute = () => {
        if (itinerary.length < 2) {
            setDirections(null);

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
                updateRouteURL();
            }
        });
    };
    //create url to google maps with the trip created
    const updateRouteURL = () => {
        if (itinerary.length >= 2) {
            let ret = "https://www.google.com/maps/dir/?api=1";
            ret += `&origin=${itinerary[0].info.location.x}%2C${itinerary[0].info.location.y}`;
            ret += `&destination=${
                itinerary[itinerary.length - 1].info.location.x
            }%2C${itinerary[itinerary.length - 1].info.location.y}`;
            ret += `&travelmode=driving&waypoints=`;
            itinerary.forEach((stop: TripStop, idx: number) => {
                if (idx != 0 && idx != itinerary.length - 1) {
                    ret += `${stop.info.location.x}%2C${stop.info.location.y}|`;
                }
            });
            ret = ret.slice(0, -1);
            //console.log(ret);
            setRouteURL(ret);
        }
    };
    const isEqualsPlaces = (
        e: TripStop,
        item: Place | undefined,
        type: "parkings" | "gasStations" | "restaurants"
    ) => {
        if (
            item &&
            e.type == type &&
            e.info.name == item.name &&
            e.info.location.x == item.location.x &&
            e.info.location.y == item.location.y
        )
            return true;
        else return false;
    };
    //updates itinerary state according to selection of nearby places
    const CardSelectHandler =
        (idx: number, type: "parkings" | "gasStations" | "restaurants") =>
        () => {
            if (
                itinerary.find((e: TripStop) =>
                    isEqualsPlaces(e, availablePlaces?.[type][idx], type)
                )
            ) {
                setItinerary((prv) =>
                    prv.filter(
                        (e) =>
                            !isEqualsPlaces(
                                e,
                                availablePlaces?.[type][idx],
                                type
                            )
                    )
                );
            } else {
                availablePlaces?.[type][idx] &&
                    setItinerary((pre: TripStop[]) => [
                        ...pre,
                        {
                            type: type,
                            info: availablePlaces?.[type][idx],
                        },
                    ]);
            }
        };
    const handleDrop = (droppedItem: any) => {
        // Ignore drop outside droppable container
        if (!droppedItem.destination) return;

        if (itinerary == undefined) return;
        var updatedList = [...itinerary];
        // Remove dragged item
        const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
        // Add dropped item
        updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
        // Update State
        setItinerary(updatedList);
    };
    /**********************/
    /***STEPPER HANDLERS ***/
    /********************/
    const handleBack = () => {
        const newCompleted = completed;
        newCompleted[activeStep] = false;
        setCompleted(newCompleted);
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        setIsNextDisabled(false);
    };

    const handleNext = () => {
        if (activeStep == totalSteps - 1 && user) {
            if (currentTrip) {
                //if we are updating trip, first delete it
                firestoreDb.deleteTrip(currentTrip.id);
            }
            //submit new trip
            const trip: Trip = {
                ownerId: user.uid,
                name: tripName,
                date: date,
                googleRouteLink: routeURL,
                itinerary: itinerary,
                id: "", //created in saveTrip
            };
            firestoreDb.saveTrip(trip).then(() => {
                setSite(null);
                setCurrentTrip(null);
                router.push("/my-trips");
            });
        } else {
            const newCompleted = completed;
            newCompleted[activeStep] = true;
            setCompleted(newCompleted);
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setIsNextDisabled(true);
        }
    };
    /*****************/
    /*** GOOGLE AUTOCOMPLETE SEARCHBAR HANDLING ***/
    /*****************/
    const onPlaceSelected = async () => {
        if (autocomplete !== null) {
            const place: PlaceType = autocomplete.getPlace() as PlaceType;
            // Check if place is defined and has geometry property
            if (place.geometry && place.geometry.location) {
                const { lat, lng } = place.geometry.location;
                const isWithinIsrael = isLocationWithinIsrael(lat(), lng());
                if (isWithinIsrael) {
                    // Check if site and site.location are defined
                    if (site && site.location && place.name) {
                        //setSelectedPlaceName(place.name);
                        setSearchValue(place.name);
                        const newPlace: Place = {
                            name: place.name,
                            distanceInKm: 0,
                            location: {
                                x: lat().toString(),
                                y: lng().toString(),
                            },
                            googleLink: place.place_id
                                ? "0place_id:" + place.place_id
                                : "",
                        };
                        const newStop: TripStop = {
                            info: newPlace,
                            type: "entryPoint",
                        };
                        if (activeStep == 0) {
                            //if added place from searchbar on first stepper page its an entry point
                            setItinerary((prev) => {
                                let tmp = prev.filter((stop) => {
                                    //remove prev entry point
                                    if (stop.type)
                                        return stop.type != "entryPoint";
                                    return true;
                                });
                                return [newStop, ...tmp]; //add new entry point
                            });
                            setEntryPoint(newStop);
                        }
                    } else {
                        console.error("Site or site location is undefined.");
                    }
                } else {
                    // Handle case where selected place is not within Israel
                    console.log("Selected place is not within Israel.");
                    // setSelectedPlaceName("");
                }
            } else {
                // Handle case where place or its properties are undefined
                setItinerary((prev) => {
                    return prev.filter((stop) => {
                        if (stop.type) return stop.type != "entryPoint";
                        return true;
                    });
                });
                setEntryPoint(undefined);
                console.log(itinerary);
            }
        }
    };
    const onCustomPlaceSelected = async () => {
        if (autocompleteCustom !== null) {
            const place: PlaceType = autocompleteCustom.getPlace() as PlaceType;
            // Check if place is defined and has geometry property
            if (place.geometry && place.geometry.location) {
                const { lat, lng } = place.geometry.location;
                const isWithinIsrael = isLocationWithinIsrael(lat(), lng());
                if (isWithinIsrael) {
                    // Check if site and site.location are defined
                    if (site && site.location && place.name) {
                        console.log(place.place_id);
                        //setSelectedPlaceName(place.name);
                        setSearchValueCustom(place.name);
                        const newPlace: Place = {
                            name: place.name,
                            distanceInKm: 0,
                            location: {
                                x: lat().toString(),
                                y: lng().toString(),
                            },
                            googleLink: place.place_id
                                ? "0place_id:" + place.place_id
                                : "",
                        };
                        const newStop: TripStop = {
                            info: newPlace,
                            type: "customPoint",
                        };
                        if (activeStep == 4) {
                            setCustomPoint(newStop); //set new custom point
                        }
                    } else {
                        console.error("Site or site location is undefined.");
                    }
                } else {
                    // Handle case where selected place is not within Israel
                    console.log("Selected place is not within Israel.");
                    // setSelectedPlaceName("");
                }
            }
        }
    };
    // Function to check if a location is within Israel
    const isLocationWithinIsrael = (lat: number, lng: number): boolean => {
        // Add logic to determine if the location is within Israel
        // For simplicity, let's assume a rectangular boundary for Israel
        const isWithinLatBound = lat >= 29.5 && lat <= 33.3;
        const isWithinLngBound = lng >= 34.3 && lng <= 35.9;
        return isWithinLatBound && isWithinLngBound;
    };
    const onAutocompleteLoad = (autocomplete: AutocompleteType) => {
        setAutocomplete(autocomplete);
    };
    const onAutocompleteLoadCustom = (autocomplete: AutocompleteType) => {
        setAutocompleteCustom(autocomplete);
    };
    /*************** */
    /*** USE EFFECTS***/
    /*************** */
    useEffect(() => {
        if (activeStep <= 3 && activeStep >= 0) {
            mapRef.current?.setZoom(12);
            mapRef.current?.panTo(
                new google.maps.LatLng(site.location.x, site.location.y)
            );
        }
        if (activeStep == 4) {
            mapRef.current?.setZoom(10);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [activeStep]);
    useEffect(() => {
        if (activeStep > 0) {
            if (
                !loadingTips &&
                !tripTips &&
                site &&
                date != "" &&
                entryPoint != undefined
            ) {
                setLoadingTips(true);
                getTripConcerns({ itinerary, date, name: tripName }).then(
                    (tips) => {
                        setTripTips(tips);
                        setLoadingTips(false);
                    }
                );
            }
        }
        return () => {
            setLoadingTips(false);
        };
    }, [site, date, activeStep]);

    //get nearby places and weather of site context
    useEffect(() => {
        if (site) {
            getLocWeather(site.id).then((weather) => {
                setWeather(weather);
            });

            firestoreDb.getNearby(site.id).then((nearby) => {
                setAvailablePlaces(nearby);
                //console.log(nearby);
            });
            setItinerary([
                {
                    info: site,
                    type: "mainSite",
                },
            ]);
        }
    }, [site]);
    //update route on map with any itineraray change
    useEffect(() => {
        if (isLoaded) generateRoute();
    }, [itinerary, isLoaded]);
    //control stepper buttons
    useEffect(() => {
        if (activeStep == 4) {
            setIsNextDisabled(false);
        } else if (activeStep == 0) {
            if (tripName != "" && date != "" && entryPoint != undefined)
                setIsNextDisabled(false);
            else setIsNextDisabled(true);
        } else {
            itinerary.filter((e) => e.type === STEPS[activeStep]).length > 0
                ? setIsNextDisabled(false)
                : setIsNextDisabled(true);
        }
    }, [itinerary, activeStep, tripName, date, entryPoint]);
    useEffect(() => {
        if (currentTrip) {
            setTripName(currentTrip.name);
            setDate(currentTrip.date);
            setItinerary(currentTrip.itinerary);
            setEntryPoint(
                currentTrip.itinerary.find((stp) => stp.type == "entryPoint")
            );
        }
    }, [currentTrip]);
    useEffect(() => {
        if (!site) router.push("/sites");
        if (!user) router.push("/");
    }, []);
    const gotoHandler = ({ x, y }: { x: string; y: string }) => {
        /* mapRef.current?.setZoom(12);
    if (site)
      mapRef.current?.setCenter(
        new google.maps.LatLng(+site?.location.x, +site?.location.x)
      );*/
    };
    /***************/
    /***GOOGLE MAP LOADER ***/
    /***************/
    if (!isLoaded) {
        return <p>Loading...</p>;
    }
    const directionsService = new google.maps.DirectionsService();
    return (
        site && (
            <div>
                <div className="flex flex-col lg:grid lg:grid-cols-2 lg:h-[calc(100vh_-_119px)] lg:relative">
                    <div className=" max-h-[50vh] lg:max-h-[100%] lg:h-[calc(100vh-55px)] flex-col bg-muted text-white flex dark:border-r">
                        <GoogleMap
                            options={mapOptions}
                            mapTypeId={google.maps.MapTypeId.ROADMAP}
                            mapContainerStyle={{ height: "100vh" }}
                            onLoad={(map) => {
                                mapRef.current = map;
                                map.setZoom(12);
                                map.panTo(
                                    new google.maps.LatLng(
                                        site.location.x,
                                        site.location.y
                                    )
                                );
                            }}
                            //onClick={handleMapClick}
                        >
                            {itinerary && itinerary.length == 1 && (
                                <MarkerF
                                    position={{
                                        lat: parseFloat(site.location.x),
                                        lng: parseFloat(site.location.y),
                                    }}
                                ></MarkerF>
                            )}
                            {
                                //display markers on the map for each nearby place
                                STEPS[activeStep] !== undefined &&
                                    availablePlaces?.[
                                        STEPS[activeStep] || "parkings"
                                    ].map((place, idx) => (
                                        <MarkerF
                                            position={{
                                                lat: parseFloat(
                                                    place.location.x
                                                ),
                                                lng: parseFloat(
                                                    place.location.y
                                                ),
                                            }}
                                            key={idx}
                                            label={{
                                                text: (
                                                    availablePlaces?.[
                                                        STEPS[activeStep] ||
                                                            "parkings"
                                                    ].indexOf(place) + 1
                                                ).toString(),
                                                color: "black",
                                                fontWeight: "bold",
                                                fontSize: "1.1rem",
                                            }}
                                            //onClick={}
                                            onMouseOver={() =>
                                                setHoverPlace(place)
                                            }
                                            onMouseOut={() =>
                                                setHoverPlace(undefined)
                                            }
                                            onClick={CardSelectHandler(
                                                idx,
                                                STEPS[activeStep] || "parkings"
                                            )}
                                        />
                                    ))
                            }
                            <DirectionsRenderer
                                directions={directions || undefined}
                                options={{
                                    suppressMarkers: false,
                                }}
                            />
                        </GoogleMap>
                    </div>
                    <div
                        className="h-full pt-8 lg:max-h-[calc(100vh-55px)] overflow-y-scroll overflow-x-clip"
                        dir="rtl"
                    >
                        <div className="h-full">
                            <Stepper
                                className="border-b pb-[1rem] mb-[1rem]"
                                activeStep={activeStep}
                            >
                                {steps.map((step, index) => (
                                    <Step
                                        key={step}
                                        completed={completed[index]}
                                    >
                                        <StepLabel>{step}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                            <div>
                                <div className="px-4">
                                    {/*** STEP 1 ***/}
                                    {activeStep == 0 && (
                                        <div className="mx-auto flex w-full flex-col h-full">
                                            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight  ">
                                                {site?.name}
                                            </h2>
                                            <p className="leading-7 ">
                                                {site?.description}
                                            </p>
                                            <div className="flex flex-row gap-6 pt-2">
                                                {/* {site.googleRating && <span>⭐{site.googleRating?.stars}</span>} */}
                                                <span className="flex items-center flex-row gap-1 text-sm  font-semibold ">
                                                    <CloudSunIcon className="w-4 h-4" />{" "}
                                                    {weather}°
                                                </span>

                                                {(site?.district ||
                                                    site?.district === 0) && (
                                                    <span className="flex items-center flex-row gap-1 text-sm font-semibold ">
                                                        <MapPinIcon className="w-4 h-4" />{" "}
                                                        {translateDistrict(
                                                            site?.district
                                                        )}
                                                    </span>
                                                )}
                                                {(site?.duration ||
                                                    site?.duration === 0) && (
                                                    <span className="flex items-center flex-row gap-1 text-sm  font-semibold ">
                                                        <ClockIcon className="w-4 h-4" />{" "}
                                                        {translateDuration(
                                                            site.duration
                                                        )}
                                                    </span>
                                                )}
                                                {(site?.distance ||
                                                    site?.distance === 0) && (
                                                    <span className="flex items-center flex-row gap-1 text-sm  font-semibold ">
                                                        <FootprintsIcon className="w-4 h-4" />{" "}
                                                        {site.distance} ק"מ
                                                    </span>
                                                )}

                                                <span className="flex items-center flex-row gap-1 text-sm  font-semibold ">
                                                    <FlagIcon className="w-4 h-4" />{" "}
                                                    מסלול{" "}
                                                    {translateDifficulty(
                                                        site?.difficulty || 1
                                                    )}
                                                </span>
                                            </div>
                                            <form className="mt-[2rem]">
                                                <div className="flex flex-col gap-[1rem]">
                                                    <div className="flex flex-row justify-between items-center gap-4">
                                                        <Label
                                                            htmlFor="name"
                                                            className="text-lg col-span-2 h-[2rem] text-nowrap"
                                                        >
                                                            שם הטיול:
                                                        </Label>
                                                        <Input
                                                            className="h-[2rem] "
                                                            id="name"
                                                            type="text"
                                                            maxLength={40}
                                                            autoCapitalize="none"
                                                            value={tripName}
                                                            onChange={(event) =>
                                                                setTripName(
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex flex-row justify-between items-center gap-4">
                                                        <Label
                                                            htmlFor="name"
                                                            className="text-[1.1rem] text-nowrap"
                                                        >
                                                            נקודת מוצא:
                                                        </Label>
                                                        <Autocomplete
                                                            className="h-[2rem] w-full"
                                                            onLoad={
                                                                onAutocompleteLoad
                                                            }
                                                            onPlaceChanged={
                                                                onPlaceSelected
                                                            }
                                                            options={{
                                                                componentRestrictions:
                                                                    {
                                                                        country:
                                                                            "IL",
                                                                    }, // Limit search to Israel (country code for Israel is "IL")
                                                            }}
                                                        >
                                                            <Input
                                                                type="text"
                                                                value={
                                                                    searchValue
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    e.preventDefault();
                                                                    setSearchValue(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                }}
                                                                placeholder="חיפוש מקום..."
                                                                className="h-[2rem]"
                                                            />
                                                        </Autocomplete>
                                                    </div>
                                                    <div className="flex flex-row justify-start items-center gap-4">
                                                        <Label
                                                            htmlFor="date"
                                                            className="text-[1.1rem] text-nowrap"
                                                        >
                                                            תאריך:
                                                        </Label>
                                                        <Input
                                                            className="h-[2rem] max-w-[170px]"
                                                            id="date"
                                                            type="date"
                                                            value={date}
                                                            onChange={(event) =>
                                                                setDate(
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        //<div className="mt-2,mb-1">{stepDescription[activeStep]}</div>
                                    )}

                                    {/*** STEP 2 ***/}
                                    {activeStep == 1 && (
                                        <div className="flex flex-col gap-[0.6rem]">
                                            <p>בחרו חניון</p>
                                            <div className="flex flex-col gap-4 lg:max-h-[320px] max-h-[30vh] overflow-auto  p-1 border-2 shadow-sm rounded-md">
                                                {availablePlaces?.parkings
                                                    .sort(
                                                        (x, y) =>
                                                            x.distanceInKm -
                                                            y.distanceInKm
                                                    )
                                                    .map((item, index) => (
                                                        <PlaceCard
                                                            setFocus={
                                                                gotoHandler
                                                            }
                                                            kind="parking"
                                                            isSelected={
                                                                itinerary.find(
                                                                    (
                                                                        e: TripStop
                                                                    ) => {
                                                                        if (
                                                                            e.type ==
                                                                                "parkings" &&
                                                                            e
                                                                                .info
                                                                                .name ==
                                                                                item.name &&
                                                                            e
                                                                                .info
                                                                                .location
                                                                                .x ==
                                                                                item
                                                                                    .location
                                                                                    .x &&
                                                                            e
                                                                                .info
                                                                                .location
                                                                                .y ==
                                                                                item
                                                                                    .location
                                                                                    .y
                                                                        )
                                                                            return true;
                                                                        else
                                                                            return false;
                                                                    }
                                                                ) !== undefined
                                                            }
                                                            onClick={CardSelectHandler(
                                                                index,
                                                                "parkings"
                                                            )}
                                                            place={item}
                                                            key={index}
                                                            isHover={
                                                                item ===
                                                                hoverPlace
                                                            }
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                    {/*** STEP 3 ***/}
                                    {activeStep == 2 && (
                                        <div className="flex flex-col gap-[0.6rem]">
                                            <p>בחרו תחנות דלק</p>
                                            <div className="flex flex-col gap-4 lg:max-h-[320px] max-h-[30vh] overflow-auto  p-1 border-2 shadow-sm rounded-md">
                                                {availablePlaces?.gasStations.map(
                                                    (item, index) => (
                                                        <PlaceCard
                                                            kind="gasStations"
                                                            isSelected={
                                                                itinerary.find(
                                                                    (
                                                                        e: TripStop
                                                                    ) => {
                                                                        if (
                                                                            e.type ==
                                                                                "gasStations" &&
                                                                            e
                                                                                .info
                                                                                .name ==
                                                                                item.name &&
                                                                            e
                                                                                .info
                                                                                .location
                                                                                .x ==
                                                                                item
                                                                                    .location
                                                                                    .x &&
                                                                            e
                                                                                .info
                                                                                .location
                                                                                .y ==
                                                                                item
                                                                                    .location
                                                                                    .y
                                                                        )
                                                                            return true;
                                                                        else
                                                                            return false;
                                                                    }
                                                                ) !== undefined
                                                            }
                                                            onClick={CardSelectHandler(
                                                                index,
                                                                "gasStations"
                                                            )}
                                                            place={item}
                                                            key={index}
                                                            isHover={
                                                                item ==
                                                                hoverPlace
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {/*** STEP 4 ***/}
                                    {activeStep == 3 && (
                                        <div className="flex flex-col gap-[0.6rem]">
                                            <p>בחרו מסעדות</p>
                                            <div className="flex flex-col gap-4 lg:max-h-[320px] max-h-[30vh] overflow-auto  p-1 border-2 shadow-sm rounded-md">
                                                {availablePlaces?.restaurants.map(
                                                    (item, index) => (
                                                        <PlaceCard
                                                            kind="restaurants"
                                                            isSelected={
                                                                itinerary.find(
                                                                    (
                                                                        e: TripStop
                                                                    ) => {
                                                                        if (
                                                                            e.type ==
                                                                                "restaurants" &&
                                                                            e
                                                                                .info
                                                                                .name ==
                                                                                item.name &&
                                                                            e
                                                                                .info
                                                                                .location
                                                                                .x ==
                                                                                item
                                                                                    .location
                                                                                    .x &&
                                                                            e
                                                                                .info
                                                                                .location
                                                                                .y ==
                                                                                item
                                                                                    .location
                                                                                    .y
                                                                        )
                                                                            return true;
                                                                        else
                                                                            return false;
                                                                    }
                                                                ) !== undefined
                                                            }
                                                            onClick={CardSelectHandler(
                                                                index,
                                                                "restaurants"
                                                            )}
                                                            place={item}
                                                            key={index}
                                                            isHover={
                                                                item ==
                                                                hoverPlace
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {/*** STEP 5 ***/}

                                    {activeStep == 4 && (
                                        <div className="flex flex-col gap-[1rem] px-2">
                                            <Accordion
                                                type="single"
                                                collapsible
                                                defaultValue="tips"
                                            >
                                                <AccordionItem value="tips">
                                                    <AccordionTrigger>
                                                        {loadingTips ? (
                                                            <Badge className="flex flex-row gap-1 items-center w-fit">
                                                                <LoadingSpinner />
                                                                טוען טיפים
                                                                <Sparkles />
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="flex flex-row gap-1 items-center w-fit">
                                                                <Sparkles />
                                                                טיפים לטיול
                                                            </Badge>
                                                        )}
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="flex flex-col gap-3 pt-2">
                                                            {tripTips?.weather_and_conditions !==
                                                                null && (
                                                                <TripTip
                                                                    text={
                                                                        tripTips?.weather_and_conditions
                                                                    }
                                                                    loading={
                                                                        loadingTips
                                                                    }
                                                                    icon={
                                                                        <CloudSunIcon />
                                                                    }
                                                                    className="text-sm"
                                                                />
                                                            )}
                                                            {tripTips?.reminders !==
                                                                null && (
                                                                <TripTip
                                                                    text={
                                                                        tripTips?.reminders
                                                                    }
                                                                    loading={
                                                                        loadingTips
                                                                    }
                                                                    icon={
                                                                        <FlagIcon />
                                                                    }
                                                                    className="text-sm"
                                                                />
                                                            )}
                                                            {tripTips?.possible_inactivity !==
                                                                null && (
                                                                <TripTip
                                                                    text={
                                                                        tripTips?.possible_inactivity
                                                                    }
                                                                    loading={
                                                                        loadingTips
                                                                    }
                                                                    icon={
                                                                        <FootprintsIcon />
                                                                    }
                                                                    className="text-sm"
                                                                />
                                                            )}

                                                            {tripTips?.summary !==
                                                                null && (
                                                                <TripTip
                                                                    text={
                                                                        tripTips?.summary
                                                                    }
                                                                    loading={
                                                                        loadingTips
                                                                    }
                                                                    icon={
                                                                        <Sparkle />
                                                                    }
                                                                    className="text-sm"
                                                                />
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                            <p>הוסיפו עצירות נוספות</p>
                                            <div className="flex flex-row gap-[1rem] items-center">
                                                <Autocomplete
                                                    onLoad={
                                                        onAutocompleteLoadCustom
                                                    }
                                                    onPlaceChanged={
                                                        onCustomPlaceSelected
                                                    }
                                                    options={{
                                                        componentRestrictions: {
                                                            country: "IL",
                                                        }, // Limit search to Israel (country code for Israel is "IL")
                                                    }}
                                                >
                                                    <Input
                                                        type="text"
                                                        value={
                                                            searchValueCustom
                                                        }
                                                        onChange={(e) => {
                                                            e.preventDefault();
                                                            setSearchValueCustom(
                                                                e.target.value
                                                            );
                                                        }}
                                                        className="w-[700px] max-w-[50vw] lg:max-w-[20vw]  h-[2rem]"
                                                    />
                                                </Autocomplete>
                                                <Button
                                                    className="h-[90%] px-[0.5rem] py-[0.35rem]"
                                                    onClick={() => {
                                                        console.log(
                                                            customPoint
                                                        );
                                                        if (customPoint) {
                                                            setItinerary(
                                                                (prev) => [
                                                                    ...prev,
                                                                    customPoint,
                                                                ]
                                                            );
                                                            setSearchValueCustom(
                                                                ""
                                                            );
                                                            setCustomPoint(
                                                                undefined
                                                            );
                                                        }
                                                    }}
                                                >
                                                    הוסף
                                                </Button>
                                            </div>
                                            <div>
                                                <Link
                                                    href={routeURL}
                                                    target="_blank"
                                                    className={cn(
                                                        buttonVariants({
                                                            variant: "link",
                                                        }),
                                                        "p-0  m-0 flex flex-row gap-1 justify-start"
                                                    )}
                                                >
                                                    <MapIcon className="w-4 h-4" />
                                                    הצג מסלול בגוגל מפות
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                    <Accordion
                                        type="single"
                                        collapsible
                                        style={{ marginTop: "0px" }}
                                        className="px-4"
                                    >
                                        <AccordionItem value="item-0">
                                            <AccordionTrigger>
                                                סידור מסלול
                                            </AccordionTrigger>
                                            <AccordionContent
                                                style={{ overflow: "visible" }}
                                            >
                                                <div className="">
                                                    <DragDropContext
                                                        onDragEnd={handleDrop}
                                                    >
                                                        <Droppable droppableId="list-container">
                                                            {(provided) => (
                                                                <div
                                                                    {...provided.droppableProps}
                                                                    ref={
                                                                        provided.innerRef
                                                                    }
                                                                    className="h-full flex flex-col gap-2"
                                                                >
                                                                    {itinerary?.map(
                                                                        (
                                                                            stop,
                                                                            idx
                                                                        ) => (
                                                                            <Draggable
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                draggableId={String(
                                                                                    idx
                                                                                )}
                                                                                index={
                                                                                    idx
                                                                                }
                                                                            >
                                                                                {(
                                                                                    provided
                                                                                ) => (
                                                                                    <div
                                                                                        ref={
                                                                                            provided.innerRef
                                                                                        }
                                                                                        {...provided.draggableProps}
                                                                                    >
                                                                                        <ItineraryNode
                                                                                            index={
                                                                                                idx
                                                                                            }
                                                                                            disableClose={
                                                                                                itinerary[
                                                                                                    idx
                                                                                                ]
                                                                                                    .type ==
                                                                                                "mainSite"
                                                                                            }
                                                                                            setSelectedPlaces={
                                                                                                setItinerary
                                                                                            }
                                                                                            stop={
                                                                                                itinerary[
                                                                                                    idx
                                                                                                ]
                                                                                            }
                                                                                            dragHandle={
                                                                                                provided.dragHandleProps
                                                                                            }
                                                                                            isDraggable={
                                                                                                true
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </Draggable>
                                                                        )
                                                                    )}

                                                                    {
                                                                        provided.placeholder
                                                                    }
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    </DragDropContext>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            </div>
                            <footer
                                dir="rtl"
                                className="sticky hidden lg:col-start-2 bottom-0 lg:flex flex-row justify-between gap-1 px-4 pb-2 pt-4 bg-white bg-opacity-50 backdrop-blur-sm border-secondary border-t-4"
                            >
                                <Button
                                    className="h-[90%] px-[0.5rem]"
                                    onClick={handleBack}
                                    disabled={activeStep === 0}
                                >
                                    חזרה
                                </Button>
                                <div className="flex flex-row h-full gap-3">
                                    {!(
                                        activeStep === 0 || activeStep === 4
                                    ) && (
                                        <Button
                                            className="h-[90%] px-[0.5rem]"
                                            onClick={handleNext}
                                        >
                                            דילוג
                                        </Button>
                                    )}
                                    <Button
                                        className="h-[90%] px-[0.5rem]"
                                        disabled={isNextDisabled}
                                        onClick={handleNext}
                                    >
                                        {activeStep != totalSteps - 1
                                            ? "המשך"
                                            : currentTrip
                                            ? "עדכון מסלול"
                                            : "יצירת מסלול"}
                                    </Button>
                                </div>
                            </footer>
                        </div>
                    </div>
                    <footer
                        dir="rtl"
                        className="sticky lg:hidden lg:col-start-2 bottom-0 flex flex-row justify-between gap-1 px-4 pb-2 pt-4 bg-white bg-opacity-50 backdrop-blur-sm border-secondary border-t-4"
                    >
                        <Button
                            className="h-[90%] px-[0.5rem]"
                            onClick={handleBack}
                            disabled={activeStep === 0}
                        >
                            חזרה
                        </Button>
                        <div className="flex flex-row h-full gap-3">
                            {!(activeStep === 0 || activeStep === 4) && (
                                <Button
                                    className="h-[90%] px-[0.5rem]"
                                    onClick={handleNext}
                                >
                                    דילוג
                                </Button>
                            )}
                            <Button
                                className="h-[90%] px-[0.5rem]"
                                disabled={isNextDisabled}
                                onClick={handleNext}
                            >
                                {activeStep != totalSteps - 1
                                    ? "המשך"
                                    : currentTrip
                                    ? "עדכון מסלול"
                                    : "יצירת מסלול"}
                            </Button>
                        </div>
                    </footer>
                </div>
            </div>
        )
    );
};
export default Plan;
