"use client";

import { FC, useEffect, useState, useRef } from "react";
import {
    getTags,
    searchLocations,
    translateDifficulty,
    translateDistrict,
    translateTag,
} from "@/lib/search-utils";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Site } from "@/types/Site";
import SiteCard from "./SiteCard";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { updateWeatherToAllLocations } from "@/lib/handleWeather";
import { useSiteContext } from "@/context/SiteContext";
import { useMockPaginate } from "@/components/usePaginate";
import { PaginateButton } from "@/lib/paginateButton";
import { Icons } from "./ui/Icons";
import { FilterIcon } from "lucide-react";

interface MainScreenProps {}

const MainScreen: FC<MainScreenProps> = ({}) => {
    type Option = {
        value: any;
        label: string;
    };
    const weatherFetch = useRef(false);
    const [search, setSearch] = useState<string>("");
    const [numOfSitesLoading, setNumOfSitesLoading] = useState<boolean>(false);
    const [tags, setTags] = useState<Option[]>([]);
    const [districts, setDistricts] = useState<Option[]>([]);
    const [difficulties, setDifficulties] = useState<Option[]>([]);
    const [resultLength, setResultLength] = useState<number>(0);
    const [selectedTags, setSelectedTags] = useState<Option[]>([]);
    const [selectedDistricts, setSelectedDistricts] = useState<Option[]>([]);
    const [selectedDifficulties, setSelectedDifficulties] = useState<Option[]>(
        []
    );
    const [sites, setSites] = useState<Site[]>([]);
    const { setCurrentTrip } = useSiteContext();
    const districtOpts: Option[] = [0, 1, 2, 3].map((district) => ({
        value: district,
        label: translateDistrict(district),
    }));
    const difficultyOpts: Option[] = [1, 2, 3].map((difficulty) => ({
        value: difficulty,
        label: translateDifficulty(difficulty),
    }));
    useEffect(() => {
        getTags().then((foundTags) => {
            const opts = foundTags.map((tag) => {
                return { value: tag, label: translateTag(tag) };
            });
            setTags(opts);
            setDistricts(districtOpts);
            setDifficulties(difficultyOpts);
        });
    }, []);
    useEffect(() => {
        if (weatherFetch.current) return;
        weatherFetch.current = true;
        updateWeatherToAllLocations();
        setCurrentTrip(null);
    }, []);

    useEffect(() => {
        searchLocations({
            query: search,
            difficulties: selectedDifficulties.map((diff) => diff.value),
            districts: selectedDistricts.map((district) => district.value),
            tags: selectedTags.map((tag) => tag.value),
        }).then((result) => {
            setSites(result);
        });
    }, [search]);
    useEffect(() => {
        searchLocations().then((result: Site[]) => {
            setSites(result);
            setResultLength(result.length);
        });
    }, []);
    const handleToggle = (
        tag: Option,
        selected: Option[],
        setSelected: any
    ) => {
        //gets tag and its state and set function
        //updates selected state accordingly
        //updates resultLength state accordingly
        const isSelected = selected.includes(tag);
        if (isSelected) {
            setSelected(selected.filter((arg) => arg.value !== tag.value));
        } else {
            setSelected([...selected, tag]);
        }
    };
    useEffect(() => {
        setNumOfSitesLoading(true);
        searchLocations({
            query: search,
            difficulties: selectedDifficulties.map((diff) => diff.value),
            districts: selectedDistricts.map((district) => district.value),
            tags: selectedTags.map((tag) => tag.value),
        }).then((result) => {
            setResultLength(result.length);
            setNumOfSitesLoading(false);
        });
    }, [selectedDifficulties, selectedDistricts, selectedTags]);

    const { nextPage, prevPage, paginatedData, currentPage, setPage } =
        useMockPaginate(sites, 18);

    useEffect(() => {
        console.log("sites changed");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [paginatedData]);
    return (
        <div className="py-1" dir="rtl">
            <div className="flex flex-col px-3 gap-0 md:px-12 ">
                <div className="flex flex-row justify-center items-center bg-slate-100 rounded-md gap-[2%] my-[1%] pb-[1%] pt-[1%]">
                    <div className="bg-slate-200">
                        <Dialog>
                            <DialogTrigger className="inline-flex items-center px-[1rem] py-[0.4rem] justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90">
                                <div className="flex flex-row items-center gap-[0.3rem]">
                                    <FilterIcon className="h-[0.9rem] w-[1rem]"></FilterIcon>
                                    <p>סינון</p>
                                </div>
                            </DialogTrigger>
                            <DialogContent
                                dir="rtl"
                                className="h-[auto] max-h-[85%] flex flex-col gap-[0.8rem]"
                            >
                                <DialogTitle>תגיות</DialogTitle>
                                <div className="bg-slate-100 rounded-md py-[0.5rem] px-[0.4rem]">
                                    {tags.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            onClick={() =>
                                                handleToggle(
                                                    tag,
                                                    selectedTags,
                                                    setSelectedTags
                                                )
                                            }
                                            className={cn(
                                                "cursor-pointer px-[0.3rem]  items-center m-[0.2rem] py-[0.1rem] text-[0.9rem] min-w-max text-center justify-center lg:text-md",
                                                selectedTags.includes(tag) &&
                                                    "bg-slate-400 hover:bg-slate-600"
                                            )}
                                        >
                                            {tag.label}
                                        </Badge>
                                    ))}
                                </div>
                                <DialogTitle>איזור בארץ</DialogTitle>
                                <div className="bg-slate-100 rounded-md py-[0.5rem] px-[0.4rem]">
                                    {districts.map((district, index) => (
                                        <Badge
                                            key={index}
                                            onClick={() => {
                                                handleToggle(
                                                    district,
                                                    selectedDistricts,
                                                    setSelectedDistricts
                                                );
                                            }}
                                            className={cn(
                                                "cursor-pointer px-[0.3rem]  items-center m-[0.2rem] py-[0.1rem] text-[0.9rem] min-w-max text-center justify-center lg:text-md",
                                                selectedDistricts.includes(
                                                    district
                                                ) &&
                                                    "bg-slate-400 hover:bg-slate-500"
                                            )}
                                        >
                                            {district.label}
                                        </Badge>
                                    ))}
                                </div>
                                <DialogTitle>רמת קושי</DialogTitle>
                                <div className="bg-slate-100 rounded-md py-[0.5rem] px-[0.4rem]">
                                    {difficulties.map((diff, index) => (
                                        <Badge
                                            key={index}
                                            onClick={() =>
                                                handleToggle(
                                                    diff,
                                                    selectedDifficulties,
                                                    setSelectedDifficulties
                                                )
                                            }
                                            className={cn(
                                                "cursor-pointer  hover:bg-slate-500 px-[0.3rem]  items-center m-[0.2rem] py-[0.1rem] text-[0.9rem] min-w-max text-center justify-center lg:text-md",
                                                selectedDifficulties.includes(
                                                    diff
                                                ) && "bg-slate-400"
                                            )}
                                        >
                                            {diff.label}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="h-[1rem]">
                                    <DialogDescription>
                                        {numOfSitesLoading ? (
                                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            `${resultLength} תוצאות נמצאו.`
                                        )}
                                    </DialogDescription>
                                </div>
                                <div className="flex flex-row gap-[2%] justify-center">
                                    <div>
                                        <DialogPrimitive.Close>
                                            <Button
                                                className="p-[0.5rem] h-[70%]"
                                                onClick={() =>
                                                    searchLocations({
                                                        query: search,
                                                        difficulties:
                                                            selectedDifficulties.map(
                                                                (diff) =>
                                                                    diff.value
                                                            ),
                                                        districts:
                                                            selectedDistricts.map(
                                                                (district) =>
                                                                    district.value
                                                            ),
                                                        tags: selectedTags.map(
                                                            (tag) => tag.value
                                                        ),
                                                    }).then((result) => {
                                                        setSites(result);
                                                        setPage(1);
                                                    })
                                                }
                                            >
                                                בחירה
                                            </Button>
                                        </DialogPrimitive.Close>
                                    </div>
                                    <div>
                                        <DialogPrimitive.Close>
                                            <Button
                                                variant="outline"
                                                className="p-[0.5rem] h-[70%]"
                                                onClick={() => {
                                                    setPage(1);
                                                    setSelectedTags([]);
                                                    setSelectedDistricts([]);
                                                    setSelectedDifficulties([]);
                                                    searchLocations().then(
                                                        (result) => {
                                                            setSites(result);
                                                            setResultLength(
                                                                result.length
                                                            );
                                                        }
                                                    );
                                                }}
                                            >
                                                איפוס
                                            </Button>
                                        </DialogPrimitive.Close>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="flex w-[60%] max-w-[300px]">
                        <Input
                            type="text"
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="חיפוש חופשי..."
                            className="rounded-3xl border-4"
                        />
                    </div>

                    {/*<div className="flex gap-1 overflow-x-auto">
            {tags.map((tag) => (
              <SearchTag setTag={setSelectedTags} tag={tag} />
            ))}
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {districtOpts.map((tag) => (
              <SearchTag setTag={setSelectedDistricts} tag={tag} />
            ))}
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {difficultyOpts.map((tag) => (
              <SearchTag setTag={setSelectedDifficulties} tag={tag} />
            ))}
            </div>*/}
                </div>
            </div>

            <div>
                {sites && (
                    <div className="max-w-[1640px] mx-[2%] grid gap-[1.3vh]  md:grid-cols-3 lg:gap-[3vh]">
                        {paginatedData.map((site, index) => (
                            <SiteCard site={site} key={index} />
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-row justify-center items-center gap-7 mt-[1.5rem] mb-[1rem] ">
                <PaginateButton
                    CTA="הקודם"
                    onClick={prevPage}
                    disabled={currentPage === 1 && true}
                />
                <PaginateButton
                    CTA=" הבא "
                    onClick={nextPage}
                    disabled={false}
                />
            </div>
        </div>
    );
};

export default MainScreen;
