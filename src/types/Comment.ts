export type CommentParentKind = "site" | "trip" | "place";
export type Comment = {
  id: string;
  kind: CommentParentKind;
  parentId: string;
  text?: string;
  date: Date;
  dateOfVisit?: Date;
  userId?: string;
  userName?: string;
  userImg?: string;
  stars?: number;
};
