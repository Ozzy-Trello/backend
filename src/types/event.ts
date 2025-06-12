import { CardLabelAttributes } from "@/database/schemas/card_label";
import User from "@/database/schemas/user";

export enum EnumUserActionEvent {
  CardCreated = "card.created",
  CardUpdated = "card.updated",
  CardRenamed = "card.renamed",
  CardMoved = "card.moved",
  CardCopied = "card.copied",
  CardArchived = "card.archived",
  CardUnarchived = "card.unarchived",
  CardLabelAdded = "card.label.added",
  CardMemberAdder = "card.member.added",
  CardCoverAdded = "card.cover.added",
  CardAttachmentAdded = "card.attachment.added",
  CardCustomFieldChange = "card.customfield.changed",
  CardCommentAdded = "card.comment.added",
  CardStartDateAdded = "card.startdate.added",
  CardDueDateAdded = "card.duedate.added",
  CardAddedTo = "card.added-to",
  CreatedIn = "card.created-in",
  CardEmailedInto = "card.emailed-into",
  CardMovedInto = "card.moved-into",
  CardMovedOutOf = "card.moved-out-of",
}

export enum EnumActions {
  MoveCard = "move.card",
  CopyCard = "copy.card",
  Notify = "notify",
  ArchiveCard = "archive.card",
  UnarchiveCard = "unarchive.card",
}

export interface UserActionEvent {
  type: EnumUserActionEvent;
  workspace_id: string;
  user_id: string;
  timestamp: Date;
  data: {
    card?: any;
    label?: CardLabelAttributes;
    member?: User;
    previous_data?: any;
    value_user_id?: string;
  };
}
