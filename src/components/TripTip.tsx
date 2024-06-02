"use client";

import { ReactNode, useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import { cn } from "../lib/utils";

export function TripTip({
    loading,
    text,
    icon,
    className,
}: {
    loading: boolean;
    text?: string | null;
    icon: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-row gap-2", className)}>
            <div>{icon}</div>
            {loading || !text ? (
                <div className=" flex flex-col gap-2 w-full">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ) : (
                <TextGenerateEffect words={text as string} />
            )}
        </div>
    );
}

export default TripTip;
