import { EnumActions, EnumUserActionEvent } from "./event";
import {
  EnumOptionPosition,
  EnumOptionsNumberComparisonOperators,
  EnumOptionsSubject,
} from "./options";

export interface Trigger {
  trigger_type: TriggerType;
  expected_condition_key: string[];
  [key: string]: any;
}

export interface Action {
  action_type: ActionType;
  expected_condition_key: string[];
  [key: string]: any;
}

export enum EnumSelectionType {
  OptionalFilter = "filter",
  Action = "action*",
  OptionalAction = "action",
  Position = "position*",
  OptionalPosition = "position",
  NumberComparison = "number-comparison*",
  BySubject = "by*",
  OptionalBySubject = "by",
  Board = "board*",
  OptionalBoard = "board",
  List = "list*",
  OptionalList = "list",
  Fields = "fields*",
  FieldValue = "field_value*",
  Set = "set*",
}

export enum EnumInputType {
  Number = "number",
}

export enum TriggerType {
  //  `when_a_card_<filter>_is_<action*>_the_board_<by>`,
  WhenACardActionOverBoard = `when_a_card_<${EnumSelectionType.OptionalFilter}>_is_<${EnumSelectionType.Action}>_the_board_<${EnumSelectionType.OptionalBySubject}>`,

  // "when_a_card_<filter>_is_<action*>_list_<list*>_<by>",
  WhenACardActionOverList = `when_a_card_<${EnumSelectionType.OptionalFilter}>_is_<${EnumSelectionType.Action}>_list_<${EnumSelectionType.List}>_<${EnumSelectionType.OptionalBySubject}>`,

  // "when_a_<filter>_is_<action*>" archival action
  WhenACardHasArchivalAction = `when_a_<${EnumSelectionType.OptionalFilter}>_is_<${EnumSelectionType.Action}>`,

  // "when_a_list_is_<action*>_<by>",
  WhenAListIsAction = `when_a_list_is_${EnumSelectionType.Action}_<${EnumSelectionType.OptionalBySubject}>`,

  // "when_list_<list*>_has_<number-comparison*>_[number]"
  WhenListHasCards = `when_list_<${EnumSelectionType.List}>_has_<${EnumSelectionType.NumberComparison}>_[${EnumInputType.Number}]`,

  // "when-custom-fields-<fields>-is-set-to-<field_value>-<optional_by>"
  WhenCustomFieldsIsSetToFieldValue = `when-custom-fields-<${EnumSelectionType.Fields}>-is-set-to-<${EnumSelectionType.FieldValue}>-<${EnumSelectionType.OptionalBySubject}>`,

  // "when-custom-fields-<fields>-is-<set>-<optional_by>"
  WhenCustomFieldsIsSet = `when-custom-fields-<${EnumSelectionType.Fields}>-is-<${EnumSelectionType.Set}>-<${EnumSelectionType.OptionalBySubject}>`,

  // add more..
}

export enum ActionType {
  ActionTheCardToPositionInSpecificList = `<${EnumSelectionType.Action}>_the_card_to_<${EnumSelectionType.Position}>_<${EnumSelectionType.List}>`,
  ActionTheCardToPosition = `<action>_the_card_to_<${EnumSelectionType.Position}>`,
  ArchivalActionTheCard = `<${EnumSelectionType.Action}>_the_card`,
  //add more..
}

// Triggers Map - this can be used for validation later
export const TriggersMap: Map<string, Trigger> = new Map([
  //  `when_a_card_<filter>_is_<action*>_the_board_<by>`
  [
    TriggerType.WhenACardActionOverBoard,
    {
      trigger_type: TriggerType.WhenACardActionOverBoard,
      expected_condition_key: [
        EnumSelectionType.Action,
        EnumSelectionType.OptionalBySubject,
      ],
      [EnumSelectionType.Action]: [
        EnumUserActionEvent.CardAddedTo,
        EnumUserActionEvent.CreatedIn,
        EnumUserActionEvent.CardEmailedInto,
        EnumUserActionEvent.CardMovedInto,
        EnumUserActionEvent.CardMovedOutOf,
      ],
      [EnumSelectionType.OptionalBySubject]: [
        EnumOptionsSubject.ByAnyone,
        EnumOptionsSubject.ByMe,
        EnumOptionsSubject.BySpecificUser,
        EnumOptionsSubject.ByAnyoneExceptMe,
        EnumOptionsSubject.ByAnyoneExceptSpecificUser,
      ],
    },
  ],

  // "when_a_card_<filter>_is_<action*>_list_<list*>_<by>",
  [
    TriggerType.WhenACardActionOverList,
    {
      trigger_type: TriggerType.WhenACardActionOverBoard,
      expected_condition_key: [
        EnumSelectionType.Action,
        EnumSelectionType.OptionalBySubject,
        EnumSelectionType.List,
      ],
      [EnumSelectionType.Action]: [
        EnumUserActionEvent.CardAddedTo,
        EnumUserActionEvent.CreatedIn,
        EnumUserActionEvent.CardEmailedInto,
        EnumUserActionEvent.CardMovedInto,
        EnumUserActionEvent.CardMovedOutOf,
      ],
      [EnumSelectionType.OptionalBySubject]: [
        EnumOptionsSubject.ByAnyone,
        EnumOptionsSubject.ByMe,
        EnumOptionsSubject.BySpecificUser,
        EnumOptionsSubject.ByAnyoneExceptMe,
        EnumOptionsSubject.ByAnyoneExceptSpecificUser,
      ],
    },
  ],

  // "when_a_<filter>_is_<action*>" archival action
  [
    TriggerType.WhenACardHasArchivalAction,
    {
      trigger_type: TriggerType.WhenACardHasArchivalAction,
      expected_condition_key: [EnumSelectionType.Action],
      [EnumSelectionType.Action]: [
        EnumUserActionEvent.CardArchived,
        EnumUserActionEvent.CardUnarchived,
      ],
    },
  ],

  // "when_a_list_is_<action*>_<by>",
  [
    TriggerType.WhenAListIsAction,
    {
      trigger_type: TriggerType.WhenAListIsAction,
      expected_condition_key: [
        EnumSelectionType.Action,
        EnumSelectionType.OptionalBoard,
      ],
      [EnumSelectionType.Action]: [
        EnumUserActionEvent.CreatedIn,
        EnumUserActionEvent.CardRenamed,
        EnumUserActionEvent.CardArchived,
        EnumUserActionEvent.CardUnarchived,
      ],
      [EnumSelectionType.OptionalBySubject]: [
        EnumOptionsSubject.ByAnyone,
        EnumOptionsSubject.ByMe,
        EnumOptionsSubject.BySpecificUser,
        EnumOptionsSubject.ByAnyoneExceptMe,
        EnumOptionsSubject.ByAnyoneExceptSpecificUser,
      ],
    },
  ],

  // "when_list_<list*>_has_<number-comparison*>_[number]"
  [
    TriggerType.WhenListHasCards,
    {
      trigger_type: TriggerType.WhenListHasCards,
      expected_condition_key: [
        EnumSelectionType.NumberComparison,
        EnumInputType.Number,
      ],
      [EnumSelectionType.NumberComparison]: [
        EnumOptionsNumberComparisonOperators.Exactly,
        EnumOptionsNumberComparisonOperators.MoreThan,
        EnumOptionsNumberComparisonOperators.FewerThan,
      ],
    },
  ],

  // for custom field here
  [
    TriggerType.WhenCustomFieldsIsSetToFieldValue,
    {
      trigger_type: TriggerType.WhenCustomFieldsIsSetToFieldValue,
      expected_condition_key: [
        EnumSelectionType.Fields,
        EnumSelectionType.FieldValue,
        EnumSelectionType.OptionalBySubject,
      ],
    },
  ],
]);

export const ActionsMap: Map<string, Action> = new Map([
  [
    ActionType.ActionTheCardToPositionInSpecificList,
    {
      action_type: ActionType.ActionTheCardToPositionInSpecificList,
      expected_condition_key: [
        EnumSelectionType.Action,
        EnumSelectionType.Position,
        EnumSelectionType.List,
      ],
      [EnumSelectionType.Action]: [EnumActions.MoveCard, EnumActions.CopyCard],
      [EnumSelectionType.Position]: [
        EnumOptionPosition.BottomOfList,
        EnumOptionPosition.TopOfList,
      ],
    },
  ],
  [
    ActionType.ActionTheCardToPosition,
    {
      action_type: ActionType.ActionTheCardToPosition,
      expected_condition_key: [
        EnumSelectionType.Position,
        EnumSelectionType.Action,
      ],
      [EnumSelectionType.Action]: [EnumActions.MoveCard],
      [EnumSelectionType.Position]: [
        EnumOptionPosition.BottomOfList,
        EnumOptionPosition.TopOfList,
      ],
    },
  ],
  [
    ActionType.ArchivalActionTheCard,
    {
      action_type: ActionType.ArchivalActionTheCard,
      expected_condition_key: [EnumSelectionType.Action],
      [EnumSelectionType.Action]: [
        EnumActions.ArchiveCard,
        EnumActions.UnarchiveCard,
      ],
    },
  ],
]);
