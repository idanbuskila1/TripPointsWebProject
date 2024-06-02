import { auth, db } from "../lib/firebase/firebase-config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { error } from "console";

type LocationType = {
  id: string;
  name: string;
  image: [
    {
      src: string;
      alt: string;
    },
    {
      src: string;
      alt: string;
    },
    {
      src: string;
      alt: string;
    }
  ];
  location: {
    x: number;
    y: number;
  };
  wazeLink: string;
  description: string;
  tags: string[];
  difficulty?: number;
  distance?: number;
  district?: number;
  duration?: number;
  weather: { weather: string; timeStamp: typeof serverTimestamp };
};
//how much hours before last weather update are allowed
const THRESHOLD_IN_HOURS = 2;

//get weather by gps location with accuWeather
async function getWeather(coords: { x: number; y: number }) {
  return fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${coords.x}&longitude=${coords.y}&current_weather=true`
  ).then((response) =>
    response
      .json()
      .then((data) => {
        if (data.current_weather) return data.current_weather.temperature;
        else return 0;
      })
      .catch((error) => {
        console.error(error);
        return 0;
      })
  );
}
//for each document in Locations collection in firestore - update weather value
export const updateWeatherToAllLocations = async () => {
  //loop on every location
  getDocs(collection(db, "Locations")).then((snapshot) => {
    const entry = snapshot.docs.at(0);
    if (entry) {
      const weather = entry.data().weather;
      if (weather && weather.timeStamp && weather.timeStamp.seconds) {
        const lastUpdateTime = weather?.timeStamp?.seconds * 1000;
        const nowDate = new Date();
        const elapsedTime = (nowDate.getTime() - lastUpdateTime) / 3600000;
        if (elapsedTime < THRESHOLD_IN_HOURS) {
          return;
        }
      }
    }
    snapshot.forEach((entry) => {
      const weather = entry.data().weather;
      const nowDate = new Date();
      if (weather && weather.timeStamp && weather.timeStamp.seconds) {
        const lastUpdateTime = weather.timeStamp.seconds * 1000;
        const elapsedTime = (nowDate.getTime() - lastUpdateTime) / 3600000;
        if (!(elapsedTime > THRESHOLD_IN_HOURS)) {
          //console.log("success");
          return;
        }

        //fetch current weather from accuWeather
        getWeather(entry.data().location)
          .then((res) => {
            let weather;
            //console.log(entry.id, entry.data().location, res);
            if (res == 0) weather = entry.data()?.weather?.weather;
            else weather = res;
            updateDoc(entry.ref, {
              weather: { weather: weather, timeStamp: serverTimestamp() },
            });
          })
          .catch((error) => {
            console.error(error);
          });
      }
      //set location wather to the fetched weather
    });
  });
};
//get weather from firestore by location id. if TRESHOLD_IN_HOURS hrs passed since last update- update weather for all locs.
export const getLocWeather = async (id: string) => {
  const docRef = doc(db, "Locations", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    let weather = docSnap.data().weather;
    return weather.weather;
  }
};
