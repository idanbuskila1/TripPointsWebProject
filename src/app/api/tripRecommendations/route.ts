export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { Trip } from "../../../types/Site";
import { TripConcerns } from "../../../lib/llm";


export async function POST(request: Request) {
  const data = await request.json();
  const result = await tripConcerns(data as Pick<Trip, "name" | "itinerary" | "date">);
  return NextResponse.json(result, { status: 200 });
}

async function tripConcerns(
  trip: Pick<Trip, "name" | "itinerary" | "date">): Promise<TripConcerns | null> {
  return fetch("https://gettriprecommendations-hx5t43zkaa-uc.a.run.app", {
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
  })
}
