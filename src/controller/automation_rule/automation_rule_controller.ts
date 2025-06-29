import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { Paginate } from "@/utils/data_utils";
import {
  AutomationRuleDetail,
} from "@/repository/automation_rule/automation_rule_interface";
import {
  AutomationRuleControllerI,
  AutomationRuleCreateData,
  AutomationRuleFilter,
} from "./automation_rule_interface";
import {
  AutomationRuleActionDetail,
} from "@/repository/automation_rule_action/automation_rule_action_interface";
import {
  CardCreateData,
  CardFilter,
  CardMoveData,
  CopyCardData,
  UpdateCardData,
} from "../card/card_interfaces";
import {
  EnumActions,
  EnumTriggeredBy,
  UserActionEvent,
  EnumUserActionEvent,
} from "@/types/event";
import {
  EnumInputType,
  EnumSelectionType,
  TriggerType,
} from "@/types/automation_rule";
import {
  EnumOptionsNumberComparisonOperators,
  EnumOptionBySubject,
  EnumOptionsSet,
  EnumOptionPosition,
} from "@/types/options";
import {
  CardCustomFieldValueUpdate,
} from "@/repository/custom_field/custom_field_interfaces";
import {
  CreateChecklistDTO,
} from "../checklist/checklist_interfaces";
import { broadcastToWebSocket } from "@/server";
import { AutomationRuleFilterDetail } from "@/repository/automation_rule_filter/automation_rule_filter_interface";
import { AutomationRuleFilterService } from "../automation/automation_filter_evaluator";
import { RepositoryContext } from "@/repository/repository_context";
import { ControllerContext } from "../controller_context";
import { ActionType } from "@/types/automation_rule";
import { CardType } from "@/types/card";

export class AutomationRuleController implements AutomationRuleControllerI {
  private repository_context: RepositoryContext;
  private controller_context: ControllerContext | null = null;

  constructor(repository_context: RepositoryContext) {
    this.repository_context = repository_context;
    // this.card_controller = card_controller;
    // this.whatsapp_controller = whatsapp_controller;
    // this.checklist_controller = checklist_controller;
    // this.card_member_controller = card_member_controller;
    this.CreateAutomationRule = this.CreateAutomationRule.bind(this);
    this.GetListAutomationRule = this.GetListAutomationRule.bind(this);
  }

  public SetControllerContext(controller_context: ControllerContext) {
    this.controller_context = controller_context;
  }

  async CreateAutomationRule(
    user_id: string,
    data: AutomationRuleCreateData
  ): Promise<ResponseData<AutomationRuleDetail>> {
    let paylodCheck = data.checkRequired();
    if (paylodCheck) {
      return new ResponseData({
        message: `you need to put '${paylodCheck}'`,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    data.created_by = user_id;
    let result = await this.repository_context.automation_rule.createRule(
      data.toAutomationRuleDetail()
    );
    if (result.status_code != StatusCodes.OK) {
      let msg = "internal server error";
      return new ResponseData({
        message: msg,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    
    // bulk create filter
    if (data?.filter) {
      let data_filter = [];
      for (let filter of data?.filter) {
        let filterData = new AutomationRuleFilterDetail({
          ...filter,
          rule_id: result?.data?.id
        });
        data_filter.push(filterData);
      }
      this.repository_context.automation_rule_filter.bulkCreateFilters(data_filter);
    }

    // bulk create actions
    let data_actions = [];
    for (let action of data?.action) {
      let actionData = new AutomationRuleActionDetail({
        ...action,
        rule_id: result?.data?.id,
      });
      data_actions.push(actionData);
    }
    this.repository_context.automation_rule_action.bulkCreateActions(data_actions);

    return new ResponseData({
      message: "AutomationRule created successfully",
      status_code: StatusCodes.CREATED,
      data: result.data,
    });
  }

  async GetListAutomationRule(
    filter: AutomationRuleFilter,
    paginate: Paginate
  ): Promise<ResponseListData<Array<AutomationRuleDetail>>> {
    let result = await this.repository_context.automation_rule.getRuleList(
      filter.toFilterAutomationRuleDetail(),
      paginate
    );

    if (result && result?.data) {
      const rule_ids = (result?.data?.map((rule) => rule.id) ?? []).filter(
        (id): id is string => id !== undefined
      );
      if (rule_ids.length > 0) {
        // getting filters
        const resultFilter = await this.repository_context.automation_rule_filter.getFilterList({rule_ids: rule_ids}, paginate);
        if (resultFilter && resultFilter.data) {
          // Map actions to their respective rules
          const filtersMap = new Map<string, AutomationRuleActionDetail[]>();
          for (const action of resultFilter.data) {
            if (!filtersMap.has(action.rule_id)) {
              filtersMap.set(action.rule_id, []);
            }
            filtersMap.get(action.rule_id)?.push(action);
          }

          // Attach actions to each rule
          for (const rule of result?.data) {
            if (rule?.id) {
              rule.action = filtersMap.get(rule?.id) || [];
            }
          }
        }

        // getting actions
        const resultAction =
          await this.repository_context.automation_rule_action.getActionList(
            {
              rule_ids: rule_ids,
            },
            new Paginate(1, paginate.limit) // fresh paginate so it doesn't overwrite
          );

        if (resultAction && resultAction.data) {
          // Map actions to their respective rules
          const actionsMap = new Map<string, AutomationRuleActionDetail[]>();
          for (const action of resultAction.data) {
            if (!actionsMap.has(action.rule_id)) {
              actionsMap.set(action.rule_id, []);
            }
            actionsMap.get(action.rule_id)?.push(action);
          }

          // Attach actions to each rule
          for (const rule of result?.data) {
            if (rule?.id) {
              rule.action = actionsMap.get(rule?.id) || [];
            }
          }
        }
      }
    }

    return new ResponseListData(
      {
        message: "automation rule action list",
        status_code: StatusCodes.OK,
        data: result.data,
      },
      result.paginate
    );
  }

  async FindMatchingRules(
    recentUserAction: UserActionEvent,
    filter: AutomationRuleFilter
  ): Promise<ResponseData<Array<AutomationRuleDetail>>> {
    try {
      console.log(
        "Finding matching automation rule for recent user action: %o",
        recentUserAction
      );

      const rules = await this.repository_context.automation_rule.matchRules(filter);

      if (rules.status_code !== StatusCodes.OK) {
        return new ResponseData({
          message: "Failed to find matching rules",
          status_code: rules.status_code,
        });
      }

      console.log("filter are: %o", filter);
      console.log("rules are: %o", rules);
      console.log(
        `[AUTOMATION DEBUG] Found ${
          rules.data?.length || 0
        } potential matching rules`
      );

      if (rules?.data) {
        // Process rules in parallel for better performance
        const processingPromises = rules.data.map(async (rule) => {
          if (rule?.id) {
            console.log("rule: is: %o", rule);
            let isPermsissable = true;

            // trigger filter
            if (rule.filter && rule.filter.length > 0) {
              for (const f of rule.filter) {
                const res = await AutomationRuleFilterService.evaluate(
                  this.repository_context,
                  f.type,
                  f.condition,
                  recentUserAction,
                  rule.created_by
                );
                console.log("Evaluate filter: res: %o", res);
                if (!res.matches) {
                  isPermsissable = false;
                  break;
                }
              }
            }

            // trigger condition
            // if (rule.condition?.[EnumSelectionType.Board]) {
            //   console.log("rule has board dependency");
            //   if (recentUserAction?.data?.board?.id !== rule.condition?.[EnumSelectionType.Board]) isPermsissable = false;
            // }

            // if (rule.condition?.[EnumSelectionType.OptionalBoard]) {
            //   console.log("rule has board dependency");
            //   if (recentUserAction?.data?.board?.id !== rule.condition?.[EnumSelectionType.OptionalBoard]) isPermsissable = false;
            // }

            // list
            if (rule.condition?.[EnumSelectionType.List]) {
              console.log("rule has list dependency");
              if (
                recentUserAction?.data?.card?.list_id !=
                rule.condition?.[EnumSelectionType.List]
              ) {
                isPermsissable = false;
              }
            } // end of lsit

            // optional by subject
            if (rule.condition?.[EnumSelectionType.OptionalBySubject]) {
              console.log(
                `rule has optional ${EnumSelectionType.OptionalBySubject} dependency`
              );

              // by me
              if (
                rule.condition?.[EnumSelectionType.OptionalBySubject]
                  ?.operator == EnumOptionBySubject.ByMe
              ) {
                if (rule.created_by !== recentUserAction?.user_id) {
                  isPermsissable = false;
                }
              }

              // by anyone, except me
              if (
                rule.condition?.[EnumSelectionType.OptionalBySubject]
                  ?.operator == EnumOptionBySubject.ByAnyoneExceptMe
              ) {
                if (rule.created_by === recentUserAction?.user_id) {
                  isPermsissable = false;
                }
              }

              if (
                typeof rule.condition?.[EnumSelectionType.OptionalBySubject] ==
                "object"
              ) {
                // by specific user - baru bisa single user
                if (
                  rule.condition?.[EnumSelectionType.OptionalBySubject]
                    ?.operator == EnumOptionBySubject.BySpecificUser
                ) {
                  if (
                    !rule.condition?.[
                      EnumSelectionType.OptionalBySubject
                    ]?.data.includes(recentUserAction?.user_id)
                  ) {
                    isPermsissable = false;
                  }
                }

                // anyone, except specific user
                if (
                  rule.condition?.[EnumSelectionType.OptionalBySubject]
                    ?.operator == EnumOptionBySubject.ByAnyoneExceptSpecificUser
                ) {
                  if (
                    rule.condition?.[
                      EnumSelectionType.OptionalBySubject
                    ]?.data.includes(recentUserAction?.user_id)
                  ) {
                    isPermsissable = false;
                  }
                }
              }
            } // end of optional by subject

            // By subject
            if (rule.condition?.[EnumSelectionType.BySubject]) {
              console.log(
                `rule has optional ${EnumSelectionType.BySubject} dependency`
              );

              // by me
              if (
                rule.condition?.[EnumSelectionType.BySubject]?.operator ==
                EnumOptionBySubject.ByMe
              ) {
                if (rule.created_by !== recentUserAction?.user_id) {
                  isPermsissable = false;
                }
              }

              // by anyone, except me
              if (
                rule.condition?.[EnumSelectionType.BySubject]?.operator ==
                EnumOptionBySubject.ByAnyoneExceptMe
              ) {
                if (rule.created_by === recentUserAction?.user_id) {
                  isPermsissable = false;
                }
              }

              if (
                typeof rule.condition?.[EnumSelectionType.BySubject] == "object"
              ) {
                // by specific user
                if (
                  rule.condition?.[EnumSelectionType.BySubject]?.operator ==
                  EnumOptionBySubject.BySpecificUser
                ) {
                  if (
                    !rule.condition?.[
                      EnumSelectionType.BySubject
                    ]?.data.includes(recentUserAction?.user_id)
                  ) {
                    isPermsissable = false;
                  }
                }

                // anyone, except specific user
                if (
                  rule.condition?.[EnumSelectionType.BySubject]?.operator ==
                  EnumOptionBySubject.ByAnyoneExceptSpecificUser
                ) {
                  if (
                    rule.condition?.[
                      EnumSelectionType.BySubject
                    ]?.data.includes(recentUserAction?.user_id)
                  ) {
                    isPermsissable = false;
                  }
                }
              }
            } // end of by subject

            // checkbox custom-field state check
            if (rule.condition?.[EnumSelectionType.State]) {
              console.log("rule has checkbox state dependency");
              const ruleFieldId = rule.condition?.[EnumSelectionType.Fields];
              const desiredState = rule.condition?.[EnumSelectionType.State];

              console.log("checkbox trigger debug: ", {
                ruleFieldId,
                desiredState,
                eventFieldId: (recentUserAction as any)?.data?.id,
                actualChecked:
                  (recentUserAction as any)?.data?.value_checkbox === true,
              });

              // verify same custom field
              if (
                ruleFieldId &&
                (recentUserAction as any)?.data?.id &&
                ruleFieldId !== (recentUserAction as any).data.id
              ) {
                isPermsissable = false;
              }

              const actualChecked =
                (recentUserAction as any)?.data?.value_checkbox === true;
              if (
                (desiredState === "checked" && !actualChecked) ||
                (desiredState === "unchecked" && actualChecked)
              ) {
                isPermsissable = false;
              }
              console.log("isPermsissable: %o", isPermsissable);
            }

            // number of cards in list
            if (rule.condition?.[EnumSelectionType.NumberComparison]) {
              console.log(
                "rule has number of cards in list dependency dependency"
              );
              // check if list match first
              if (
                recentUserAction?.data?.card?.list_id !=
                rule.condition?.[EnumSelectionType.List]
              ) {
                isPermsissable = false;
              } else {
                const result = await this.controller_context?.card.GetListCard(
                  new CardFilter({
                    list_id: rule.condition?.[EnumSelectionType.List],
                  }),
                  new Paginate(0, 0)
                );
                console.log("COMPARE RESULT: %o", result);
                if (result?.status_code !== StatusCodes.OK && !result?.data)
                  isPermsissable = false;
                const cardCount = result?.data?.length || 0;
                const numberToCompare = rule.condition?.[EnumInputType.Number];

                if (
                  rule?.condition?.[EnumSelectionType.NumberComparison] ==
                  rule.condition?.[EnumOptionsNumberComparisonOperators.Exactly]
                ) {
                  if (cardCount != numberToCompare) isPermsissable = false;
                } else if (
                  rule?.condition?.[EnumSelectionType.NumberComparison] ==
                  rule.condition?.[
                    EnumOptionsNumberComparisonOperators.FewerThan
                  ]
                ) {
                  if (cardCount >= numberToCompare) isPermsissable = false;
                } else if (
                  rule?.condition?.[EnumSelectionType.NumberComparison] ==
                  rule.condition?.[
                    EnumOptionsNumberComparisonOperators.MoreThan
                  ]
                ) {
                  if (cardCount <= numberToCompare) isPermsissable = false;
                } else if (
                  rule?.condition?.[EnumSelectionType.NumberComparison] ==
                  rule.condition?.[
                    EnumOptionsNumberComparisonOperators.MoreOrEqual
                  ]
                ) {
                  if (cardCount < numberToCompare) isPermsissable = false;
                } else if (
                  rule?.condition?.[EnumSelectionType.NumberComparison] ==
                  rule.condition?.[
                    EnumOptionsNumberComparisonOperators.FewerOrEqual
                  ]
                ) {
                  if (cardCount > numberToCompare) isPermsissable = false;
                }
              }
            } // end of number of cards in list

            // numeric custom-field comparison check
            if (
              rule.type === TriggerType.WhenCustomFieldNumberComparison &&
              rule.condition?.[EnumSelectionType.NumberComparison] &&
              rule.condition?.[EnumSelectionType.Fields]
            ) {
              console.log(
                "rule has numeric custom-field comparison dependency"
              );

              const ruleFieldId = rule.condition?.[EnumSelectionType.Fields];
              const operator =
                rule.condition?.[EnumSelectionType.NumberComparison];
              const compareValueRaw = rule.condition?.[EnumInputType.Number];
              const compareValue = Number(compareValueRaw);
              const additionalComparison = (rule.condition as any)
                ?.additionalComparison;

              const eventFieldId = (recentUserAction as any)?.data?.id;
              const actualNumber = Number(
                (recentUserAction as any)?.data?.value_number
              );

              console.log("numeric trigger debug: ", {
                ruleFieldId,
                operator,
                compareValue,
                additionalComparison,
                eventFieldId,
                actualNumber,
              });

              // verify same custom field
              if (ruleFieldId && eventFieldId && ruleFieldId !== eventFieldId) {
                isPermsissable = false;
              }

              const evaluate = (
                num: number,
                op: EnumOptionsNumberComparisonOperators,
                target: number
              ): boolean => {
                switch (op) {
                  case EnumOptionsNumberComparisonOperators.MoreThan:
                    return num > target;
                  case EnumOptionsNumberComparisonOperators.MoreOrEqual:
                    return num >= target;
                  case EnumOptionsNumberComparisonOperators.FewerThan:
                    return num < target;
                  case EnumOptionsNumberComparisonOperators.FewerOrEqual:
                    return num <= target;
                  case EnumOptionsNumberComparisonOperators.Exactly:
                  default:
                    return num === target;
                }
              };

              // main comparison
              if (!evaluate(actualNumber, operator, compareValue)) {
                isPermsissable = false;
              }

              // additional comparison if provided
              if (
                additionalComparison &&
                additionalComparison.operator &&
                additionalComparison.value !== undefined &&
                additionalComparison.value !== ""
              ) {
                const addValue = Number(additionalComparison.value);
                const addOperator =
                  additionalComparison.operator as EnumOptionsNumberComparisonOperators;
                if (!evaluate(actualNumber, addOperator, addValue)) {
                  isPermsissable = false;
                }
              }

              console.log(
                "isPermsissable after numeric check: %o",
                isPermsissable
              );
            }

            // date custom-field condition check
            if (
              rule.type === TriggerType.WhenCustomFieldDateCondition &&
              rule.condition?.[EnumSelectionType.DateExpression]
            ) {
              console.log("rule has date custom-field condition dependency");

              const ruleFieldId = rule.condition?.[EnumSelectionType.Fields];
              const expressions =
                rule.condition?.[EnumSelectionType.DateExpression] || [];

              const eventFieldId = (recentUserAction as any)?.data?.id;
              const actualDateRaw = (recentUserAction as any)?.data?.value_date;
              const actualDate = actualDateRaw ? new Date(actualDateRaw) : null;

              console.log("date trigger debug: ", {
                ruleFieldId,
                expressions,
                eventFieldId,
                actualDateRaw,
                actualDate,
              });
              if (!actualDate) {
                isPermsissable = false;
              }

              // verify same custom field
              if (ruleFieldId && eventFieldId && ruleFieldId !== eventFieldId) {
                isPermsissable = false;
              }

              if (isPermsissable && actualDate) {
                let matched = false;
                for (const expr of expressions) {
                  if (this.evaluateDateExpression(actualDate, expr.meta)) {
                    matched = true;
                    break;
                  }
                }
                if (!matched) isPermsissable = false;
              }

              console.log(
                "isPermsissable after date expression check: %o",
                isPermsissable
              );
            }

            // specific field value equality check
            if (
              rule.type === TriggerType.WhenCustomFieldsIsSetToFieldValue &&
              rule.condition?.[EnumSelectionType.FieldValue] !== undefined
            ) {
              console.log("rule has specific field-value dependency");

              const ruleFieldId = rule.condition?.[EnumSelectionType.Fields];
              const desiredValue =
                rule.condition?.[EnumSelectionType.FieldValue];

              const eventFieldId = (recentUserAction as any)?.data?.id;
              const raw = (recentUserAction as any)?.data;

              // determine actual value from event data (first non-null among possible value_* fields)
              let actualValue: any = null;
              const valueKeys = [
                "value_string",
                "value_number",
                "value_option",
                "value_user_id",
                "value_checkbox",
                "value_date",
              ];
              for (const k of valueKeys) {
                if (raw?.[k] !== undefined && raw?.[k] !== null) {
                  actualValue = raw[k];
                  break;
                }
              }

              console.log("field value trigger debug", {
                ruleFieldId,
                desiredValue,
                eventFieldId,
                actualValue,
              });

              if (ruleFieldId && eventFieldId && ruleFieldId !== eventFieldId) {
                isPermsissable = false;
              }

              if (actualValue == null) {
                isPermsissable = false;
              } else {
                // loosely compare as strings for simplicity
                if (String(actualValue) !== String(desiredValue)) {
                  isPermsissable = false;
                }
              }

              console.log(
                "isPermsissable after field-value check: %o",
                isPermsissable
              );
            }

            // custom field set/cleared check
            if (
              rule.type === TriggerType.WhenCustomFieldsIsSet &&
              rule.condition?.[EnumSelectionType.Action]
            ) {
              console.log("rule has set/cleared custom-field dependency");

              const ruleFieldId = rule.condition?.[EnumSelectionType.Fields];
              const desiredAction = rule.condition?.[EnumSelectionType.Action];

              const eventFieldId = (recentUserAction as any)?.data?.id;
              const raw = (recentUserAction as any)?.data;

              // verify same custom field
              if (ruleFieldId && eventFieldId && ruleFieldId !== eventFieldId) {
                isPermsissable = false;
              }

              if (isPermsissable) {
                // evaluate cleared vs set
                const valueKeys = [
                  "value_string",
                  "value_number",
                  "value_option",
                  "value_user_id",
                  "value_checkbox",
                  "value_date",
                ];

                const anyValuePresent = valueKeys.some(
                  (k) => raw?.[k] !== undefined && raw?.[k] !== null
                );

                if (desiredAction === EnumOptionsSet.Cleared) {
                  // expect NO value present
                  if (anyValuePresent) {
                    isPermsissable = false;
                  }
                } else {
                  // desiredAction is regular change (set)
                  // we don't need to check value content; but ensure some value present
                  if (!anyValuePresent) {
                    isPermsissable = false;
                  }
                }
              }

              console.log(
                "isPermsissable after set/cleared check: %o",
                isPermsissable
              );
            }

            // checklist added check
            if (
              rule.type === TriggerType.WhenChecklistIsAction &&
              rule.condition?.[EnumInputType.Text]
            ) {
              console.log("rule has checklist added dependency");

              const ruleChecklistName = rule.condition?.[EnumInputType.Text];
              const desiredAction = rule.condition?.[EnumSelectionType.Action];

              if (desiredAction !== recentUserAction.type) {
                isPermsissable = false;
              }

              const eventChecklist = (recentUserAction as any)?.data?.checklist;
              const actualName = eventChecklist?.title || eventChecklist?.name;

              console.log("eventChecklist tirgger debug: ", {
                ruleChecklistName,
                actualName,
                eventChecklist,
                desiredAction,
              });

              if (
                !actualName ||
                actualName.toLowerCase() !== ruleChecklistName.toLowerCase()
              ) {
                isPermsissable = false;
              }

              console.log(
                "isPermsissable after checklist check: %o",
                isPermsissable
              );
            }

            // checklist completion changes
            if (
              rule.type === TriggerType.WhenChecklistCompletionChanges &&
              rule.condition?.[EnumSelectionType.ChecklistScope]
            ) {
              const scope = rule.condition?.[EnumSelectionType.ChecklistScope];
              const desiredAction = rule.condition?.[EnumSelectionType.Action];

              if (desiredAction !== recentUserAction.type) {
                isPermsissable = false;
              }

              const eventChecklist = (recentUserAction as any)?.data?.checklist;
              const checklistNameRule = rule.condition?.[EnumInputType.Text];

              if (scope === "checklist") {
                if (!checklistNameRule || !eventChecklist?.title) {
                  isPermsissable = false;
                } else if (
                  eventChecklist.title.toLowerCase().trim() !==
                  checklistNameRule.toLowerCase().trim()
                ) {
                  isPermsissable = false;
                }
              } else if (scope === "all-checklists") {
                const allCompletedFlag = (recentUserAction as any)?.data
                  ?.all_completed;
                if (
                  desiredAction === EnumUserActionEvent.ChecklistCompleted &&
                  !allCompletedFlag
                ) {
                  isPermsissable = false;
                }
                if (
                  desiredAction === EnumUserActionEvent.ChecklistIncompleted &&
                  allCompletedFlag
                ) {
                  isPermsissable = false;
                }
              }

              console.log(
                "isPermsissable after checklist completion check: %o",
                isPermsissable
              );
            }

            // checklist item state changes
            if (
              rule.type === TriggerType.WhenChecklistItemStateChanges &&
              rule.condition?.[EnumSelectionType.ItemScope]
            ) {
              const scope = rule.condition?.[EnumSelectionType.ItemScope];
              const desiredAction = rule.condition?.[EnumSelectionType.Action];

              // Check action matches event type
              if (desiredAction !== recentUserAction.type) {
                isPermsissable = false;
              }

              const eventItem = (recentUserAction as any)?.data?.item;
              const itemNameRule = rule.condition?.[EnumInputType.Text];
              const eventChecklist = (recentUserAction as any)?.data?.checklist;
              const checklistNameFilter = (rule.condition as any)
                ?.checklist_name;

              if (scope === "the") {
                // Must match specific item name
                if (!itemNameRule || !eventItem?.label) {
                  isPermsissable = false;
                } else if (
                  eventItem.label.toLowerCase().trim() !==
                  itemNameRule.toLowerCase().trim()
                ) {
                  isPermsissable = false;
                }
              }
              // scope === "an" means any item passes (no additional checks needed)
              console.log("debug: ", {
                scope,
                desiredAction,
                eventItem,
                itemNameRule,
                eventChecklist,
                checklistNameFilter,
              });

              // Check checklist name filter if specified
              if (checklistNameFilter && eventChecklist?.title) {
                if (
                  eventChecklist.title.toLowerCase().trim() !==
                  checklistNameFilter.toLowerCase().trim()
                ) {
                  isPermsissable = false;
                }
              }

              console.log(
                "isPermsissable after checklist item check: %o",
                isPermsissable
              );
            }

            // checklist item due date changes
            if (
              rule.type?.includes("due-date") &&
              rule.condition?.[EnumSelectionType.DateExpression]
            ) {
              const desiredAction = rule.condition?.[EnumSelectionType.Action];
              if (desiredAction !== recentUserAction.type) {
                isPermsissable = false;
              }

              const expressions =
                rule.condition?.[EnumSelectionType.DateExpression] || [];
              const eventItem = (recentUserAction as any)?.data?.item;
              const eventDue = eventItem?.due_date
                ? new Date(eventItem.due_date)
                : null;

              let anyPassFlag = false;
              if (!eventDue) {
                isPermsissable = false;
              } else {
                anyPassFlag = expressions.some((expr: any) =>
                  this.evaluateDateExpression(eventDue, expr?.meta)
                );
                if (!anyPassFlag) isPermsissable = false;
              }

              console.log("DueDate debug: ", {
                desiredAction,
                recentEventType: recentUserAction.type,
                expressions,
                eventDue,
                anyPassFlag,
              });
              console.log(
                "isPermsissable after checklist item due date check: %o",
                isPermsissable
              );
            }

            // checklist item added/removed check
            if (
              rule.type === TriggerType.WhenChecklistItemIsAddedTo &&
              rule.condition?.[EnumSelectionType.Action]
            ) {
              const desiredAction = rule.condition?.[EnumSelectionType.Action];
              if (desiredAction !== recentUserAction.type) {
                isPermsissable = false;
              }

              const scopeVal =
                rule.condition?.[EnumSelectionType.ChecklistScope];

              const checklistNameRule = rule.condition?.[EnumInputType.Text];

              const eventChecklist = (recentUserAction as any)?.data?.checklist;
              if (
                scopeVal &&
                typeof scopeVal === "object" &&
                "value" in scopeVal
              ) {
                // unwrap
              }
              const scope =
                typeof scopeVal === "object" && "value" in scopeVal
                  ? (scopeVal as any).value
                  : scopeVal;

              // checklist name check if scope=="checklist"
              if (scope === "checklist") {
                if (!checklistNameRule || !eventChecklist?.title) {
                  isPermsissable = false;
                } else if (
                  eventChecklist.title.toLowerCase().trim() !==
                  (checklistNameRule as string).toLowerCase().trim()
                ) {
                  isPermsissable = false;
                }
              }

              // Text comparison on item label
              const textExprs =
                rule.condition?.[EnumSelectionType.TextComparison] || [];
              const itemLabel =
                (recentUserAction as any)?.data?.item?.label || "";

              if (textExprs.length) {
                const pass = (textExprs as any[]).some((expr) => {
                  const op = expr.operator;
                  const compareText = (expr.text || "").toString();
                  const lowerLabel = itemLabel.toLowerCase();
                  const lowerCompare = compareText.toLowerCase();
                  switch (op) {
                    case "starting-with":
                      return lowerLabel.startsWith(lowerCompare);
                    case "ending-with":
                      return lowerLabel.endsWith(lowerCompare);
                    case "containing":
                      return lowerLabel.includes(lowerCompare);
                    case "not-starting-with":
                      return !lowerLabel.startsWith(lowerCompare);
                    case "not-ending-with":
                      return !lowerLabel.endsWith(lowerCompare);
                    case "not-containing":
                      return !lowerLabel.includes(lowerCompare);
                    default:
                      return false;
                  }
                });
                if (!pass) isPermsissable = false;
              }

              console.log("Checklist item added/removed debug", {
                desiredAction,
                recentType: recentUserAction.type,
                scope,
                checklistNameRule,
                itemLabel,
                isPermsissable,
              });
            }

            if (isPermsissable) {
              console.log(
                `[AUTOMATION DEBUG] Rule ${rule.id} passed permissible check and will execute actions`
              );
              return this.ProcessAutomationAction(
                recentUserAction,
                new AutomationRuleFilter({
                  id: rule.id,
                  group_type: rule?.group_type,
                  type: rule.type,
                  workspace_id: rule.workspace_id,
                  condition: rule.condition,
                  action: rule.action,
                })
              );
            }
            console.log(`rule is not permissable`);
            return `rule is not permissable`;
          }
          return Promise.resolve();
        });

        // Wait for all processing to complete, but don't let failures block the response
        await Promise.allSettled(processingPromises);
      }

      return new ResponseData({
        message: "Matching rules found",
        status_code: StatusCodes.OK,
        data: rules.data,
      });
    } catch (error) {
      console.error("Error in FindMatchingRules:", error);
      return new ResponseData({
        message: "Internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async ProcessAutomationAction(
    recentUserAction: UserActionEvent,
    filter: AutomationRuleFilter
  ): Promise<ResponseData<any>> {
    try {
      if (!filter?.id) {
        return new ResponseData({
          message: "Automation rule is invalid",
          status_code: StatusCodes.BAD_REQUEST,
        });
      }

      if (filter.action) {
        // Process actions in parallel
        const actionPromises = filter.action.map((act) =>
          this.executeAutomationAction(act, recentUserAction)
        );

        await Promise.allSettled(actionPromises);
      }

      return new ResponseData({
        message: "Processing automation actions",
        status_code: StatusCodes.OK,
        data: null,
      });
    } catch (error) {
      console.error("Error in ProcessAutomationAction:", error);
      return new ResponseData({
        message: "Failed to process automation actions",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  /**
   * Action mapper
   * @param action
   * @param recentUserAction
   */
  private async executeAutomationAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    try {
      switch (action.type) {
        case ActionType.CreateItem:
          await this.handleCreateItemAction(action, recentUserAction);
          break;

        default:
          break;
      }

      switch (action?.condition?.action) {
        case EnumActions.MoveCard:
          console.log("executeAutomationAction: move.card");
          await this.handleMoveAction(action, recentUserAction);
          break;
        case EnumActions.Notify:
          console.log("executeAutomationAction: notify");
          await this.handleNotifyAction(action, recentUserAction);
          break;
        case EnumActions.ArchiveCard:
          console.log(`executeAutomationAction: ${EnumActions.ArchiveCard}`);
          await this.handleArchiveCardAction(action, recentUserAction);
          break;
        case EnumActions.UnarchiveCard:
          console.log(`executeAutomationAction: ${EnumActions.UnarchiveCard}`);
          await this.handleUnarchiveCardAction(action, recentUserAction);
          break;
        case EnumActions.CopyCard:
          console.log(`executeAutomationAction: ${EnumActions.CopyCard}`);
          await this.handleCopyCardAction(action, recentUserAction);
          break;
        case EnumActions.ClearCustomField:
          console.log(
            `executeAutomationAction: ${EnumActions.ClearCustomField}`
          );
          await this.handleClearCustomFieldAction(action, recentUserAction);
          break;
        case EnumActions.SetCustomField:
          console.log(`executeAutomationAction: ${EnumActions.SetCustomField}`);
          await this.handleSetCustomFieldAction(action, recentUserAction);
          break;
        case EnumActions.CheckCustomField:
          console.log(
            `executeAutomationAction: ${EnumActions.CheckCustomField}`
          );
          await this.handleToggleCheckboxFieldAction(
            action,
            recentUserAction,
            true
          );
          break;
        case EnumActions.UncheckCustomField:
          console.log(
            `executeAutomationAction: ${EnumActions.UncheckCustomField}`
          );
          await this.handleToggleCheckboxFieldAction(
            action,
            recentUserAction,
            false
          );
          break;
        case EnumActions.IncreaseNumberCustomField:
          console.log(
            `executeAutomationAction: ${EnumActions.IncreaseNumberCustomField}`
          );
          await this.handleIncrementNumberFieldAction(
            action,
            recentUserAction,
            true
          );
          break;
        case EnumActions.DecreaseNumberCustomField:
          console.log(
            `executeAutomationAction: ${EnumActions.DecreaseNumberCustomField}`
          );
          await this.handleIncrementNumberFieldAction(
            action,
            recentUserAction,
            false
          );
          break;
        case EnumActions.MoveDateCustomField:
          console.log(
            `executeAutomationAction: ${EnumActions.MoveDateCustomField}`
          );
          await this.handleMoveDateCustomFieldAction(action, recentUserAction);
          break;
        case EnumActions.SetDateCustomField:
          console.log(
            `executeAutomationAction: ${EnumActions.SetDateCustomField}`
          );
          await this.handleSetDateCustomFieldAction(action, recentUserAction);
          break;
        case EnumActions.RenameCard:
          console.log(`executeAutomationAction: ${EnumActions.RenameCard}`);
          await this.handleRenameCardAction(action, recentUserAction);
          break;
        case EnumActions.SetCardDescription:
          console.log(
            `executeAutomationAction: ${EnumActions.SetCardDescription}`
          );
          await this.handleSetCardDescriptionAction(action, recentUserAction);
          break;
        case EnumActions.AddChecklist:
          console.log(`executeAutomationAction: ${EnumActions.AddChecklist}`);
          await this.handleAddChecklistAction(action, recentUserAction);
          break;
        case EnumActions.AddChecklistItem:
          console.log(
            `executeAutomationAction: ${EnumActions.AddChecklistItem}`
          );
          await this.handleAddChecklistItemAction(action, recentUserAction);
          break;
        case EnumActions.RemoveChecklistItem:
          console.log(
            `executeAutomationAction: ${EnumActions.RemoveChecklistItem}`
          );
          await this.handleRemoveChecklistItemAction(action, recentUserAction);
          break;
        case EnumActions.MoveChecklistItemDueDate:
          console.log(
            `executeAutomationAction: ${EnumActions.MoveChecklistItemDueDate}`
          );
          await this.handleMoveChecklistItemDueDateAction(
            action,
            recentUserAction
          );
          break;
        case EnumActions.SetChecklistItemDueDate:
          console.log(
            `executeAutomationAction: ${EnumActions.SetChecklistItemDueDate}`
          );
          await this.handleSetChecklistItemDueDateAction(
            action,
            recentUserAction
          );
          break;
        case EnumActions.CheckChecklistItem:
          console.log(
            `executeAutomationAction: ${EnumActions.CheckChecklistItem}`
          );
          await this.handleToggleChecklistItemChecked(
            action,
            recentUserAction,
            true
          );
          break;
        case EnumActions.UncheckChecklistItem:
          console.log(
            `executeAutomationAction: ${EnumActions.UncheckChecklistItem}`
          );
          await this.handleToggleChecklistItemChecked(
            action,
            recentUserAction,
            false
          );
          break;
        case EnumActions.AddCardMember:
          console.log(`executeAutomationAction: ${EnumActions.AddCardMember}`);
          await this.handleAddCardMemberAction(action, recentUserAction);
          break;
        case EnumActions.RemoveCardMember:
          console.log(
            `executeAutomationAction: ${EnumActions.RemoveCardMember}`
          );
          await this.handleRemoveCardMemberAction(action, recentUserAction);
          break;
        default:
          console.warn(
            `Unknown automation action: ${action?.condition?.action}`
          );
          break;
      }
    } catch (error) {
      console.error(
        `Error executing automation action ${action?.condition?.action}:`,
        error
      );
      // Don't throw - other actions should continue processing
    }
  }

  /**
   * actual handlers of each actions type
   */
  private async handleNotifyAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    if (!action?.condition?.channel || !recentUserAction?.data.card?.id) return;

    switch (action?.condition?.channel) {
      case "whatsapp":
        await this.controller_context?.whatsapp.sendNotification(
          // This is for handling if the user is selecte through field change in the trigger instead of selecting it in action
          action.type.includes("selected_user")
            ? recentUserAction.data.value_user_id
            : action.condition.user,
          action.condition.text_input,
          recentUserAction.data,
          action.condition.multi_fields ? action.condition.multi_fields : [],
          action.condition.fields ? action.condition.fields : null
        );
        break;
      default:
        console.warn(`Unknown channel: ${action?.condition?.channel}`);
    }
  }

  private async handleMoveAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    console.log("handleMoveAction...");
    const moveData = new CardMoveData({
      id: recentUserAction?.data?.card?.id,
      previous_list_id: recentUserAction?.data?._previous_data?.card?.id,
      target_list_id:
        action.condition?.[EnumSelectionType.List] ||
        action.condition?.[EnumSelectionType.OptionalList],
      previous_position: recentUserAction?.data?.card?.order,
      target_position_top_or_bottom:
        action.condition?.[EnumSelectionType.Position],
    });

    await this.controller_context?.card.MoveCard(
      recentUserAction?.user_id,
      moveData,
      EnumTriggeredBy.OzzyAutomation
    );
  }

  private async handleArchiveCardAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    await this.controller_context?.card.ArchiveCard(
      recentUserAction?.data?.value_user_id || "",
      recentUserAction?.data?.card?.id || "",
      EnumTriggeredBy.OzzyAutomation
    );
  }

  private async handleUnarchiveCardAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    await this.controller_context?.card.UnArchiveCard(
      recentUserAction?.data?.value_user_id || "",
      recentUserAction?.data?.card?.id || "",
      EnumTriggeredBy.OzzyAutomation
    );
  }

  private async handleCopyCardAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    await this.controller_context?.card.CopyCard(
      recentUserAction?.user_id || "",
      new CopyCardData({
        card_id: recentUserAction?.data?.card?.id,
        name: recentUserAction?.data?.card?.name,
        target_list_id:
          action?.condition?.[EnumSelectionType.List] ||
          action?.condition?.[EnumSelectionType.OptionalList],
        position:
          action?.condition?.[EnumSelectionType.Position] ||
          action?.condition?.[EnumSelectionType.OptionalPosition],
        is_with_attachments: true,
        is_with_checklist: true,
        is_with_labels: true,
        is_with_comments: true,
        is_with_members: true,
        is_wtih_custom_fields: true,
      }),
      EnumTriggeredBy.OzzyAutomation
    );
  }

  private async handleClearCustomFieldAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;
    let customFieldId: any = action.condition?.[EnumSelectionType.Fields];
    if (
      customFieldId &&
      typeof customFieldId === "object" &&
      "value" in customFieldId
    ) {
      customFieldId = customFieldId.value;
    }

    if (!cardId || !customFieldId) {
      console.warn("Missing card ID or custom field ID for clear action");
      return;
    }

    try {
      console.log("Clearing custom field:", {
        cardId,
        customFieldId,
      });

      // Clear all custom field values by using the clearAllFields method
      const clearData = new CardCustomFieldValueUpdate({});
      clearData.clearAllFields();

      const updateResult = await this.repository_context.custom_field.updateCardCustomField(
        customFieldId,
        cardId,
        clearData
      );

      if (updateResult.status_code === StatusCodes.NO_CONTENT) {
        // Get the updated custom field data for WebSocket broadcast
        const updatedField = await this.repository_context.custom_field.getCardCustomField(
          "", // workspace_id will be filled from the field data
          cardId,
          customFieldId
        );

        if (updatedField.status_code === 200 && updatedField.data) {
          // Broadcast WebSocket event for custom field clear
          broadcastToWebSocket("custom_field:updated", {
            customField: updatedField.data,
            cardId: cardId,
            workspaceId: updatedField.data.workspace_id,
          });
        }

        console.log("Custom field cleared successfully");
      } else {
        console.warn("Failed to clear custom field:", updateResult.message);
      }
    } catch (error) {
      console.error("Error clearing custom field:", error);
    }
  }

  private async handleSetCustomFieldAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;
    let customFieldId: any = action.condition?.[EnumSelectionType.Fields];
    const fieldValueRaw = action.condition?.["field_value"];

    // Unwrap if object
    if (
      customFieldId &&
      typeof customFieldId === "object" &&
      "value" in customFieldId
    ) {
      customFieldId = customFieldId.value;
    }

    const fieldValue = (() => {
      if (
        fieldValueRaw &&
        typeof fieldValueRaw === "object" &&
        "value" in fieldValueRaw
      ) {
        return fieldValueRaw;
      }
      return fieldValueRaw;
    })();

    if (!cardId || !customFieldId || fieldValue === undefined) {
      console.warn(
        "Missing card ID, custom field ID, or field value for set action"
      );
      return;
    }

    try {
      console.log("Setting custom field:", {
        cardId,
        customFieldId,
        fieldValue,
      });

      // Create update data with the specific field value
      const updateData = new CardCustomFieldValueUpdate({});

      // Set the appropriate field based on the value type
      if (typeof fieldValue === "string") {
        updateData.value_string = fieldValue;
      } else if (typeof fieldValue === "number") {
        updateData.value_number = fieldValue;
      } else if (typeof fieldValue === "boolean") {
        updateData.value_checkbox = fieldValue;
      } else if (fieldValue instanceof Date) {
        updateData.value_date = fieldValue;
      } else {
        // For option values or user IDs, treat as string
        if (fieldValue && typeof fieldValue === "object" && fieldValue.value) {
          // Handle dropdown option objects
          updateData.value_option = fieldValue.value;
        } else {
          // Handle user IDs or other string values
          updateData.value_user_id = fieldValue;
        }
      }

      const updateResult = await this.repository_context.custom_field.updateCardCustomField(
        customFieldId,
        cardId,
        updateData
      );

      if (updateResult.status_code === StatusCodes.NO_CONTENT) {
        // Get the updated custom field data for WebSocket broadcast
        const updatedField = await this.repository_context.custom_field.getCardCustomField(
          "", // workspace_id will be filled from the field data
          cardId,
          customFieldId
        );

        if (updatedField.status_code === 200 && updatedField.data) {
          // Broadcast WebSocket event for custom field update
          broadcastToWebSocket("custom_field:updated", {
            customField: updatedField.data,
            cardId,
            workspaceId: updatedField.data.workspace_id,
          });
        }

        console.log("Custom field set successfully");
      } else if (updateResult.status_code === StatusCodes.NOT_FOUND) {
        // No existing record – create it
        const createRes = await this.repository_context.custom_field.createCardCustomField(
          customFieldId,
          cardId,
          updateData
        );
        if (createRes.status_code === StatusCodes.CREATED) {
          const newField = await this.repository_context.custom_field.getCardCustomField(
            "",
            cardId,
            customFieldId
          );
          if (newField.status_code === 200 && newField.data) {
            broadcastToWebSocket("custom_field:updated", {
              customField: newField.data,
              cardId,
              workspaceId: newField.data.workspace_id,
            });
          }
        } else {
          console.warn("Failed to create card custom field", createRes.message);
        }
      } else {
        console.warn("Failed to set custom field:", updateResult.message);
      }
    } catch (error) {
      console.error("Error setting custom field:", error);
    }
  }

  private async handleToggleCheckboxFieldAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent,
    checked: boolean
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;
    let customFieldId: any = action.condition?.[EnumSelectionType.Fields];
    if (
      customFieldId &&
      typeof customFieldId === "object" &&
      "value" in customFieldId
    ) {
      customFieldId = customFieldId.value;
    }

    if (!cardId || !customFieldId) {
      console.warn("Missing card ID or custom field ID for toggle action");
      return;
    }

    try {
      console.log("Toggling custom field:", {
        cardId,
        customFieldId,
        checked,
      });

      // Create update data with the specific field value
      const updateData = new CardCustomFieldValueUpdate({});

      // Always set checkbox value
      updateData.value_checkbox = checked;

      const updateResult = await this.repository_context.custom_field.updateCardCustomField(
        customFieldId,
        cardId,
        updateData
      );

      if (updateResult.status_code === StatusCodes.NO_CONTENT) {
        // Get the updated custom field data for WebSocket broadcast
        const updatedField = await this.repository_context.custom_field.getCardCustomField(
          "", // workspace_id will be filled from the field data
          cardId,
          customFieldId
        );

        if (updatedField.status_code === 200 && updatedField.data) {
          // Broadcast WebSocket event for custom field update
          broadcastToWebSocket("custom_field:updated", {
            customField: updatedField.data,
            cardId,
            workspaceId: updatedField.data.workspace_id,
          });
        }

        console.log("Custom field toggled successfully");
      } else if (updateResult.status_code === StatusCodes.NOT_FOUND) {
        const createRes = await this.repository_context.custom_field.createCardCustomField(
          customFieldId,
          cardId,
          updateData
        );
        if (createRes.status_code === StatusCodes.CREATED) {
          const newField = await this.repository_context.custom_field.getCardCustomField(
            "",
            cardId,
            customFieldId
          );
          if (newField.status_code === 200 && newField.data) {
            broadcastToWebSocket("custom_field:updated", {
              customField: newField.data,
              cardId,
              workspaceId: newField.data.workspace_id,
            });
          }
        }
      } else {
        console.warn("Failed to toggle custom field:", updateResult.message);
      }
    } catch (error) {
      console.error("Error toggling custom field:", error);
    }
  }

  private async handleIncrementNumberFieldAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent,
    isIncrease: boolean
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;
    let customFieldId: any = action.condition?.[EnumSelectionType.Fields];
    if (
      customFieldId &&
      typeof customFieldId === "object" &&
      "value" in customFieldId
    ) {
      customFieldId = customFieldId.value;
    }

    const deltaRaw = action.condition?.[EnumInputType.Number] ?? "1";
    const delta = Number(deltaRaw);

    if (!cardId || !customFieldId || isNaN(delta)) {
      console.warn(
        "Missing card, field, or invalid delta for increment action"
      );
      return;
    }

    const signedDelta = isIncrease ? delta : -delta;

    try {
      // Fetch current value
      const currentResp = await this.repository_context.custom_field.getCardCustomField(
        "",
        cardId,
        customFieldId
      );
      let currentNumber = 0;
      if (
        currentResp.status_code === StatusCodes.OK &&
        currentResp.data &&
        currentResp.data.value_number !== null &&
        currentResp.data.value_number !== undefined
      ) {
        currentNumber = Number(currentResp.data.value_number) || 0;
      }

      const newValue = currentNumber + signedDelta;

      const updateData = new CardCustomFieldValueUpdate({
        value_number: newValue,
      });

      const updateResult = await this.repository_context.custom_field.updateCardCustomField(
        customFieldId,
        cardId,
        updateData
      );

      if (updateResult.status_code === StatusCodes.NO_CONTENT) {
        const updatedField = await this.repository_context.custom_field.getCardCustomField(
          "",
          cardId,
          customFieldId
        );
        if (updatedField.status_code === StatusCodes.OK && updatedField.data) {
          broadcastToWebSocket("custom_field:updated", {
            customField: updatedField.data,
            cardId,
            workspaceId: updatedField.data.workspace_id,
          });
        }
      } else if (updateResult.status_code === StatusCodes.NOT_FOUND) {
        // create record
        const createRes = await this.repository_context.custom_field.createCardCustomField(
          customFieldId,
          cardId,
          updateData
        );
        if (createRes.status_code === StatusCodes.CREATED) {
          const newField = await this.repository_context.custom_field.getCardCustomField(
            "",
            cardId,
            customFieldId
          );
          if (newField.status_code === StatusCodes.OK && newField.data) {
            broadcastToWebSocket("custom_field:updated", {
              customField: newField.data,
              cardId,
              workspaceId: newField.data.workspace_id,
            });
          }
        }
      } else {
        console.warn("Failed to update number field", updateResult.message);
      }
    } catch (e) {
      console.error("Error incrementing number field", e);
    }
  }

  private async handleMoveDateCustomFieldAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;
    let customFieldId: any = action.condition?.[EnumSelectionType.Fields];
    if (
      customFieldId &&
      typeof customFieldId === "object" &&
      "value" in customFieldId
    ) {
      customFieldId = customFieldId.value;
    }

    const rawDateVal: any = action.condition?.["date_value"];
    let expr: any = null;
    if (
      rawDateVal &&
      typeof rawDateVal === "object" &&
      Array.isArray(rawDateVal.expressions)
    ) {
      expr = rawDateVal.expressions[0] || null;
    } else if (rawDateVal) {
      expr = { value: rawDateVal, text: String(rawDateVal) };
    }

    if (!cardId || !customFieldId || !expr) {
      console.warn("Missing data for move date action");
      return;
    }

    try {
      const baseDate = new Date();
      const newDate = this.computeMovedDate(baseDate, expr.value);
      if (!newDate) {
        console.warn("Unable to compute new date for expression", expr);
        return;
      }

      const updateData = new CardCustomFieldValueUpdate({
        value_date: newDate,
      });
      const updateRes = await this.repository_context.custom_field.updateCardCustomField(
        customFieldId,
        cardId,
        updateData
      );
      console.log("MoveDateCustomField update result:", updateRes.status_code);

      if (updateRes.status_code === StatusCodes.NO_CONTENT) {
        console.log(
          "Update successful, fetching updated field for WebSocket broadcast..."
        );
        const updatedField = await this.repository_context.custom_field.getCardCustomField(
          "",
          cardId,
          customFieldId
        );
        console.log(
          "Updated field fetch result:",
          updatedField.status_code,
          updatedField.data ? "has data" : "no data"
        );

        if (updatedField.status_code === StatusCodes.OK && updatedField.data) {
          console.log("Broadcasting WebSocket event for date field update");
          broadcastToWebSocket("custom_field:updated", {
            customField: updatedField.data,
            cardId,
            workspaceId: updatedField.data.workspace_id,
          });
        } else {
          console.warn("Failed to fetch updated field for WebSocket broadcast");
        }
      } else {
        // Update failed (likely no existing record), try creating new record
        console.log("Update failed, attempting to create new record...");
        const createRes = await this.repository_context.custom_field.createCardCustomField(
          customFieldId,
          cardId,
          updateData
        );
        console.log("Create result:", createRes.status_code);

        if (createRes.status_code === StatusCodes.CREATED) {
          console.log("Create successful, now updating with date value...");

          // After creating the record, update it with the actual date value
          const updateAfterCreate =
            await this.repository_context.custom_field.updateCardCustomField(
              customFieldId,
              cardId,
              updateData
            );
          console.log(
            "Update after create result:",
            updateAfterCreate.status_code
          );

          if (updateAfterCreate.status_code === StatusCodes.NO_CONTENT) {
            console.log("Fetching updated field for WebSocket broadcast...");
            const newField = await this.repository_context.custom_field.getCardCustomField(
              "",
              cardId,
              customFieldId
            );
            if (newField.status_code === StatusCodes.OK && newField.data) {
              console.log("Broadcasting WebSocket event for new date field");
              broadcastToWebSocket("custom_field:updated", {
                customField: newField.data,
                cardId,
                workspaceId: newField.data.workspace_id,
              });
            } else {
              console.warn(
                "Failed to fetch updated field for WebSocket broadcast"
              );
            }
          } else {
            console.warn(
              "Failed to update newly created field with date value"
            );
          }
        } else {
          console.warn(
            "Failed to create date field:",
            createRes.status_code,
            createRes.message
          );
        }
      }
    } catch (err) {
      console.error("Error moving date field", err);
    }
  }

  private computeMovedDate(base: Date, meta: any): Date | null {
    const result = new Date(base);
    const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

    const addDays = (d: Date, n: number) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + n);
      return copy;
    };

    const addWeeks = (d: Date, n: number) => addDays(d, n * 7);
    const addMonths = (d: Date, n: number) => {
      const copy = new Date(d);
      copy.setMonth(copy.getMonth() + n);
      return copy;
    };
    const addYears = (d: Date, n: number) => {
      const copy = new Date(d);
      copy.setFullYear(copy.getFullYear() + n);
      return copy;
    };

    // Simple string presets
    if (typeof meta === "string") {
      switch (meta) {
        case "today":
          return new Date();
        case "tomorrow":
          return addDays(new Date(), 1);
        case "yesterday":
          return addDays(new Date(), -1);
        case "the_previous_working_day": {
          let d = addDays(base, -1);
          while (isWeekend(d)) d = addDays(d, -1);
          return d;
        }
        case "the_same_day_next_week":
          return addWeeks(base, 1);
        case "the_same_day_next_month":
          return addMonths(base, 1);
        case "the_same_day_next_year":
          return addYears(base, 1);
        default:
          return null;
      }
    }

    // Offset object { by, unit }
    if (meta && typeof meta === "object" && "by" in meta && "unit" in meta) {
      const num = Number(meta.by);
      if (isNaN(num)) return null;
      if (meta.unit === "days") return addDays(base, num);
      if (meta.unit === "weeks") return addWeeks(base, num);
    }

    // Next weekday { weekday }
    if (meta && typeof meta === "object" && "weekday" in meta) {
      const target = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ].indexOf((meta.weekday as string).toLowerCase());
      if (target < 0) return null;
      const current = base.getDay();
      const diff = (target + 7 - current) % 7 || 7; // at least 1 day ahead
      return addDays(base, diff);
    }

    // Day of month { day, of }
    if (meta && typeof meta === "object" && "day" in meta && "of" in meta) {
      let ref = new Date(base);
      if (meta.of === "next_month") {
        ref.setMonth(ref.getMonth() + 1);
      }
      ref.setHours(
        base.getHours(),
        base.getMinutes(),
        base.getSeconds(),
        base.getMilliseconds()
      );

      const setOrdinalDay = (dayStr: string): Date | null => {
        if (dayStr.startsWith("the_") && dayStr.endsWith("st")) {
          const num = parseInt(dayStr.slice(4));
          if (!isNaN(num)) {
            ref.setDate(Math.min(num, 31));
            return ref;
          }
        }
        if (dayStr === "the_last_day" || dayStr === "the_last") {
          ref.setMonth(ref.getMonth() + 1, 0); // move to last day of previous month
          return ref;
        }
        if (dayStr === "the_last_working_day") {
          ref.setMonth(ref.getMonth() + 1, 0);
          while (isWeekend(ref)) ref.setDate(ref.getDate() - 1);
          return ref;
        }
        return null;
      };
      return setOrdinalDay(meta.day as string);
    }

    // Nth weekday of month { nth, weekday, of }
    if (
      meta &&
      typeof meta === "object" &&
      "nth" in meta &&
      "weekday" in meta &&
      "of" in meta
    ) {
      const targetWeekday = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ].indexOf((meta.weekday as string).toLowerCase());
      if (targetWeekday < 0) return null;
      const nthStr: string = meta.nth;
      let nth = 1;
      if (nthStr.includes("_")) {
        const numPart = nthStr.split("_")[1];
        nth = parseInt(numPart) || 1;
      }
      let ref = new Date(base);
      if (meta.of === "next_month") {
        ref.setMonth(ref.getMonth() + 1, 1);
      } else {
        ref.setDate(1);
      }
      let count = 0;
      while (true) {
        if (ref.getDay() === targetWeekday) {
          count += 1;
          if (nthStr === "the_last") {
            // go to last matching weekday
            const temp = new Date(ref);
            while (temp.getMonth() === ref.getMonth()) {
              ref = new Date(temp);
              temp.setDate(temp.getDate() + 7);
            }
            break;
          }
          if (count === nth) {
            break;
          }
        }
        ref.setDate(ref.getDate() + 1);
      }
      return ref;
    }

    return null;
  }

  private async handleCreateItemAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    const boardId = action.condition.board;
    const listId = action.condition.list;
    const title = action.condition.text_title;
    const description = action.condition.text_description;
    const position = action.condition.position;
    const multiUsers = action.condition.multi_users ?? [];
    const multiChecklists = action.condition.multi_checklists ?? [];

    const { data: cards } = await this.repository_context.card.getListCard(
      new CardFilter({
        list_id: listId,
      }),
      new Paginate(1, 1000)
    );

    let order = 10000;

    if (cards && cards.length > 0 && position !== EnumOptionPosition.InList) {
      const card = cards.sort((a, b) => a.order! - b.order!);

      if (position === EnumOptionPosition.TopOfList) {
        order = (card[cards.length - 1]?.order || order) - 1000;
      }

      if (position === EnumOptionPosition.BottomOfList) {
        order = (card[0]?.order || order) + 10000;
      }
    }

    const createCardResult = await this.controller_context?.card.CreateCard(
      recentUserAction.user_id,
      new CardCreateData({
        name: title,
        description: description,
        list_id: listId,
        type: CardType.Regular,
        order,
        dash_config: undefined,
      }),
      EnumTriggeredBy.OzzyAutomation
    );
    const data = createCardResult?.data;

    if (multiUsers.length > 0 && data) {
      await this.controller_context?.card_member.addMembers(data.id, multiUsers);
    }

    if (multiChecklists.length > 0 && data) {
      const dataChecklist = multiChecklists.map((item: any) => ({
        card_id: data.id,
        title: item.name,
        data: [],
      }));

      await this.controller_context?.checklist.CreateBulkChecklist(dataChecklist);
    }
  }

  private evaluateDateExpression(actual: Date, meta: any): boolean {
    try {
      const now = new Date();

      // helper: start of ISO week (Monday)
      const startOfWeek = (d: Date): Date => {
        const result = new Date(d);
        const day = result.getDay();
        const diff = (day === 0 ? -6 : 1) - day; // move to Monday
        result.setDate(result.getDate() + diff);
        result.setHours(0, 0, 0, 0);
        return result;
      };

      // helper: add weeks
      const addWeeks = (d: Date, w: number): Date => {
        const res = new Date(d);
        res.setDate(res.getDate() + w * 7);
        return res;
      };

      if (!meta) return false; // require meta for evaluation

      const unit =
        typeof meta.unit === "string" ? meta.unit.trim().toLowerCase() : "";
      const op = (meta.operator || "in").trim().toLowerCase();

      // Relative period (this week / next week)
      if (unit && ["this week", "next week"].includes(unit)) {
        const actualWeekStart = startOfWeek(actual);
        const thisWeekStart = startOfWeek(now);
        const nextWeekStart = startOfWeek(addWeeks(now, 1));

        const isInUnit =
          unit === "this week"
            ? actualWeekStart.getTime() === thisWeekStart.getTime()
            : actualWeekStart.getTime() === nextWeekStart.getTime();

        return op === "in" ? isInUnit : !isInUnit;
      }

      // Numeric helpers
      const diffHours = Math.abs(now.getTime() - actual.getTime()) / 36e5;
      const diffDays = Math.abs(now.getTime() - actual.getTime()) / 864e5;

      const businessDaysDiff = (d1: Date, d2: Date): number => {
        let count = 0;
        const start = new Date(Math.min(d1.getTime(), d2.getTime()));
        const end = new Date(Math.max(d1.getTime(), d2.getTime()));
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const day = d.getDay();
          if (day !== 0 && day !== 6) count++;
        }
        return count;
      };

      // Numeric mode
      const num = Number(meta?.numberVal);
      if (isNaN(num)) return false;

      let diff = 0;
      if (meta?.unit === "hours") diff = diffHours;
      else if (meta?.unit === "days") diff = diffDays;
      else if (meta?.unit === "working days")
        diff = businessDaysDiff(now, actual);
      else if (meta?.unit === "this month") {
        const sameMonth =
          actual.getFullYear() === now.getFullYear() &&
          actual.getMonth() === now.getMonth();
        return meta.operator === "less than" ? sameMonth : !sameMonth;
      }

      // Direction guard
      if (meta?.direction === "from now" && actual < now) return false;
      if (meta?.direction === "ago" && actual > now) return false;

      switch (meta?.operator) {
        case "less than":
          return diff < num;
        case "more than":
          return diff > num;
        case "between": {
          if (
            typeof meta.numberVal === "string" &&
            meta.numberVal.includes("-")
          ) {
            const [a, b] = meta.numberVal
              .split("-")
              .map((v: string) => Number(v.trim()));
            return diff >= a && diff <= b;
          }
          return false;
        }
        default:
          return false;
      }
    } catch (_) {
      return false;
    }
  }

  /**
   * Handle SetDateCustomField – sets the date in a custom field to a target date expression.
   *   Logic is similar to MoveDateCustomField but the base date for computation is NOW, not the current field value.
   */
  private async handleSetDateCustomFieldAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;
    let customFieldId: any = action.condition?.[EnumSelectionType.Fields];
    if (
      customFieldId &&
      typeof customFieldId === "object" &&
      "value" in customFieldId
    ) {
      customFieldId = customFieldId.value;
    }

    const rawDateVal: any = action.condition?.["date_value"];
    let expr: any = null;
    if (
      rawDateVal &&
      typeof rawDateVal === "object" &&
      Array.isArray(rawDateVal.expressions)
    ) {
      expr = rawDateVal.expressions[0] || null;
    } else if (rawDateVal) {
      expr = { value: rawDateVal, text: String(rawDateVal) };
    }

    if (!cardId || !customFieldId || !expr) {
      console.warn("Missing data for set date action");
      return;
    }

    try {
      const baseDate = new Date();
      const newDate = this.computeMovedDate(baseDate, expr.value);
      if (!newDate) {
        console.warn("Unable to compute target date for expression", expr);
        return;
      }

      const updateData = new CardCustomFieldValueUpdate({
        value_date: newDate,
      });

      // Reuse move handler logic for update/create + broadcast
      const updateRes = await this.repository_context.custom_field.updateCardCustomField(
        customFieldId,
        cardId,
        updateData
      );

      if (updateRes.status_code === StatusCodes.NO_CONTENT) {
        const updatedField = await this.repository_context.custom_field.getCardCustomField(
          "",
          cardId,
          customFieldId
        );
        if (updatedField.status_code === StatusCodes.OK && updatedField.data) {
          broadcastToWebSocket("custom_field:updated", {
            customField: updatedField.data,
            cardId,
            workspaceId: updatedField.data.workspace_id,
          });
        }
      } else {
        // create then update (same pattern)
        const createRes = await this.repository_context.custom_field.createCardCustomField(
          customFieldId,
          cardId,
          updateData
        );
        if (createRes.status_code === StatusCodes.CREATED) {
          // if creation succeeded but value not set, update it
          await this.repository_context.custom_field.updateCardCustomField(
            customFieldId,
            cardId,
            updateData
          );
          const newField = await this.repository_context.custom_field.getCardCustomField(
            "",
            cardId,
            customFieldId
          );
          if (newField.status_code === StatusCodes.OK && newField.data) {
            broadcastToWebSocket("custom_field:updated", {
              customField: newField.data,
              cardId,
              workspaceId: newField.data.workspace_id,
            });
          }
        }
      }
    } catch (err) {
      console.error("Error setting date field", err);
    }
  }

  private async handleRenameCardAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;
    const newTitle = action.condition?.text_input;

    if (!cardId || !newTitle) {
      console.warn("Missing card ID or new title for rename action");
      return;
    }

    try {
      console.log("Renaming card:", {
        cardId,
        newTitle,
      });

      // Use the card controller to update the card name
      const updateResult = await this.controller_context?.card.UpdateCard(
        recentUserAction.user_id || "",
        new CardFilter({ id: cardId }),
        new UpdateCardData({ name: newTitle }),
        EnumTriggeredBy.OzzyAutomation
      );

      if (updateResult?.status_code === StatusCodes.NO_CONTENT) {
        console.log("Card renamed successfully");
      } else {
        console.warn("Failed to rename card:", updateResult?.message);
      }
    } catch (error) {
      console.error("Error renaming card:", error);
    }
  }

  private async handleSetCardDescriptionAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;
    const newDescription = action.condition?.text_input;

    if (!cardId || !newDescription) {
      console.warn("Missing card ID or description for set description action");
      return;
    }
  }

  private async handleAddChecklistAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;
    const checklistName = action.condition?.text_input;

    if (!cardId || !checklistName) {
      console.warn(
        "Missing card ID or checklist name for add checklist action"
      );
      return;
    }

    try {
      const checklistData: CreateChecklistDTO = {
        card_id: cardId,
        title: `${checklistName}`,
        data: [],
      };
      const createResult = await this.controller_context?.checklist.CreateChecklist(
        recentUserAction.user_id || "system",
        checklistData,
        true
      );

      if (createResult?.status_code === StatusCodes.CREATED) {
        console.log("Checklist added successfully:", createResult?.data?.id);
      } else {
        console.warn("Failed to add checklist:", createResult?.message);
      }
    } catch (error) {
      console.error("Error adding checklist to card:", error);
    }
  }

  private async handleAddChecklistItemAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;

    // Extract item name and checklist name from the action condition
    // The action format is: add item <item_name> to checklist <checklist_name>
    // We expect two text_input values in the condition
    const itemName = action.condition?.text_input;
    const checklistName =
      action.condition?.checklist_name || action.condition?.text_input_2;

    if (!cardId || !itemName || !checklistName) {
      console.warn(
        "Missing card ID, item name, or checklist name for add checklist item action",
        { cardId, itemName, checklistName }
      );
      return;
    }

    try {
      const timestampStr = new Date().toISOString();
      console.log(`[${timestampStr}] AUTOMATION: Adding item to checklist:`, {
        cardId,
        itemName,
        checklistName,
        actionId: action.id,
        ruleId: action.rule_id,
        eventId: recentUserAction.eventId,
      });

      // First, get all checklists for the card
      const checklistsResult =
        await this.controller_context?.checklist.GetChecklistsByCardId(cardId);

      if (
        checklistsResult?.status_code !== StatusCodes.OK ||
        !checklistsResult?.data
      ) {
        console.warn(
          "Failed to get checklists for card:",
          checklistsResult?.message
        );
        return;
      }

      // Find the checklist with the matching name
      const targetChecklist = checklistsResult.data.find(
        (checklist) => checklist.title === checklistName
      );

      if (!targetChecklist) {
        console.log(
          `[AUTOMATION] Checklist "${checklistName}" not found for card ${cardId}, skipping item addition`
        );
        return;
      }

      // Check if the item already exists in the checklist
      const existingItems = targetChecklist.data || [];
      const itemExists = existingItems.some((item) => item.label === itemName);

      if (itemExists) {
        console.log(
          `[AUTOMATION] Item "${itemName}" already exists in checklist "${checklistName}", skipping`
        );
        return;
      }

      // Add the new item to the checklist
      const updatedItems = [
        ...existingItems,
        {
          label: itemName,
          checked: false,
        },
      ];

      // Update the checklist
      const updateResult = await this.controller_context?.checklist.UpdateChecklist(
        recentUserAction.user_id || "system",
        targetChecklist.id,
        {
          data: updatedItems,
        }
      );

      if (updateResult?.status_code === StatusCodes.OK) {
        console.log(
          `Item "${itemName}" added successfully to checklist "${checklistName}"`
        );
      } else {
        console.warn("Failed to add item to checklist:", updateResult?.message);
      }
    } catch (error) {
      console.error("Error adding item to checklist:", error);
    }
  }

  private async handleRemoveChecklistItemAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;

    // Extract item name and checklist name from the action condition
    const itemName = action.condition?.text_input;
    const checklistName =
      action.condition?.checklist_name || action.condition?.text_input_2;

    if (!cardId || !itemName || !checklistName) {
      console.warn(
        "Missing card ID, item name, or checklist name for remove checklist item action",
        { cardId, itemName, checklistName }
      );
      return;
    }

    try {
      const timestampStr = new Date().toISOString();
      console.log(
        `[${timestampStr}] AUTOMATION: Removing item from checklist:`,
        {
          cardId,
          itemName,
          checklistName,
          actionId: action.id,
          ruleId: action.rule_id,
          eventId: recentUserAction.eventId,
        }
      );

      // First, get all checklists for the card
      const checklistsResult =
        await this.controller_context?.checklist.GetChecklistsByCardId(cardId);

      if (
        checklistsResult?.status_code !== StatusCodes.OK ||
        !checklistsResult?.data
      ) {
        console.warn(
          "Failed to get checklists for card:",
          checklistsResult?.message
        );
        return;
      }

      // Find the checklist with the matching name
      const targetChecklist = checklistsResult.data.find(
        (checklist) => checklist.title === checklistName
      );

      if (!targetChecklist) {
        console.log(
          `[AUTOMATION] Checklist "${checklistName}" not found for card ${cardId}, skipping item removal`
        );
        return;
      }

      // Check if the item exists in the checklist
      const existingItems = targetChecklist.data || [];
      const itemExists = existingItems.some((item) => item.label === itemName);

      if (!itemExists) {
        console.log(
          `[AUTOMATION] Item "${itemName}" not found in checklist "${checklistName}", skipping`
        );
        return;
      }

      // Remove the item from the checklist
      const updatedItems = existingItems.filter(
        (item) => item.label !== itemName
      );

      // Update the checklist
      const updateResult = await this.controller_context?.checklist.UpdateChecklist(
        recentUserAction.user_id || "system",
        targetChecklist.id,
        {
          data: updatedItems,
        }
      );

      if (updateResult?.status_code === StatusCodes.OK) {
        console.log(
          `Item "${itemName}" removed successfully from checklist "${checklistName}"`
        );
      } else {
        console.warn(
          "Failed to remove item from checklist:",
          updateResult?.message
        );
      }
    } catch (error) {
      console.error("Error removing item from checklist:", error);
    }
  }

  private async handleSetChecklistItemDueDateAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;
    const itemName = action.condition?.text_input;
    const checklistName =
      action.condition?.[EnumSelectionType.ChecklistName] ||
      (action.condition as any)?.checklist_name;
    const dateExpr =
      action.condition?.[EnumInputType.DateValue] ||
      (action.condition as any)?.date_value;

    if (!cardId || !itemName || !dateExpr) {
      console.warn("Missing data for set checklist item due date", {
        cardId,
        itemName,
        dateExpr,
      });
      return;
    }

    try {
      // compute target date relative to now using helper
      const targetDate = this.computeMovedDate(
        new Date(),
        dateExpr?.value ?? dateExpr
      );
      if (!targetDate) {
        console.warn("Unable to compute target date", dateExpr);
        return;
      }

      await this.updateChecklistItemDueDate(
        cardId,
        itemName,
        checklistName,
        targetDate
      );
    } catch (err) {
      console.error("Error setting checklist item due date", err);
    }
  }

  private async handleMoveChecklistItemDueDateAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;
    const itemName = action.condition?.text_input;
    const checklistName =
      action.condition?.[EnumSelectionType.ChecklistName] ||
      (action.condition as any)?.checklist_name;
    const dateExpr =
      action.condition?.[EnumInputType.DateValue] ||
      (action.condition as any)?.date_value;

    if (!cardId || !itemName || !dateExpr) {
      console.warn("Missing data for move checklist item due date", {
        cardId,
        itemName,
        dateExpr,
      });
      return;
    }

    try {
      // fetch checklists to get current due date
      const clRes = await this.controller_context?.checklist.GetChecklistsByCardId(
        cardId
      );
      if (clRes?.status_code !== 200 || !clRes?.data) return;
      let currentDue: Date | null = null;
      let targetChecklist: any = null;
      let itemIndex = -1;
      for (const cl of clRes.data) {
        if (checklistName && cl.title !== checklistName) continue;
        const idx = (cl.data || []).findIndex(
          (it: any) => it.label === itemName
        );
        if (idx >= 0) {
          currentDue = cl.data[idx].due_date
            ? new Date(cl.data[idx].due_date)
            : new Date();
          targetChecklist = cl;
          itemIndex = idx;
          break;
        }
      }
      if (!targetChecklist) {
        console.warn("Checklist/item not found for move due date");
        return;
      }

      const newDate = this.computeMovedDate(
        currentDue!,
        dateExpr?.value ?? dateExpr
      );
      if (!newDate) {
        console.warn("Failed computing moved date", dateExpr);
        return;
      }

      await this.updateChecklistItemDueDate(
        cardId,
        itemName,
        checklistName,
        newDate
      );
    } catch (err) {
      console.error("Error moving checklist item due date", err);
    }
  }

  private async updateChecklistItemDueDate(
    cardId: string,
    itemName: string,
    checklistName: string | undefined,
    newDate: Date
  ): Promise<void> {
    // fetch checklists
    const clRes = await this.controller_context?.checklist.GetChecklistsByCardId(cardId);
    if (clRes?.status_code !== 200 || !clRes?.data) return;
    for (const cl of clRes.data) {
      if (checklistName && cl.title !== checklistName) continue;
      const items = cl.data || [];
      const idx = items.findIndex((it: any) => it.label === itemName);
      if (idx < 0) continue;
      // update due_date
      items[idx] = { ...items[idx], due_date: newDate.toISOString() };
      await this.controller_context?.checklist.UpdateChecklist("system", cl.id, {
        data: items,
      });
      break;
    }
  }

  private async handleToggleChecklistItemChecked(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent,
    checked: boolean
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;
    const itemName = action.condition?.text_input;
    const checklistName =
      action.condition?.[EnumSelectionType.ChecklistName] ||
      (action.condition as any)?.checklist_name;

    if (!cardId || !itemName) {
      console.warn("Missing data for toggle checklist item", {
        cardId,
        itemName,
      });
      return;
    }

    try {
      await this.updateChecklistItemChecked(
        cardId,
        itemName,
        checklistName,
        checked
      );
    } catch (err) {
      console.error("Error toggling checklist item", err);
    }
  }

  private async updateChecklistItemChecked(
    cardId: string,
    itemName: string,
    checklistName: string | undefined,
    checked: boolean
  ): Promise<void> {
    const clRes = await this.controller_context?.checklist.GetChecklistsByCardId(cardId);
    if (clRes?.status_code !== 200 || !clRes?.data) return;
    for (const cl of clRes.data) {
      if (checklistName && cl.title !== checklistName) continue;
      const items = cl.data || [];
      const idx = items.findIndex((it: any) => it.label === itemName);
      if (idx < 0) continue;
      if (items[idx].checked === checked) return; // already desired state
      items[idx] = { ...items[idx], checked };
      await this.controller_context?.checklist.UpdateChecklist("system", cl.id, {
        data: items,
      });
      break;
    }
  }

  private async handleAddCardMemberAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;
    const userId = action.condition?.user;
    if (!cardId || !userId) {
      console.warn("AddCardMember missing card or user", { cardId, userId });
      return;
    }
    try {
      const addRes = await this.controller_context?.card_member.addMembers(cardId, [
        userId,
      ]);
      if (addRes?.status_code === 200) {
        const mems = await this.controller_context?.card_member.getMembers(cardId);
        if (mems?.status_code === 200) {
          broadcastToWebSocket("card_member:updated", {
            cardId,
            members: (mems as any).data || [],
          });
        }
      }
    } catch (e) {
      console.error("Error adding member", e);
    }
  }

  private async handleRemoveCardMemberAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    const cardId = recentUserAction.data.card?.id;
    const userId = action.condition?.user;
    if (!cardId) {
      console.warn("RemoveCardMember missing card", { cardId });
      return;
    }
    try {
      if (userId) {
        // remove specific user
        const remRes = await this.controller_context?.card_member.removeMember(
          cardId,
          userId
        );
        if (remRes?.status_code === 200) {
          const memsAfter = await this.controller_context?.card_member.getMembers(
            cardId
          );
          if (memsAfter?.status_code === 200) {
            broadcastToWebSocket("card_member:updated", {
              cardId,
              members: (memsAfter as any).data || [],
            });
          }
        }
      } else {
        // remove all members
        const membersRes = await this.controller_context?.card_member.getMembers(cardId);
        const memList: any[] =
          (membersRes as any).data || (membersRes as any).members || [];
        if (membersRes?.status_code === 200 && memList.length) {
          for (const m of memList) {
            const remRes = await this.controller_context?.card_member.removeMember(
              cardId,
              m.id || m.user_id
            );
            if (remRes?.status_code === 200) {
              const memsAfter = await this.controller_context?.card_member.getMembers(
                cardId
              );
              if (memsAfter?.status_code === 200) {
                broadcastToWebSocket("card_member:updated", {
                  cardId,
                  members: (memsAfter as any).data || [],
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Error removing member", e);
    }
  }
}