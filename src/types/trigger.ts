export interface ListActionCondition {
  type: "list_action";
  by: "every_one" | "me";
  action: string;
}

export interface CardInBoardCondition {
  type: "card_in_board";
  by: "every_one" | "me";
  action: string;
}

export interface CardInListCondition {
  type: "card_in_list";
  by: "every_one" | "me";
  id_list: string;
  action: string;
}

export interface CardActionCondition {
  type: "card_action";
  by: "every_one" | "me";
  action: string;
}

export interface ListHasCardCondition {
  type: "list_has_card";
  id_list: string;
  condition: Array<{
    operator: string;
    value: string | number;
  }>;
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