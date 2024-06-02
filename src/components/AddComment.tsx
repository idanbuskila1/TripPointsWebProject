import { FC, useState } from "react";
import { DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { DatePickerDemo } from "./ui/datepicker";
import { Textarea } from "./ui/textarea";
import { Rating } from "react-simple-star-rating";
import { Site, Place, Trip } from "../types/Site";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
import { auth, firestoreDb } from "../lib/firebase/firebase-config";
import { Comment, CommentParentKind } from "../types/Comment";
import { useAuthState } from "react-firebase-hooks/auth";

export const NewCommentForm: FC<
  { kind: CommentParentKind; submitEvent: (value: boolean) => void } & (
    | Site
    | Place
    | Trip
  )
> = (props) => {
  const [user] = useAuthState(auth);
  const { name, kind, submitEvent } = props;
  const [reviewText, setReviewText] = useState<string>("");
  const [visitDate, setVisitDate] = useState<Date>();
  const [rating, setRating] = useState<number | null>(null);

  const onRatingChange = (value: number | null) => {
    setRating(value);
  };
  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewText(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // TODO - still preventdefault but then close the dialog without refershing the page
    console.log({
      reviewText,
      visitDate,
      rating,
    });
    const comment: Omit<Comment, "id"> = {
      date: new Date(),
      dateOfVisit: visitDate,
      parentId: "id" in props ? props.id : props.name,
      kind: kind,
      text: reviewText,
      userId: user?.uid,
      userName: user?.displayName ?? undefined,
    };
    if (rating) {
      comment.stars = rating;
    }
    firestoreDb.addComment(comment).then(() => {});
    submitEvent(false);
    setVisitDate(undefined);
  };

  return (
    <DialogContent dir="rtl">
      <form onSubmit={onSubmit}>
        <DialogDescription className="flex flex-col gap-2">
          <DialogTitle>הוספת הערה על {name ?? "האתר"}</DialogTitle>
          <DatePickerDemo
            value={visitDate}
            setValue={setVisitDate}
            placeholder="תאריך הביקור שלך"
          />
          <Textarea
            required
            placeholder="תוכן התגובה"
            onChange={onTextChange}
          ></Textarea>
          <div className="flex gap-2 items-center flex-row">
            <span>
              <Text className="mb-1" as="p">
                ציון
              </Text>
            </span>
            <Rating
              onClick={onRatingChange}
              size={25}
              rtl={true}
              SVGstyle={{ display: "inline" }}
              allowFraction={true}
            />
          </div>
        </DialogDescription>
        <Button type="submit">שליחה</Button>
      </form>
    </DialogContent>
  );
};
