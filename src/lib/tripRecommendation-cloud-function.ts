// import * as v2 from "firebase-functions/v2";
import OpenAI from "openai";


export type Site = {
  id: string;
  name: string;
  images: {
    src: string;
    alt: string;
  }[];
  location: {
    x: string;
    y: string;
  };
  district: 0 | 1 | 2 | 3;
  difficulty: number;
  distance?: number;
  googleRating?: string;
  googleLink?: string;
  wazeLink?: string;
  duration?: number;
  description?: string;
  tags: string[];
  activities?: string[];
  food?: string[];
  openingHours?: {
    sunday: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
  };
  color?: string;
  time?: string;
  date?: Date;
  index?: number;
  cardPosition?: number;
  depTime?: string;
  travelTime?: string;
  stayTime?: string;
  travelMode?: string;
};
interface TripStop {
  info: Place | Site;
  type?:
  | "parkings"
  | "gasStations"
  | "restaurants"
  | "entryPoint"
  | "mainSite"
  | "customPoint";
}
interface Trip {
  id: string;
  ownerId: string;
  name: string;
  date: string;
  googleRouteLink?: string;
  itinerary: TripStop[];
}
type Place = {
  name: string;
  distanceInKm: number; // distance from the location with locationId
  googleLink?: string;
  wazeLink?: string;
  googleRating?: string;
  location: { x: string; y: string };
  kind?: string;
  color?: string;
  time?: string;
  date?: Date;
  index?: number;
  cardPosition?: number;
  depTime?: string;
  travelTime?: string;
  stayTime?: string;
  travelMode?: string;
};

// export const getTripRecommendations = v2.https.onRequest(async (req, res) => {
export const getTripRecommendations = async (req: any, res: any) => {

  const body = req.body;
  const result = await getTripConcerns(body,);

  res.send(result);
};

async function completion(
  body: OpenAI.ChatCompletionCreateParams,
  options?: OpenAI.RequestOptions<unknown> | undefined
) {
  const client = new OpenAI();
  return client.chat.completions.create(body, options);
}

export type TripConcerns = {
  weather_and_conditions: string | null;
  possible_inactivity: string | null;
  reminders: string | null;
  summary: string;
};

export async function getTripConcerns(
  trip: Pick<Trip, "name" | "itinerary" | "date">
): Promise<TripConcerns | null> {
  const cleaned: Pick<Trip, "name" | "itinerary" | "date"> = {
    ...trip,
    itinerary: trip.itinerary
      .filter((x) => x.type !== "entryPoint")
      .map((stop) => {
        const infoNoWeather: Place | Site = stop.info;
        if ("weather" in infoNoWeather) {
          delete infoNoWeather.weather;
        }
        return {
          ...stop,
          info: infoNoWeather,
        };
      }),
  };
  console.log("starting completion", {
    cleaned: trip.itinerary.map((x: TripStop) => x.info),
  });
  const response = await completion({
    model: "gpt-4o-2024-05-13",
    messages: [
      {
        role: "system",
        content: `You are a trip planning expert.
The user will present a planned trip in Israel, that they planned using an application, \
your job is to review the JSON describing the trip, \
the locations, attractions and stops, \
as well as metadata such as the planned time of arrival, \
and other information they might provide you with - \
1. Weather and condition warnings:
and to note if there's anything that the user should be concerned about, examples:
examples of weather and condition warnings:
  a. If a trip is planned for August to a place that has recorded high temperatures around that time of year, \
  you should warn the user about safety measures or avoidance altogether.
  b. If a trip is planned during the rainy seasons to a place that could be too muddy to drive or walk through, \
  you should also warn the user.
- Avoid using any information about the weather that the user provided you in their trip itinerary, \
use only your knowledge of the site and the time of the trip for this.
2.Possibly inactive site:
If location for a trip's main attraction's possibly inaccessible during the time of year. Examples:
  - Some water fountains in the Negev could be dry during the heat of summer
  - The Hermon has no snow during the summer
  - Flowery fields could be barren during high winter or summer. so if you spot that the user is planning on traveling to a location where they might miss on the main reason of visit, you should warn them as well.
  If not applicable, i.e. the site is always accessible, state that there's none.
  If applicable, suggest contacting the Israeli Nature and Parks Authority for more information.
3. Reminders:
Remind the user to bring necessary equipment if they're planning on going to a location or attraction that might require it -
remind them to bring sunscreen for sunny locations, swimsuits and towels for wet locations, and other gear regarding any other type of site.
If your reminder is dealing with bringing equipment for picnics or swimming, or anything of the sort - phrase it so that it considers that the user might have already planned for it.
For example: "If you're planning on having a picnic, don't forget to bring a blanket and food. as well as a trash bag to keep the site clean."

Think in steps:
1. For each "possible_inactivity" and "reminders", list how each of them could apply for the current site.
Based on what you know of the site, and the information provided to you by the user about the trip.
If not applicable, i.e. there's no concerns regarding weather, state that there's none. call this step "raw concerns"
The weather is always relevant, so even if the weather is fine, mention it briefly in a positive way.
2. Go over the list of points and remove duplicates, for example if you stated that there's a heat warning and that the user should bring hats, and in the reminders you already mentioned hats, keep the "call to action" only in the reminders, call this step "Refining"
3. return a final set of result of the information based on the three categories, call this step "final result"
4. Finish with a short cheerful summary of the trip, and a wish for a good trip. call this part "summary", up to 20 words.
The summary should be in hebrew, Phrase hebrew pronouns as plural to avoid gender bias.
"הטיול שלכם", "קחו איתכם לדרך", "תיזהרו", "תהנו" are examples of phrases you can use.
Avoid repeating the same information in different parts of the response.
If you mentioned that the user should bring hats in the weather concerns or reminders, don't mention it again in the summary

Avoid cultural bias such as religious or political references.
For example make no comments about holy days, political events or other cultural references.
As well as avoid commenting about humbleness or modesty.

Note that the trip itinerary contains the point of departure, and it shouldn't be considered as a stop on the trip.
`,
      },
      {
        role: "user",
        content: JSON.stringify(cleaned),
      },
    ],
    temperature: 0.2,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: false,
  });
  const raw_concerns = (response as OpenAI.ChatCompletion).choices[0].message
    .content as string;
  console.log("Completed Part 1");
  console.log(raw_concerns);

  const categories = [
    "weather_and_conditions",
    "possible_inactivity",
    "reminders",
    "summary",
  ];
  const categorized = await completion({
    messages: [
      {
        role: "system",
        content: `
          Your job is to serialize the report about the trip concerns and notes into a JSON object,
          the object you should return should have ${categories.length
          } keys, each key should be a category from the following list:
          ${categories.join(", ")}
          Each value should be a string, containing the content of the category.
          The keys of the json object should be in english but the values need to be in Hebrew.
          If a category is not applicable, return null for its value.
          For example if are no reminders, the reminders key should have a value of null.
          If the possible inactivity is not applicable, the possible_inactivity key should have a value of null.
          For example, if the input provided about the possible inactivity states that "there's no possible inactivity, its value should be null,
          and not the description of why there is not possible inactivity:
          if you get "בריכת הקצינים (עין עלמין): אין. האתר תמיד נגיש ורמת המים בדרך כלל יציבה לאורך כל השנה." - return the value of
          {
            "possible_inactivity": null
          }
          and not a string describing why there shouldn't be an inactivity.
          If there are no weather and conditions concerns, the weather_and_conditions key should have a value of null.
          Phrase hebrew pronouns as plural to avoid gender bias.
          "הטיול שלכם", "קחו איתכם לדרך", "תיזהרו", "תהנו" are examples of phrases you can use.
          Avoid cultural bias such as religious or political references.
          For example make no comments about holy days, political events or other cultural references.
          As well as avoid commenting about humbleness or modesty.
          Make sure to keep proper hebrew grammar and spelling. As well as logical and coherent sentences.
          Properly translate words and phrases that are not in hebrew. avoid translating 'hydration' to 'הידרציה' for example.
          If necessary to keep the sentence coherent, use the opposite term, for example if you need to translate 'stay hydrated' \
          and you can't find a proper translation for 'hydrated', use 'הימנעו מהתייבשות'. which means 'avoid dehydration'.
          `,
      },
      {
        role: "user",
        content: raw_concerns,
      },
    ],
    model: "gpt-4o-2024-05-13",
    max_tokens: 2048,
    temperature: 0.2,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: false,
    response_format: { type: "json_object" },
  });
  console.log("Completed Part 2");
  console.log(
    (categorized as OpenAI.ChatCompletion).choices[0].message.content ??
    "No content"
  );
  if (!(categorized as OpenAI.ChatCompletion)?.choices?.length) {
    return null;
  }
  try {
    return JSON.parse(
      (categorized as OpenAI.ChatCompletion).choices[0].message.content as string
    );
  } catch (e) {
    console.error(e);
    return null;
  }
}
