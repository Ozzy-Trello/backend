export enum SourceType {
  User = 'user',
  Product = 'product'
}

export enum TriggerTypes {
  CardMove = 'card_move',
  CardChanges = 'card_changes',
  Date = 'date',
  Checklist = 'checklist',
  CardContent = 'card_content',
  Field = 'field',

  AddRemove = 'add_remove',
  Member = 'member',
  Content = 'content',
  Sort = 'sort',
}

export enum ConditionType {
  // Card Move
  CardInBoard = 'when_a_card_<filter>_is_<action>_to_the_<board>_by_<by>',
  CardInList = 'when_a_card_<filter>_is_<action>_list_<list>_<by>',
  CardAction = 'when_a_card_is_<action>_<by>',
  ListAction = 'when_a_list_is_<action>_<by>',
  ListHasCard = 'when_list_<list>_has_<quantitative_comparison_operator>_[quantity]',

  // Card Changes
  CardStatus = 'when_the_card_is_marked_as_<status>_in_a_card_by_<user_id>',
  LabelOnCard = 'when_the_<label_id>_is_<action>_to_a_card_by_<user_id>',
  AttachmentAdded = 'when_an_attachment_is_<action>_to_a_card_by_<user_id>',
  MemberAdded = 'when_<user_id>_<action>_a_card',
  UserInCardChange = 'when_<user_id>_is_<action>_a_card_by_<user_id>',

  // Date
  DueDateSet = 'when_a_due_<date_condition>_<date>_is_set_on_a_card_by_<user_id>',
  DateInCardName = 'when_anyone_enter_a_<card_name_or_desc>_<containing_or_start_with_or_ending_with>_a_date_set_due_on_the_date',

  // Checklist
  ChecklistOnCard = 'when_checklist_<checklist_id>_is_<action>_to_a_card_by_<user_id>',
  ChecklistCompleted = 'when_checklist_<checklist_id>_is_completed_in_a_card_by_<user_id>',
  // ItemChecked = 'when_the_Item_name_item_is_checked_by_<user_id>',
  DueDateOnItem = 'when_a_due_<date>_is_set_on_a_checklist_item',
  ItemAdded = 'when_an_item_is_<action>_checklist_<checklist_id>_by_<user_id>',

  // Card Content
  CardTextStart = 'when_the_<field>_of_a_card_starts_with_<text>',
  CommentPosted = 'when_a_comment_is_posted_to_a_card_by_<user_id>',
  MentionInComment = 'when_<user_id>_is_mentioned_in_a_<comment_id>_on_a_card_by_<user_id>',

  // Field
  AllFieldsStatus = 'when_all_the_custom_fields_are_<status>',
  FieldsStatus = 'when_custom_fields_<custom_field_id>_are_<status>',
  FieldSet = 'when_custom_field_<custom_field_id>_is_set_by_<user_id>',
  FieldSetToValue = 'when_custom_field_<custom_field_id>_is_set_to_<value>_by_<user_id>',
  FieldChecked = 'when_custom_field_<custom_field_id>_is_checked_by_<user_id>',
  FieldNumberCompare = 'when_custom_field_<custom_field_id>_is_set_to_a_number_<operator>_<number>_by_<user_id>',
  FieldDateSet = 'when_custom_field_<custom_field_id>_is_set_to_a_date_by_<user_id>'
}

export enum ActionType {
  // Move
  MoveCardToList = '<action>_the_card_to_a_specific_<position>_<list_id>',
  MoveCardPosition = 'move_the_card_to_<position>',
  MoveToArchived = 'move_the_card_to_<action__archive_or_unarchived>',

  // Add / Remove
  AddCardToList = 'create_card_with_<name>_<position>_<list_id>',
  MirrorTheCard = 'mirror_the_card_to_<position>_<list_id>_on_<board_id>',
  AddLabelToCard = 'add_<label_id>_to_the_card',
  // AddStikcerToCard = 'add_<stiker_id>_to_the_card',
  AddLinkAttachmentToCard = 'add_<link>_as_an_attachment_to_the_card',
  RemoveDueDateFromCard = 'remove_due_date_from_the_card',
  // ChangeCardListColor = 'change_list_<list_id>_color_to_<label_id>',

  // Date
  MarkDueDateAsStatus = 'mark_due_date_as_<status>_on_the_card',
  SetDueDate = 'set_due_date_to_<date>_on_the_card',
  MoveDueDate = 'move_due_date_to_<date>_on_the_card',
  // MoveDueDateBySameAmount = 'move_due_date_by_<amount>_on_the_card',

  // Checklist
  AddChecklistToCard = '<add_or_remove>_<checklist_id>_to_the_card',
  AddEmptyChecklistToCard = 'add_an_empty_checklist_<checklist_id>_to_the_card',
  AddItemToChecklist = 'add_<item_name>_to_checklist_<checklist_id>',
  AssignCardToUser = 'assign_the_card_to_<user_id>',
  SetCardDueDate = 'set_due_date_to_<date>_on_the_card',
  // RemoveDueDateFromCard = 'remove_due_date_from_the_card',
  // **
  // ** 
  // ** 
  // ** 

  // Member
  JoinOrLeaveCard = '<join_or_leave>_the_card',
  SubscribeToCard = 'subscribe_to_the_card',
  AddOrRemoveUser = '<add_or_remove>_<user_id>_to_the_card',
  AddOrRemoveRandomUser = '<add_or_remove>_random_<user_id>_to_the_card',
  RemoveAllMembersFromCard = 'remove_all_members_from_the_card',

  // Content
  RenameCard = 'rename_the_card_to_<name>',
  ChangeCardDescription = 'change_the_card_description_to_<description>',
  PostComment = 'post_a_comment_<text>_on_the_card',
  SendEmailNotificiaton = 'send_email_notification_to_<email>_about_the_card<subject><text>',
  SendGetRequestToURL = 'send_get_request_to_<url>',

  // Field
  ClearCustomField = 'CustomField_<custom_field_id>',
  SetCustomFieldValue = 'set_custom_field_<custom_field_id>_to_<value>',
  // CheckCustomField = 'check_custom_field_<custom_field_id>',
  IncreaseCustomFieldNumberValue = 'increase_custom_field_<custom_field_id>_number_value_by_<value>', 
  SetDateValueCustomField = 'set_date_value_custom_field_<custom_field_id>_to_<date>',
  // ** 

  // Sort
  SortTheListBy = 'sort_the_list_by_<field>_<order>',
  SortTheListByCustomField = 'sort_the_list_by_custom_field_<custom_field_id>_<order>',
  SortTheListByLabel = 'sort_the_list_by_label_<label_id>_<order>',

  // 
}

export interface MoveListValue {
  origin_list_id: string;
  destination_list_id: string;
}

export type CardActionValue = MoveListValue | undefined

export enum CardActivityType {
  Action = 'action',
  Comment = 'comment'
}

export type ActionsValue = CardMoveConfig | CardChangesConfig;

export interface CardMoveConfig {
  group_type: TriggerTypes.CardMove;
  condition: CardMoveCondition;
}

export interface CardChangesConfig {
  group_type: TriggerTypes.CardChanges;
  condition: CardChangesCondition;
}

export type CardMoveCondition =
  | CopyCondition
  | MoveCondition
  | CardPositionCondition
  | CardActionCondition;

export interface BaseMoveCondition {
  type: string;
  position: string;
}

export interface CopyCondition extends BaseMoveCondition {
  action: "copy";
  include_comments: boolean;
  list_id: string;
  board_id?: string;
}

export interface MoveCondition extends BaseMoveCondition {
  action: "move";
  list_id: string;
  board_id?: string;
}

export interface CardPositionCondition extends BaseMoveCondition {
  action: "card_position";
}

export interface CardActionCondition extends BaseMoveCondition {
  action: "card_action";
}

export interface UserActionCondition {
  action: "user_action";
  user_id: string;
  by: string;
}

export type CardChangesCondition = UserActionCondition;