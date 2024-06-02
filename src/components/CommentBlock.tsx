import { FC, useState } from "react";
import { Comment } from "../types/Comment";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestoreDb } from "../lib/firebase/firebase-config";
import { Avatar, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { User, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
export const CommentBlock: FC<Comment> = (comment) => {
  const [user] = useAuthState(auth);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { text, date, userName, userImg, stars, dateOfVisit } = comment;
  const deleteComment = () => {
    firestoreDb.deleteComment(comment.id);
    setDeleteDialogOpen(false);
  };
  const cancelDeletion = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <div
      className="flex flex-col p-2 border border-gray-300 rounded-lg"
      dir="rtl"
    >
      <div className="flex justify-between" dir="rtl">
        <div className="flex gap-2 items-center" dir="rtl">
          <Avatar>
            <AvatarImage src={userImg}></AvatarImage>
            {userName ? (
              <AvatarFallback className="flex items-center ">
                <Badge className="h-full">
                  {userName
                    ?.split(" ")
                    .map((x) => x[0])
                    .join("")}
                </Badge>
              </AvatarFallback>
            ) : (
              <AvatarFallback>
                <User />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <Text as="h4" className="ml-2">
              {userName}
            </Text>
            {dateOfVisit && (
              <Badge variant={"secondary"} className="rounded-lg h-fit">
                ביקרו ב-
                {dateOfVisit.toLocaleDateString("he-IL") +
                  " " +
                  dateOfVisit.toLocaleString("he-Il", {
                    hour: "numeric",
                    minute: "numeric",
                  })}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Badge variant={"outline"} className="rounded-lg h-fit">
            {date.toLocaleTimeString("he-IL", {
              hour: "numeric",
              minute: "numeric",
            }) +
              " " +
              date.toLocaleDateString("he-IL")}
          </Badge>
          <Badge variant={"secondary"} className="place-self-end">
            ⭐{stars}
          </Badge>
        </div>
      </div>
      <Text className="p-2" as="p">
        {text}
      </Text>
      {user?.uid === comment.userId && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger className="place-self-end">
            <Button className="w-fit h-fit p-1" variant="destructive">
              <Trash2 size={15} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <Text as="p" className="text-center">
              האם תרצו למחוק את ההערה?
            </Text>
            <div className="flex gap-2">
              <Button onClick={deleteComment} variant="destructive">
                כן
              </Button>
              <Button onClick={cancelDeletion} variant="secondary">
                לא
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CommentBlock;
