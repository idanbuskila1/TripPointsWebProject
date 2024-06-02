import { Place, Site, Trip, TripStop } from "@/types/Site";

export type TripConcerns = {
    weather_and_conditions: string | null;
    possible_inactivity: string | null;
    reminders: string | null;
    summary: string;
};

export async function getTripConcerns(
    trip: Pick<Trip, "name" | "itinerary" | "date">): Promise<TripConcerns | null> {
    console.log("Get trip concerns", { trip: JSON.stringify(trip) })

    return fetch(`/api/tripRecommendations`, {
        body: JSON.stringify(trip),
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    });
}

