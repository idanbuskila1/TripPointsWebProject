import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";

import { Button } from "./ui/button";
import { FC } from "react";
import { LogOut } from "lucide-react";
import { User } from "@firebase/auth-types";
import { auth } from "@/lib/firebase/firebase-config";
import { useRouter } from "next/navigation";
import { useSiteContext } from "@/context/SiteContext";

interface UserNavMenuProps {}

const UserNavMenu: FC<UserNavMenuProps> = ({}) => {
  const [user] = useAuthState(auth);
  const { setSite, setCurrentTrip } = useSiteContext();
  const [signOut, loading, error] = useSignOut(auth);
  const router = useRouter();
  const onSignOut = async () => {
    const success = await signOut();
    if (success) {
      // alert("You are sign out");
      //reset context
      setSite(null);
      setCurrentTrip(null);
      router.push("/");
    }
  };

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <div className="items-center flex">
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarImage
                referrerPolicy="no-referrer"
                src={user?.photoURL || undefined}
                className="min-w-full"
              />
              {user?.displayName ? (
                <AvatarFallback>
                  {user?.displayName?.split(" ")[0] &&
                    user?.displayName?.split(" ")[0].length > 0 &&
                    user?.displayName?.split(" ")[0].charAt(0)}
                  {user?.displayName?.split(" ")[1] &&
                    user?.displayName?.split(" ")[1].length > 0 &&
                    user?.displayName?.split(" ")[1].charAt(0)}
                </AvatarFallback>
              ) : (
                <AvatarFallback className="bg-slate-200 text-md">
                  {user?.email?.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-1 mr-8" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="items-center">
          <LogOut className="ml-2 h-4 w-4" />
          התנתק
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNavMenu;
