"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { Button } from "./ui/button";
import { FC } from "react";
import Link from "next/link";
import { Pacifico } from "next/font/google";
import UserNavMenu from "./UserNavMenu";
import { auth } from "@/lib/firebase/firebase-config";
import { cn } from "@/lib/utils";
import { useAuthState } from "react-firebase-hooks/auth";
import { usePathname } from "next/navigation";
interface NavbarProps {}

const Navbar: FC<NavbarProps> = ({}) => {
  const [user] = useAuthState(auth);
  const path = usePathname();
  /*return !user ? (
    <div className="relative">
      <div className="mt-0 flex bg-opacity-0 dark:bg-gray-800 w-full fixed top-0 flex-1 md:px-12 px-6 py-4 md:py-4 justify-center items-center">
        <div className="hidden md:flex ml-10 space-x-4"></div>
        <div className="mx-auto text-center">
          <Link href="/" passHref>
            <div
              className={cn(
                "sm:text-4xl text-3xl -my-2 hover:scale-110 transition-transform cursor-pointer text-white font-bold font-pacifico"
              )}
            >
              Tripoints
            </div>
          </Link>
        </div>
        <div className="hidden md:flex ml-10 space-x-4"></div>
      </div>
    </div>
  ) : (
    <nav
      className={cn(
        "shadow-md px-[1rem]  sm:mt-0 py-[0.5rem] items-center dark:border-b-2  antialiased bg-zinc-100 dark:bg-background h-fit z-10"
      )}
    >
      {user ? (
        <div className="flex flex-row justify-between">
          <div className="flex items-center ">
            <h1 className="text-[0.9rem] pacifico md:text-[1.2rem]">
              Trip Points
            </h1>
          </div>

          <div className="flex ">
            <Link href="/my-trips">
              <Button className="p-[0.3rem] md:text-[1.2rem]" variant={"link"}>
                הטיולים שלי
              </Button>
            </Link>
            <Link href="/">
              <Button className=" md:text-[1.2rem]" variant={"link"}>
                צרו טיול
              </Button>
            </Link>

            <UserNavMenu />
          </div>
        </div>
      ) : (
        <div className="flex items-center j">
          <h1 className="text-lg font-pacifico">Trip Points</h1>
        </div>
      )}
    </nav>
  );
};*/

  return (
    <nav
      className={cn(
        "bg-opacity-80 w-screen shadow-md px-[1rem] sm:mt-0 py-[0.5rem] items-center dark:border-b-2  antialiased bg-zinc-100 dark:bg-background h-[55px] z-10",
        (path == "/" || path == "/sign-up") && "fixed"
      )}
    >
      {!user ? (
        <div className="flex flex-row justify-between">
          <div className="flex items-center ">
            <h1 className="text-[0.9rem] pacifico md:text-[1.2rem]">
              <Link href="/sites">
                <Button className="md:text-[1.2rem]" variant={"link"}>
                  Trip Points
                </Button>
              </Link>
            </h1>
          </div>

          <div className="flex ">
            <Link href="/">
              <Button className=" md:text-[1.2rem]" variant={"link"}>
                התחברות
              </Button>
            </Link>
            <Link href="/sites">
              <Button className="p-[0.3rem] md:text-[1.2rem]" variant={"link"}>
                צרו מסלול
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-row justify-between">
          <div className="flex items-center ">
            <h1 className="text-[0.9rem] pacifico md:text-[1.2rem]">
              <Link href="/sites">
                <Button className="md:text-[1.2rem]" variant={"link"}>
                  Trip Points
                </Button>
              </Link>
            </h1>
          </div>

          <div className="flex ">
            <Link href="/my-trips">
              <Button className="p-[0.3rem] md:text-[1.2rem]" variant={"link"}>
                הטיולים שלי
              </Button>
            </Link>
            <Link href="/sites">
              <Button className=" md:text-[1.2rem] " variant={"link"}>
                צרו טיול
              </Button>
            </Link>

            <UserNavMenu />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
