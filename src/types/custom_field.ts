export enum SourceType {
  User = 'user',
  Product = 'product'
}

// export interface TriggerValue {
//   target_list_id?: string;
//   message_telegram?: string;
//   label_card_id?: string;
// }

// export enum CardActionType {
//   MoveList = 'move_list',
//   MakeLabel = 'make_label',
//   AddTag = 'add_tag',
//   RemoveTag = 'remove_tag'
// }

export enum TriggerTypes {
  CardMove = 'card_move',
  CardChanges = 'card_changes'
}

export enum ConditionType {
  CardInBoard = 'when_a_card_<filter>is<action>to_the<board>by<by>',
  CardInList = 'when_a_card_<filter>_is_<action>_list_<list>_<by>',
  CardAction = 'when_a_card_is_<action>_<by>',
  ListAction = 'when_a_list_is_<action>_<by>',
  ListHasCard = 'when_list_<list>_has_<quantitative_comparison_operator>_[quantity]_(add)'
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

// const actionTypeMap: Record<CardActionType, CardActivityType> = {
//   [CardActionType.MoveList]: CardActivityType.Action,
//   [CardActionType.MakeLabel]: CardActivityType.Action,
//   [CardActionType.AddTag]: CardActivityType.Action,
//   [CardActionType.RemoveTag]: CardActivityType.Action,
// };

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