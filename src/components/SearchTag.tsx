"use client";

import { FC, useState } from "react";

import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

type Option = {
  value: any;
  label: string;
};

interface SearchTagProps {
  tag: Option;
  setTag: React.Dispatch<React.SetStateAction<Option[]>>;
  select?: boolean;
}

const SearchTag: FC<SearchTagProps> = ({ tag, select = false, setTag }) => {
  const [selected, setSelected] = useState(select);
  const handleToggle = () => {
    setSelected(!selected);
    setTag((prev) => {
      if (selected) {
        return prev.filter((tag) => tag.value !== tag.value);
      }
      const ret = [...prev, tag];
      console.log(ret);
      return [...prev, tag];
    });
  };
  return (
    <Badge
      onClick={handleToggle}
      className={cn(
        "cursor-pointer px-[0.3rem]  items-center m-[0.2rem] py-[0.1rem] text-[0.9rem] min-w-max text-center justify-center lg:text-md",
        selected && "bg-slate-600 hover:bg-slate-500"
      )}
    >
      {tag.label}
    </Badge>
  );
};

export default SearchTag;
