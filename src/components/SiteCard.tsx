"use client";

import {
    ClockIcon,
    CloudSunIcon,
    FlagIcon,
    FootprintsIcon,
    MapPinIcon,
    MessageSquareText,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { FC, useEffect, useState } from "react";
import {
    translateDifficulty,
    translateDistrict,
    translateDuration,
    translateTag,
} from "@/lib/search-utils";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Icons } from "./ui/Icons";
import { Site } from "@/types/Site";
import { getLocWeather } from "@/lib/handleWeather";
import { useRouter } from "next/navigation";
import { useSiteContext } from "@/context/SiteContext";
import { Comment } from "../types/Comment";
import { firestoreDb } from "../lib/firebase/firebase-config";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import CommentBlock from "./CommentBlock";
import { NewCommentForm } from "./AddComment";
import { auth } from "@/lib/firebase/firebase-config";
import { useAuthState } from "react-firebase-hooks/auth";
import { Alert } from "@chakra-ui/react";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import Link from "next/link";
interface SiteCardProps {
    site: Site;
    comments?: Comment[];
}

const SiteCard: FC<SiteCardProps> = ({ site }) => {
    const router = useRouter();
    const [weather, setWeather] = useState(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [ourRating, setOurRating] = useState<string | null>(null);
    const { setSite, setCurrentTrip } = useSiteContext();
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [user] = useAuthState(auth);
    useEffect(() => {
        if (site.location) {
            getLocWeather(site.id).then((weather) => {
                setWeather(weather);
            });
        }
    });

    useEffect(() => {
        if (
            comments &&
            comments.length &&
            comments.some((comment) => comment.stars)
        ) {
            setOurRating(
                (
                    comments.reduce(
                        (acc, comment) => acc + (comment.stars ?? 0),
                        0
                    ) / comments.length
                ).toPrecision(1)
            );
        }
    }, [comments]);

    useEffect(() => {
        const unsubscribe = firestoreDb.onCommentsSnapshot(
            site.id,
            setComments
        );
        return unsubscribe;
    }, [site.id]);

    return (
        <Dialog>
            <DialogTrigger dir="rtl" className="justify-starts text-right">
                {" "}
                <div
                    className="rounded-xl relative lg:hover:scale-105 transition-transform cursor-pointer"
                    dir="rtl"
                >
                    <div className="absolute flex flex-col justify-between w-full h-full bg-black/40 rounded-xl text-white">
                        <div>
                            <p className="text-[1.3rem] font-bold px-2 pt-4 lg:text-2xl ">
                                {site.name}
                            </p>
                            <p className="px-2 line-clamp-2">
                                {site.description}
                            </p>
                        </div>
                        <div className="text-[0.8rem] flex flex-row gap-[0.3rem] p-2">
                            <span className="flex items-center flex-row gap-[1vw]   font-semibold ">
                                <CloudSunIcon className="w-4 h-4" /> {weather}°
                            </span>

                            {(site.location || site.location === 0) && (
                                <span className="flex items-center flex-row gap-[1vw]  font-semibold ">
                                    <MapPinIcon className="w-4 h-4" />{" "}
                                    {translateDistrict(site.district)}
                                </span>
                            )}
                            {(site.duration || site.duration === 0) && (
                                <span className="flex items-center flex-row gap-[1vw]    font-semibold ">
                                    <ClockIcon className="w-4 h-4" />{" "}
                                    {translateDuration(site.duration)}
                                </span>
                            )}
                            {(site.distance || site.distance === 0) && (
                                <span className="flex items-center flex-row gap-[1vw]   font-semibold ">
                                    <FootprintsIcon className="w-4 h-4" />{" "}
                                    {site.distance} ק"מ
                                </span>
                            )}
                            {site.difficulty || site.difficulty === 0 ? (
                                <span className="flex items-center flex-row gap-[1vw] font-semibold ">
                                    <FlagIcon className="w-4 h-4" />
                                    {translateDifficulty(site.difficulty)}
                                </span>
                            ) : (
                                <span className="flex items-center flex-row gap-[1vw] font-semibold ">
                                    <FlagIcon className="w-4 h-4" />
                                    {translateDifficulty(0)}
                                </span>
                            )}
                        </div>
                    </div>
                    {site?.images?.length && (
                        <img
                            className="max-h-[160px]  md:max-h-[200px] w-full object-cover rounded-xl"
                            src={site.images[0]?.src}
                            alt="/"
                        />
                    )}
                </div>
            </DialogTrigger>
            <DialogContent className=" flex flex-col w-[90%] p-0 m-0 border-0 lg:max-w-[50%] ">
                {site?.images?.length && (
                    /*<Carousel showThumbs={false} className="lg:max-w-[50%]  lg:h-full ">
              {site?.images.map((image) => (
                <div className="flex justify-center ">
                  <img src={image.src} className="" />
                </div>
              ))}
            </Carousel>*/
                    <img
                        className="max-h-[300px]"
                        src={site.images[0]?.src}
                        alt="/"
                    />
                )}
                <div className="flex flex-col justify-between  px-2 py-2">
                    <div
                        className="md:top-[260px] top-[200px] mr-[3%] ml-[1%] flex flex-col gap-1"
                        dir="rtl"
                    >
                        <DialogTitle>{site.name}</DialogTitle>
                        <DialogDescription>
                            {site.description}
                        </DialogDescription>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {site.tags?.map((tag, index) => (
                                <Badge variant="defaultNoHover" key={index}>
                                    {translateTag(tag)}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex flex-row gap-2 mt-[0.5rem]">
                            {comments && (
                                <Drawer>
                                    <DrawerTrigger>
                                        <Badge
                                            className="flex flex-row-reverse items-center gap-2 w-fit text-sm"
                                            variant={"secondary"}
                                        >
                                            הערות מטיילים{" "}
                                            {`(${comments.length})`}
                                            <MessageSquareText className="w-4 h-4 mt-1" />
                                        </Badge>
                                    </DrawerTrigger>
                                    <DrawerContent
                                        className="min-h-[50%] max-h-[75%] px-2 flex"
                                        dir="rtl"
                                    >
                                        <div className="flex flex-col gap-1 pt-4 w-full overflow-scroll pb-16">
                                            {comments.length > 0 ? (
                                                comments.map(
                                                    (comment, index) => (
                                                        <CommentBlock
                                                            key={index}
                                                            {...comment}
                                                        />
                                                    )
                                                )
                                            ) : (
                                                <p>
                                                    אין עדיין הערות על{" "}
                                                    {site.name}
                                                </p>
                                            )}
                                        </div>
                                        <Dialog
                                            open={commentDialogOpen}
                                            onOpenChange={setCommentDialogOpen}
                                        >
                                            <DialogTrigger>
                                                <Button
                                                    size={"lg"}
                                                    className="absolute flex items-center justify-items-center bottom-4 right-4 rounded-2xl"
                                                >
                                                    +
                                                </Button>
                                            </DialogTrigger>
                                            {user ? (
                                                <NewCommentForm
                                                    kind="site"
                                                    {...site}
                                                    submitEvent={
                                                        setCommentDialogOpen
                                                    }
                                                />
                                            ) : (
                                                <DialogContent
                                                    dir="rtl"
                                                    className="flex flex-col max-w-[95%] md:max-w-[40%]"
                                                >
                                                    <DialogTitle>
                                                        שלום אורח/ת,
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        רק משתמשים רשומים יכולים
                                                        לדרג ולהוסיף תגובות.
                                                    </DialogDescription>
                                                    <DialogDescription>
                                                        <p>
                                                            התחברו כעת בכדי לקבל
                                                            חוויה מלאה:
                                                        </p>
                                                        <ul className="list-disc mr-[20px]">
                                                            <li>
                                                                צרו מסלול אל
                                                                האתר שבחרתם.
                                                            </li>
                                                            <li>
                                                                קבלו מידע על
                                                                תחנות דלק,
                                                                חניונים ומסעדות
                                                                בקרבת מקום ושלבו
                                                                אותם במסלול
                                                                שלכם.
                                                            </li>
                                                            <li>
                                                                קבלו מידע על
                                                                זמני ודרכי הגעה.
                                                            </li>
                                                            <li>
                                                                שמרו את המסלולים
                                                                שיצרתם באיזור
                                                                האישי בכדי
                                                                להשתמש ביום
                                                                הטיול.
                                                            </li>
                                                            <li>
                                                                הוסיפו תגובות
                                                                ודרגו את האתרים
                                                                שביקרתם בהם.
                                                            </li>
                                                        </ul>
                                                    </DialogDescription>
                                                    <div className="flex flex-row gap-[1rem] mx-auto">
                                                        <Link href="/">
                                                            <Button>
                                                                התחברות
                                                            </Button>
                                                        </Link>
                                                        <Link href="/sign-up">
                                                            <Button>
                                                                הרשמה
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </DialogContent>
                                            )}
                                        </Dialog>
                                    </DrawerContent>
                                </Drawer>
                            )}
                        </div>
                        <div className="flex flex-row gap-6 pt-4 flex-wrap">
                            <span className="flex items-center flex-row gap-1 text-sm  font-semibold ">
                                <CloudSunIcon className="w-4 h-4" /> {weather}°
                            </span>

                            {(site.location || site.location === 0) && (
                                <span className="flex items-center flex-row gap-1   font-semibold ">
                                    <MapPinIcon className="w-4 h-4" />{" "}
                                    {translateDistrict(site.district)}
                                </span>
                            )}
                            {(site.duration || site.duration === 0) && (
                                <span className="flex items-center flex-row gap-1    font-semibold ">
                                    <ClockIcon className="w-4 h-4" />{" "}
                                    {translateDuration(site.duration)}
                                </span>
                            )}
                            {(site.distance || site.distance === 0) && (
                                <span className="flex items-center flex-row gap-1   font-semibold ">
                                    <FootprintsIcon className="w-4 h-4" />{" "}
                                    {site.distance} ק"מ
                                </span>
                            )}
                            {(site.difficulty || site.difficulty === 0) && (
                                <span className="flex items-center flex-row gap-1 text-[0.8rem]   font-semibold ">
                                    <FlagIcon className="w-4 h-4" /> מסלול{" "}
                                    {translateDifficulty(site.difficulty)}
                                </span>
                            )}
                        </div>
                        <div className="flex row  ">
                            <div className="ml-[auto]">
                                <Button variant={"link"} className="p-0">
                                    <a
                                        href={site.wazeLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="py-1 flex items-center"
                                    >
                                        <Icons.waze className="w-5 h-5 ml-2" />
                                        דרכי הגעה באפליקציית ווייז
                                    </a>
                                </Button>
                            </div>
                        </div>
                        <div className="mx-auto mb-[0%]">
                            <Dialog>
                                <DialogTrigger>
                                    <Button
                                        className=""
                                        onClick={() => {
                                            if (user) {
                                                //prepare conext and go to /plan
                                                setSite(site);
                                                setCurrentTrip(null);
                                                router.push("/plan");
                                            }
                                        }}
                                    >
                                        תכננו מסלול אל {site.name}
                                    </Button>
                                </DialogTrigger>
                                {!user && (
                                    <DialogContent
                                        dir="rtl"
                                        className="flex flex-col max-w-[95%] md:max-w-[40%]"
                                    >
                                        <DialogTitle>שלום אורח/ת,</DialogTitle>
                                        <DialogDescription>
                                            רק משתמשים רשומים יכולים לבנות מסלול
                                            באתר.
                                        </DialogDescription>
                                        <DialogDescription>
                                            <p>
                                                התחברו כעת בכדי לקבל חוויה מלאה:
                                            </p>
                                            <ul className="list-disc mr-[20px]">
                                                <li>
                                                    צרו מסלול אל האתר שבחרתם.
                                                </li>
                                                <li>
                                                    קבלו מידע על תחנות דלק,
                                                    חניונים ומסעדות בקרבת מקום
                                                    ושלבו אותם במסלול שלכם.
                                                </li>
                                                <li>
                                                    קבלו מידע על זמני ודרכי
                                                    הגעה.
                                                </li>
                                                <li>
                                                    שמרו את המסלולים שיצרתם
                                                    באיזור האישי בכדי להשתמש
                                                    ביום הטיול.
                                                </li>
                                                <li>
                                                    הוסיפו תגובות ודרגו את
                                                    האתרים שביקרתם בהם.
                                                </li>
                                            </ul>
                                        </DialogDescription>
                                        <div className="flex flex-row gap-[1rem] mx-auto">
                                            <Link href="/">
                                                <Button>התחברות</Button>
                                            </Link>
                                            <Link href="/sign-up">
                                                <Button>הרשמה</Button>
                                            </Link>
                                        </div>
                                    </DialogContent>
                                )}
                            </Dialog>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SiteCard;
