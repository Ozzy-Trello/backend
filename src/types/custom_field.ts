export enum SourceType {
  User = 'user',
  Product = 'product'
}

export interface TriggerValue {
  target_list_id?: string;
  message_telegram?: string;
  label_card_id?: string;
}

export enum CardActionType {
  MoveList = 'move_list',
  MakeLabel = 'make_label',
  AddTag = 'add_tag',
  RemoveTag = 'remove_tag'
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

const actionTypeMap: Record<CardActionType, CardActivityType> = {
  [CardActionType.MoveList]: CardActivityType.Action,
  [CardActionType.MakeLabel]: CardActivityType.Action,
  [CardActionType.AddTag]: CardActivityType.Action,
  [CardActionType.RemoveTag]: CardActivityType.Action,
};
