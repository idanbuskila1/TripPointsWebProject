"use client";

import { FC, useEffect, useState } from "react";
import { auth, firestoreDb } from "@/lib/firebase/firebase-config";

import SavedTripCard from "@/components/SavedTripCard";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { useSiteContext } from "@/context/SiteContext";
import { Trip, TripStop } from "@/types/Site";

interface pageProps {}

const MyTripsPage: FC<pageProps> = ({}) => {
    const [user] = useAuthState(auth);
    const [trips, setTrips] = useState<Trip[]>([]);
    const router = useRouter();
    const { setCurrentTrip } = useSiteContext();
    useEffect(() => {
        setCurrentTrip(null);
    }, []);

    useEffect(() => {
        //fetch user trips data
        if (user)
            firestoreDb.getTripsForUser(user.uid).then((trips) => {
                setTrips(trips);
            });
        else {
            router.push("/");
        }
    }, [user]);

    return (
        <div dir="rtl" className="p-4">
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 px-4">
                הטיולים שלי
            </h2>
            <div className="max-w-[1640px] mx-auto py-12 grid gap-6 md:grid-cols-3">
                {trips.map((trip) => {
                    const site = trip.itinerary.find(
                        (stop: TripStop) => stop.type == "mainSite"
                    );
                    if (site && site?.info)
                        return (
                            <SavedTripCard
                                key={trip.id}
                                setTrips={setTrips}
                                trip={trip}
                                site={site?.info}
                            />
                        );
                })}
            </div>
        </div>
    );
};

export default MyTripsPage;
