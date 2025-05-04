export interface CardInBoardCondition {
  action: "added" | "created";
  by: "anyone" | "me";
  board: string;
}

export interface CardInListCondition {
  action: "card_in_list";
  by: "anyone" | "me";
  list_id: string;
}

export interface ListActionCondition {
  action: "added" | "created";
  by: "anyone" | "me";
  board: string;
}

export interface CardActionCondition {
  action: "card_action";
  by: "anyone" | "me";
  condition: Array<{
    operator: string;
    value: string | number;
  }>;
}

export interface ListHasCardCondition {
  action: "list_has_card";
  id_list: string;
}

export type AutomationCondition =
  | ListActionCondition
  | CardInBoardCondition
  | CardInListCondition
  | CardActionCondition
  | ListHasCardCondition;


  export enum ConditionAction {
    Added = "added",
    Removed = "removed"
  }

  export enum PersonValue {
    Anyone = "anyone",
    Me = "me",
    NotMe = "not_me",
  }