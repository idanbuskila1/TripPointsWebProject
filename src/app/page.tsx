"use client";

import Image from "next/image";
import LandingScreen from "@/components/LandingScreen";
import MainScreen from "@/components/MainScreen";
import { auth } from "@/lib/firebase/firebase-config";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSiteContext } from "@/context/SiteContext";

export default function Home() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const { setSite, setCurrentTrip } = useSiteContext();
  useEffect(() => {
    if (user) router.push("/sites");
    setSite(null);
    setCurrentTrip(null);
  }, [user]);
  return <LandingScreen />;
}
