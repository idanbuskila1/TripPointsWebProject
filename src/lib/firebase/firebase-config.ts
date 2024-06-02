import {
  QueryConstraint,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { NearbyPlaces, Site } from "@/types/Site";

import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import locations from "@/data/locationsJSON.json";
import { Comment, CommentParentKind } from "../../types/Comment";
import { Trip } from "@/types/Site";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-tCzprHoCInoK8da8mnnEM2ZAvqPZ4sk",
  authDomain: "trip-points-5d488.firebaseapp.com",
  projectId: "trip-points-5d488",
  storageBucket: "trip-points-5d488.appspot.com",
  messagingSenderId: "1059304583120",
  appId: "1:1059304583120:web:930bfa29edb6d9bf5c13d5",
};

async function findWithQuery<T>(
  collectionName: string,
  constraint?: QueryConstraint
) {
  const q = constraint
    ? query(collection(db, collectionName), constraint)
    : collection(db, collectionName);
  const docs = await getDocs(q);
  return docs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
}

function initializeFirebase() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore();
  const auth = getAuth(app);
  const firestoreDb = {
    locations: (q?: QueryConstraint) => findWithQuery<Site>("Locations", q),
    nearbyPlaces: (q?: QueryConstraint) =>
      findWithQuery<NearbyPlaces>("NearbyPlaces", q),
    saveTrip: async (trip: Trip) => {
      const ref = doc(collection(db, "Trips"));
      setDoc(ref, {
        ...trip,
      }).then(() => {
        setDoc(ref, {
          ...trip,
          id: ref.id,
        });
        console.log(ref.id);
      });
    },
    getTrip: async (id: string) =>
      getDoc(doc(db, "Trips", id)).then((doc) => doc.data() as Trip),
    getTripsForUser: async (userId: string) =>
      findWithQuery<Trip>("Trips", where("ownerId", "==", userId)),

    getNearby: async (id: string) =>
      (
        await findWithQuery<NearbyPlaces>(
          "NearbyPlaces",
          where("locationId", "==", id)
        )
      )[0],
    deleteTrip: async (id: string) => {
      const ref = doc(db, "Trips", id);
      await deleteDoc(ref);
      console.log("Document deleted with ID: ", id);
    },
    addComment: async (comment: Omit<Comment, "id">) => {
      const id: string = generateId();
      const ref = doc(collection(db, "Comments"), id);
      await setDoc(ref, { ...comment });
    },
    deleteComment: async (id: string) => {
      const ref = doc(db, "Comments", id);
      await deleteDoc(ref);
      console.log("Document deleted with ID: ", id);
    },
    getCommentsQuery: (id: string, kind: CommentParentKind) =>
      query(
        collection(db, "Comments"),
        where("parentId", "==", id),
        where("kind", "==", kind)
      ),
    getComments: async (id: string, kind: CommentParentKind) => {
      const comments = await getDocs(firestoreDb.getCommentsQuery(id, kind));
      return comments.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            date: new Date(1000 * doc.data().date.seconds),
            dateOfVisit: new Date(1000 * doc.data().dateOfVisit.seconds),
          } as Comment)
      );
    },
    onCommentsSnapshot: (
      id: string,
      updateCommentsCallback: (comments: Comment[]) => void
    ) =>
      onSnapshot(firestoreDb.getCommentsQuery(id, "site"), (snapshot) => {
        if (snapshot.docChanges().forEach.length) {
          //console.log("comments modified", snapshot.docChanges());
          updateCommentsCallback(
            snapshot.docs
              .map(
                (doc) =>
                  ({
                    id: doc.id,
                    ...doc.data(),
                    date: new Date(1000 * doc.data().date.seconds),
                    dateOfVisit: new Date(
                      1000 * doc.data().dateOfVisit.seconds
                    ),
                  } as Comment)
              )
              .sort((a, b) => b.date.getTime() - a.date.getTime())
          );
        }
      }),
    getAvgRating: async (id: string, kind: CommentParentKind) => {
      //take all comments for a location with non-null stars rating
      const comments = (await firestoreDb.getComments(id, kind)).filter(
        (comment) => comment.stars
      );
      const avg =
        comments.reduce((acc, comment) => acc + (comment.stars ?? 0), 0) /
        comments.length;
      return avg;
    },
  };

  //console.log("Firebase initialized, number of locations: ", locations.length);
  return { auth, db, firestoreDb };
}

const { auth, db, firestoreDb } = initializeFirebase();
export { auth, db, firestoreDb };

function generateId() {
  return Math.random().toString(16).substring(4);
}
// async function uploadLocations(db: Firestore) {
//   try {
//     const collectionRef = collection(db, "Locations");
//     locations.forEach(async (loc) => {
//       await addDoc(collectionRef, loc);
//     });
//   } catch (err) {
//     console.log(err);
//   }
// }
//uploadLocations(); DONT GET OUT OF COMMENT
//Connect form to database
// async function submitFormData(db: Firestore, formData: any) {
//   try {
//     const docRef = await addDoc(collection(db, "locations"), formData);
//     console.log("Document written with ID: ", docRef.id);
//   } catch (e) {
//     console.error("Error adding document: ", e);
//   }
// }
