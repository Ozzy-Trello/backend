import { EnumActions, EnumOptionPosition, EnumOptionsSubject } from "./options";

export interface Trigger {
  trigger_type: TriggerType;
  expected_condition_key: string[];
  [key:string]: any
}

export interface Action {
  action_type: ActionType;
  expected_condition_key: string[];
  [key:string]: any
}

export enum TriggerType {
  WhenACardActionOverBoard = "when_a_card_<filter>_is_<action>_the_board_<by>",
  WhenACardActionOverList = "when_a_card_<filter>_is_<action>_list_<list>_<by>",
  WhenACardHasArchivalAction = "when_a_<filter>_is_<archival>",
  WhenAListIsAction = "when_a_list_is_<action>_<by>",
  WhenListHasCards = "when_list_<list>_has_<number-comparison-operator>_[number]"
  // add more..
}

export enum ActionType {
  ActionTheCardToPositionInSpecificList = "<action>_the_card_to_<position>_<list>",
  ActionTheCardToPosition = "move_the_card_to_<position>",
  ArchivalActionTheCard = "<archive>_the_card",
  //add more..
}

// Triggers Map
export const TriggersMap: Map<string, Trigger> = new Map(
  [
    [TriggerType.WhenACardActionOverBoard, {
      trigger_type: TriggerType.WhenACardActionOverBoard,
      expected_condition_key: ["action", "_by"],
      action: [
        EnumActions.AddedTo,
        EnumActions.CreatedIn,
        EnumActions.EmailedInto,
        EnumActions.MovedInto,
        EnumActions.MovedOutOf,
      ],
      _by: [
        EnumOptionsSubject.ByAnyone,
        EnumOptionsSubject.ByMe,
        EnumOptionsSubject.BySpecificUser,
        EnumOptionsSubject.ByAnyoneExceptMe,
        EnumOptionsSubject.ByAnyoneExceptSpecificUser
      ]
    }],
     [TriggerType.WhenACardActionOverList, {
      trigger_type: TriggerType.WhenACardActionOverBoard,
      expected_condition_key: ["action", "list", "by"],
      action: [
        EnumActions.AddedTo,
        EnumActions.CreatedIn,
        EnumActions.EmailedInto,
        EnumActions.MovedInto,
        EnumActions.MovedOutOf,
      ],
      _by: [
        EnumOptionsSubject.ByAnyone,
        EnumOptionsSubject.ByMe,
        EnumOptionsSubject.BySpecificUser,
        EnumOptionsSubject.ByAnyoneExceptMe,
        EnumOptionsSubject.ByAnyoneExceptSpecificUser
      ]
    }]
  ]
);

export const ActionsMap: Map<string, Action> = new Map(
  [
    [ActionType.ActionTheCardToPositionInSpecificList, {
      action_type: ActionType.ActionTheCardToPositionInSpecificList,
      expected_condition_key: ["action", "position", "list"],
      action: [
        EnumActions.Move,
        EnumActions.Copy,
      ],
      position: [
        EnumOptionPosition.BottomOfList,
        EnumOptionPosition.TopOfList,
      ]
    }],
    [ActionType.ActionTheCardToPosition, {
      action_type: ActionType.ActionTheCardToPosition,
      expected_condition_key: ["position"],
      position: [
        EnumOptionPosition.BottomOfList,
        EnumOptionPosition.TopOfList,
      ]
    }],
    [ActionType.ArchivalActionTheCard, {
      action_type: ActionType.ArchivalActionTheCard,
      expected_condition_key: ["action"],
      action: [
        EnumActions.Archive,
        EnumActions.Unarchive,
      ]
    }]
  ]
)