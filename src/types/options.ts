export enum EnumOptionPosition {
  BottomOfList = "bottom-of-list",
  TopOfList = "top-of-list",
}

export enum EnumOptionsNumberComparisonOperators {
  Exactly = "exactly",
  FewerThan = "fewer-than",
  MoreThan = "more-than",
  MoreOrEqual = "greater-or-equal-to",
  FewerOrEqual = "lower-or-equal-to",
}

export enum EnumOptionsSubject {
  ByAnyone = "by-anyone",
  ByMe = "by-me",
  BySpecificUser = "by-specific-user",
  ByAnyoneExceptMe = "by-anyone-except-me",
  ByAnyoneExceptSpecificUser = "by-anyone-except-specific-user",
}

export enum EnumOptionsSet {
  Cleared = "cleared",
}

export enum EnumDateStatusOperator {
  Due = "due",
  NotDue = "not-due",
  Starting = "starting",
  NotStarting = "not-starting"
}

export enum EnumTimeComparisonOperator {
  InLessThan = "in-less-than",
  InMoreThan = "in-more-than",
  In = "in",
  InBeetween = "in-between",
  LessThan = "less-than",
  MoreThan = "more-than",
  Between = "between"
}

export enum EnumTimeRangeOperator {
  Today = "today",
  Tomorrow = "tomorrow",
  ThisWeek = "this-week",
  NextWeek = "next-week",
  ThisMonth = "this-month",
  NextMonth = "next-month"
}

export enum EnumChecklistConditionOperator {
  WithAllComplete = "with-all-checklists-complete",
  WithAnIncompleteChecklists = "with-an-incomplete-checklist",
  WithCheckists = "with-checklist",
  WithoutChecklist = "without-checklists",
  WithoutChecklists = "without-checklists"
}

export enum EnumCardContentType {
  AName = "a-name",
  ADescription = "a-description",
  ANameOrDescription = "a-name-or-description"
}

export enum EnumCustomFieldAction {
  Set = "set",
  Cleared = "cleared"
}

