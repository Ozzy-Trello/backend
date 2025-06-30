import Card from "@/database/schemas/card";
import CardCustomField from "@/database/schemas/card_custom_field";
import { CardLabelAttributes } from "@/database/schemas/card_label";
import CustomField from "@/database/schemas/custom_field";
import User from "@/database/schemas/user";
import { CardDetail } from "@/repository/card/card_interfaces";
import { CardLabelDetail } from "@/repository/label/label_interfaces";
import { ListDetail } from "@/repository/list/list_interfaces";

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
  CardMarkedCompleted = "card.marked.completed",
  CardMarkedIncompleted = "card.marked.incompleted",
  CardMirrored = "card.mirrored",
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
  AddCardMember = "add.card.member",
  RemoveCardMember = "remove.card.member",
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
    card?: CardDetail;
    list?: ListDetail;
    board?: any;
    label?: CardLabelDetail;
    member?: User;
    value_user_id?: string;
    checklist?: any;
    custom_field?: CardLabelDetail;
    _previous_data?: {
      card?: CardDetail;
      list?: ListDetail;
      custom_field?: CardLabelDetail;
    };
  };
}
