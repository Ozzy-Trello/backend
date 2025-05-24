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
  Field = 'field'
}

export enum ConditionType {
  // Card Move
  CardInBoard = 'when_a_card_<filter>is<action>to_the<board>by<by>',
  CardInList = 'when_a_card_<filter>_is_<action>_list_<list>_<by>',
  CardAction = 'when_a_card_is_<action>_<by>',
  ListAction = 'when_a_list_is_<action>_<by>',
  ListHasCard = 'when_list_<list>_has_<quantitative_comparison_operator>_[quantity]_(add)',

  // Card Changes
  CardStatus = 'when_the_card_is_marked_as_<status>_in_a_card_by_<user_id>',
  LabelOnCard = 'when_the_<label_id>_is_<action>_to_a_card_by_<user_id>',
  AttachmentAdded = 'when_an_attachment_is_<action>_to_a_card_by_<user_id>',
  MemberAdded = 'when_<user_id>_<action>_a_card',
  MentionedUser = 'when_<user_id>_is_<action>_a_card_by_<user_id>',

  // Date
  DueDateSet = 'when_a_due_<date_condition>_<date>_is_set_on_a_card_by_<user_id>',
  DateInCardName = 'when_<user_id>_enter_a_<card_name_or_desc>_<containing_or_start_with_or_ending_with>_a_date_set_due_on_the_date',

  // Checklist
  ChecklistOnCard = 'when_checklist_<label_id>_is_<action>_to_a_card_by_<user_id>',
  ChecklistCompleted = 'when_checklist_<label_id>_is_completed_in_a_card_by_<user_id>',
  ItemChecked = 'when_the_Item_name_item_is_checked_by_<user_id>',
  DueDateOnItem = 'when_a_due_date_is_set_on_a_checklist_item',
  ItemAdded = 'when_an_item_is_added_to_checklist_<label_id>_by_<user_id>',

  // Card Content
  CardTextStart = 'when_the_<field>_of_a_card_starts_with_<text>',
  CommentPosted = 'when_a_comment_is_posted_to_a_card_by_<user_id>',
  MentionInComment = 'when_<user_id>_is_mentioned_in_a_<comment_id>_on_a_card_by_<user_id>',

  // Field
  AllFieldsStatus = 'when_all_the_custom_fields_are_<status>',
  FieldsStatus = 'when_custom_fields_<field_id>_are_<status>',
  FieldSet = 'when_custom_field_<field_id>_is_set_by_<user_id>',
  FieldSetToValue = 'when_custom_field_<field_id>_is_set_to_<value>_by_<user_id>',
  FieldChecked = 'when_custom_field_<field_id>_is_checked_by_<user_id>',
  FieldNumberCompare = 'when_custom_field_<field_id>_is_set_to_a_number_<operator>_<number>_by_<user_id>',
  FieldDateSet = 'when_custom_field_<field_id>_is_set_to_a_date_by_<user_id>'
}

export enum CardMoveActionTypes {
  Move = '<action>the_card_to_a_specific<position>_<optional_board>',
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
  id_list: string;
  board_id?: string;
}

export interface MoveCondition extends BaseMoveCondition {
  action: "move";
  id_list: string;
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