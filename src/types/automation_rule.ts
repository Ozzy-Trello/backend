import { EnumActions, EnumUserActionEvent } from "./event";
import {
  EnumOptionPosition,
  EnumOptionsNumberComparisonOperators,
  EnumOptionsSubject,
  EnumOptionsSet,
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
  Action = "action",
  OptionalAction = "optional_action",
  Position = "position",
  OptionalPosition = "optional_position",
  NumberComparison = "number_comparison",
  BySubject = "by",
  OptionalBySubject = "optional_by",
  Board = "board",
  OptionalBoard = "opational_board",
  List = "list",
  OptionalList = "optional_list",
  Channel = "channel",
  TextInput = "text_input",
  User = "user",
  Fields = "fields",
  FieldValue = "field_value",
  State = "state",
  MultiFields = "multi_fields",
  Set = "set",
  DateExpression = "date_expression",
  ChecklistScope = "checklist_scope",
  ItemScope = "item_scope",
  TextComparison = "text_comparison",
  CreateType = "create_type", // new | unique
  CreateTypeItem = "create_type_item", // regular | board | link | separator | mirror
  MultiLabels = "multi_labels",
  MultiChecklists = "multi_checklists",
  MultiUsers = "multi_users",
  MultiDates = "multi_dates",
  AddRemove = "add_remove",
  RemoveFromCard = "remove_from_card",
  TaskType = "task_type",
  SetTask = "set_task",
  CardContentType = "card_content_type",
  CardContentText = "card_content_text",
  CardLabel = "card_label",
}

export enum EnumInputType {
  Number = "number",
  Text = "text",
  TextDescription = "text_description",
  TextTitle = "text_title",
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

  // "when-custom-fields-<fields>-is-<action>-<optional_by>"
  WhenCustomFieldsIsSet = `when-custom-fields-<${EnumSelectionType.Fields}>-is-<${EnumSelectionType.Action}>-<${EnumSelectionType.OptionalBySubject}>`,

  // "when-custom-field-<fields>-is-<state>-<optional_by>"
  WhenCustomFieldIsChecked = `when-custom-field-<${EnumSelectionType.Fields}>-is-<${EnumSelectionType.State}>-<${EnumSelectionType.OptionalBySubject}>`,

  // "when-custom-field-<fields>-is-set-to-a-number-<number_comparison>-[number]-<optional_by>"
  WhenCustomFieldNumberComparison = `when-custom-field-<${EnumSelectionType.Fields}>-is-set-to-a-number-<${EnumSelectionType.NumberComparison}>-[${EnumInputType.Number}]-<${EnumSelectionType.OptionalBySubject}>`,

  // "when-custom-field-<fields>-is-set-to-a-date-<date_expression>-<optional_by>"
  WhenCustomFieldDateCondition = `when-custom-field-<${EnumSelectionType.Fields}>-is-set-to-a-date-<${EnumSelectionType.DateExpression}>-<${EnumSelectionType.OptionalBySubject}>`,

  // "when checklist [text] is <action> to a card <optional_filter> <optional_by>"
  WhenChecklistIsAction = `when-checklist-[${EnumInputType.Text}]-is-<${EnumSelectionType.Action}>-to-a-card-<${EnumSelectionType.OptionalFilter}>-<${EnumSelectionType.OptionalBySubject}>`,

  WhenChecklistCompletionChanges = `when-<${EnumSelectionType.ChecklistScope}>[${EnumInputType.Text}]-is-<${EnumSelectionType.Action}>-in-a-card-<${EnumSelectionType.OptionalFilter}>-<${EnumSelectionType.OptionalBySubject}>`,

  WhenChecklistItemStateChanges = `when-<${EnumSelectionType.ItemScope}>[${EnumInputType.Text}]-item-is-<${EnumSelectionType.Action}>-<${EnumSelectionType.OptionalFilter}>-<${EnumSelectionType.OptionalBySubject}>`,

  // "when a due date <date_expression> is <action> a checklist item <optional_by>"
  WhenChecklistItemDueDateChanges = `when-a-due-date-<${EnumSelectionType.DateExpression}>-is-<${EnumSelectionType.Action}>-a-checklist-item-<${EnumSelectionType.OptionalBySubject}>`,

  // "when an item <text_comparison> is <action> <checklist_scope> [text] <filter> <optional_by>"
  WhenChecklistItemIsAddedTo = `when-an-item-<${EnumSelectionType.TextComparison}>-is-<${EnumSelectionType.Action}>-<${EnumSelectionType.ChecklistScope}>[${EnumInputType.Text}]-<${EnumSelectionType.OptionalFilter}>-<${EnumSelectionType.OptionalBySubject}>`,

  // add more..
}

export enum ActionType {
  ActionTheCardToPositionInSpecificList = `<${EnumSelectionType.Action}>_the_card_to_<${EnumSelectionType.Position}>_<${EnumSelectionType.List}>`,
  ActionTheCardToPosition = `<action>_the_card_to_<${EnumSelectionType.Position}>`,
  ArchivalActionTheCard = `<${EnumSelectionType.Action}>_the_card`,

  // create a <CardType> <CardTypeItem> card with title <TextTitle> <TextDescription> <Position> <List> <Board> <MultiLabels> <MultiChecklists> <MultiUsers> <MultiDates>
  CreateItem = `create-a-<${EnumSelectionType.CreateType}>-card-with-title-<${EnumInputType.TextTitle}>-<${EnumInputType.TextDescription}>-<${EnumSelectionType.Position}>-<${EnumSelectionType.List}>-<${EnumSelectionType.Board}>-<${EnumSelectionType.MultiLabels}>-<${EnumSelectionType.MultiChecklists}>-<${EnumSelectionType.MultiUsers}>-<${EnumSelectionType.MultiDates}>`,

  // <AddRemove> the <CardLabel> label to the card
  AddRemoveLabel = `<${EnumSelectionType.AddRemove}>-the-<${EnumSelectionType.CardLabel}>-label-to-the-card`,

  // remove <RemoveFromCard> from the card
  RemoveFromCard = `remove-<${EnumSelectionType.RemoveFromCard}>-from-the-card`,
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

  [
    TriggerType.WhenCustomFieldNumberComparison,
    {
      trigger_type: TriggerType.WhenCustomFieldNumberComparison,
      expected_condition_key: [
        EnumSelectionType.Fields,
        EnumSelectionType.NumberComparison,
        EnumInputType.Number,
        // Optional by subject but not mandatory
      ],
      [EnumSelectionType.NumberComparison]: [
        EnumOptionsNumberComparisonOperators.MoreThan,
        EnumOptionsNumberComparisonOperators.MoreOrEqual,
        EnumOptionsNumberComparisonOperators.FewerThan,
        EnumOptionsNumberComparisonOperators.FewerOrEqual,
      ],
    },
  ],

  [
    TriggerType.WhenCustomFieldDateCondition,
    {
      trigger_type: TriggerType.WhenCustomFieldDateCondition,
      expected_condition_key: [
        EnumSelectionType.Fields,
        EnumSelectionType.DateExpression,
      ],
    },
  ],

  [
    TriggerType.WhenCustomFieldsIsSet,
    {
      trigger_type: TriggerType.WhenCustomFieldsIsSet,
      expected_condition_key: [
        EnumSelectionType.Fields,
        EnumSelectionType.Action,
        EnumSelectionType.OptionalBySubject,
      ],
      [EnumSelectionType.Action]: [
        EnumUserActionEvent.CardCustomFieldChange,
        EnumOptionsSet.Cleared,
      ],
    },
  ],

  [
    TriggerType.WhenChecklistIsAction,
    {
      trigger_type: TriggerType.WhenChecklistIsAction,
      expected_condition_key: [
        EnumInputType.Text,
        EnumSelectionType.Action,
        EnumSelectionType.OptionalBySubject,
      ],
      [EnumSelectionType.Action]: [
        EnumUserActionEvent.ChecklistAdded,
        EnumUserActionEvent.ChecklistRemoved,
      ],
    },
  ],

  [
    TriggerType.WhenChecklistCompletionChanges,
    {
      trigger_type: TriggerType.WhenChecklistCompletionChanges,
      expected_condition_key: [
        EnumSelectionType.ChecklistScope,
        EnumSelectionType.Action,
        EnumSelectionType.OptionalBySubject,
        EnumInputType.Text,
      ],
      [EnumSelectionType.ChecklistScope]: [
        "checklist",
        "a-checklist",
        "all-checklists",
      ],
      [EnumSelectionType.Action]: [
        EnumUserActionEvent.ChecklistCompleted,
        EnumUserActionEvent.ChecklistIncompleted,
      ],
    },
  ],

  [
    TriggerType.WhenChecklistItemStateChanges,
    {
      trigger_type: TriggerType.WhenChecklistItemStateChanges,
      expected_condition_key: [
        EnumSelectionType.ItemScope,
        EnumSelectionType.Action,
        EnumSelectionType.OptionalFilter,
        EnumSelectionType.OptionalBySubject,
        EnumInputType.Text,
      ],
      [EnumSelectionType.ItemScope]: ["the", "an"],
      [EnumSelectionType.Action]: [
        EnumUserActionEvent.ChecklistItemChecked,
        EnumUserActionEvent.ChecklistItemUnchecked,
      ],
    },
  ],

  [
    TriggerType.WhenChecklistItemDueDateChanges,
    {
      trigger_type: TriggerType.WhenChecklistItemDueDateChanges,
      expected_condition_key: [
        EnumSelectionType.DateExpression,
        EnumSelectionType.Action,
        EnumSelectionType.OptionalBySubject,
      ],
      [EnumSelectionType.Action]: [
        EnumUserActionEvent.ChecklistItemDueDateSet,
        EnumUserActionEvent.ChecklistItemDueDateRemoved,
      ],
    },
  ],

  [
    TriggerType.WhenChecklistItemIsAddedTo,
    {
      trigger_type: TriggerType.WhenChecklistItemIsAddedTo,
      expected_condition_key: [
        EnumSelectionType.TextComparison,
        EnumSelectionType.Action,
        EnumSelectionType.ChecklistScope,
        EnumSelectionType.OptionalFilter,
        EnumSelectionType.OptionalBySubject,
        EnumInputType.Text,
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
