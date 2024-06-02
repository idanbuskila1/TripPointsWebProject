"use client";

import { Button, buttonVariants } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FC, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import { Icons } from "./ui/Icons";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Link from "next/link";
import React from "react";
import { auth } from "@/lib/firebase/firebase-config";
import { cn } from "@/lib/utils";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

interface SignUpFormProps {}

const SignUpForm: FC<SignUpFormProps> = ({}) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [weakPassMessage, setWeakPass] = React.useState(" ");
  const router = useRouter();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Create user with email and password
    createUserWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // You can add additional user info here if needed
        console.log("User registered:", user);
        //setIsSubmitted(true);
        setWeakPass("");
        router.push("/sites");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.error("Error registering new user:", errorCode, errorMessage);
        setWeakPass(errorCode.split("/")[1].replaceAll("-", " "));
      });
  };

  //   useEffect(() => {
  //     if (isSubmitted) {
  //       router.push("/");
  //     }
  //   }, [isSubmitted, router]);
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] bg-white bg-opacity-70 p-6 rounded-md">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          הרשמו כדי להנות מחוויה מותאמת אישית
        </h1>
      </div>
      <div className={cn("grid gap-6")}>
        <div className="relative"></div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label htmlFor="email">מייל</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="email">סיסמא</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {/* {weakPassMessage && <p className="text-red-500 text-xs">{weakPassMessage}</p>} */}

            <Button isLoading={false} type="submit">
              הרשם
            </Button>
            <p className="mx-auto text-red-400 text-[1rem]">
              {weakPassMessage || ""}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
