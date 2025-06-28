import { CardLabelAttributes } from "@/database/schemas/card_label";
import User from "@/database/schemas/user";

export enum EnumTriggeredBy {
  User = "user",
  OzzyAutomation = "ozzy-automation",
}

export enum EnumUserActionEvent {
  CardCreated = "card.created",
  CardUpdated = "card.updated",
  CardRenamed = "card.renamed",
  CardMoved = "card.moved",
  CardCopied = "card.copied",
  CardArchived = "card.archived",
  CardUnarchived = "card.unarchived",
  CardDeleted = "card.deleted",
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
  CardMovedInto = "card.moved-into",
  CardMovedOutOf = "card.moved-out-of",
  ListCreated = "list.created",
  ListMoved = "list.moved",
  ListRenamed = "list.renamed",
  ListArchived = "list.archived",
  ListUnarchived = "list.unarchived",
  ListUpdated = "list.updated",
  ListDeleted = "list.deleted",
  ChecklistAdded = "checklist.added",
  ChecklistCompleted = "checklist.completed",
  ChecklistIncompleted = "checklist.incompleted",
  ChecklistItemChecked = "checklist.item.checked",
  ChecklistItemUnchecked = "checklist.item.unchecked",
  ChecklistItemDueDateSet = "checklist.item.duedate.set",
  ChecklistItemDueDateRemoved = "checklist.item.duedate.removed",
  ChecklistItemAdded = "checklist.item.added",
  ChecklistItemRemoved = "checklist.item.removed",
  ChecklistRemoved = "checklist.removed",
}

export enum EnumActions {
  MoveCard = "move.card",
  CopyCard = "copy.card",
  Notify = "notify",
  ArchiveCard = "archive.card",
  UnarchiveCard = "unarchive.card",
  ClearCustomField = "clear.custom.field",
  SetCustomField = "set.custom.field",
  CheckCustomField = "check.custom.field",
  UncheckCustomField = "uncheck.custom.field",
  IncreaseNumberCustomField = "increase.number.custom.field",
  DecreaseNumberCustomField = "decrease.number.custom.field",
  SetDateCustomField = "set.date.custom.field",
  MoveDateCustomField = "cardfields.date.move",
  RenameCard = "rename.card",
  SetCardDescription = "set.card.description",
  AddChecklist = "add.checklist",
  AddChecklistItem = "add.checklist.item",
  RemoveChecklistItem = "remove.checklist.item",
  CheckChecklistItem = "check.item",
  UncheckChecklistItem = "uncheck.item",
  SetChecklistItemDueDate = "set.item.due.date",
  MoveChecklistItemDueDate = "move.item.due.date",
}

export interface UserActionEvent {
  eventId: string;
  type: EnumUserActionEvent;
  workspace_id: string;
  user_id: string;
  timestamp: Date;
  data: {
    card?: any;
    list?: any;
    board?: any;
    label?: CardLabelAttributes;
    member?: User;
    previous_data?: any;
    value_user_id?: string;
    checklist?: any;
  };
}
