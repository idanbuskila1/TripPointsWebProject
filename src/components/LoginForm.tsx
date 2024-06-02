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
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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

interface LoginFormProps {
    //setOpenSignUp: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginForm: FC<LoginFormProps> = ({}) => {
    const [user, loading, error] = useAuthState(auth);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    //const [isSubmitted, setIsSubmitted] = useState(false);
    const [weakPassMessage, setWeakPass] = useState(" ");
    const router = useRouter();

    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                router.push("/sites");
                // navigate("/trip-list");
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Attempt to sign in with Firebase Authentication
        signInWithEmailAndPassword(auth, username, password)
            .then((userCredential) => {
                // Sign-in successful
                console.log("Logged in user:", userCredential.user);
                //setIsSubmitted(true);
                setWeakPass("");
                router.push("/sites");
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

                console.error(
                    "Error registering new user:",
                    errorCode,
                    errorMessage
                );
                setWeakPass(errorCode.split("/")[1].replaceAll("-", " "));
            });
    };

    /*useEffect(() => {
    if (isSubmitted) {
      //   navigate("/trip-list");
    }
  }, [isSubmitted]);*/

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] bg-white bg-opacity-70 p-6 rounded-md">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    התחברו ותגלו עולם של טיולים בארץ!
                </h1>
            </div>
            <div className={cn("grid gap-6")}>
                <Button
                    variant="outline"
                    type="button"
                    disabled={loading}
                    onClick={signInWithGoogle}
                >
                    {loading ? (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Icons.google className="ml-2 h-4 w-4" />
                    )}{" "}
                    התחברות עם גוגל
                </Button>
                <div className="relative">
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-px-2 text-muted-foreground text-[1rem]">
                            או התחברו עם מייל וסיסמא
                        </span>
                    </div>
                </div>
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
                                disabled={loading}
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-1">
                            <Label htmlFor="email">סיסמא</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                disabled={loading}
                            />
                        </div>
                        <Button isLoading={loading} type="submit">
                            התחבר
                        </Button>
                        {weakPassMessage && (
                            <p className="text-red-400 text-[1rem] mx-auto">
                                {weakPassMessage}
                            </p>
                        )}
                        <div className="flex flex-row items-center gap-2">
                            <p>עוד לא רשומים?</p>
                            <span
                                onClick={() => {
                                    router.push("/sign-up");
                                    //setOpenSignUp(true);
                                }}
                                className={cn(
                                    buttonVariants({ variant: "link" }),
                                    "py-2 px-0 m-0 text-md h-4 underline cursor-pointer"
                                )}
                            >
                                לחצו כאן
                            </span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
