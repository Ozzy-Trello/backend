import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { Paginate } from "@/utils/data_utils";
import {
  AutomationRuleDetail,
  AutomationRuleRepositoryI,
} from "@/repository/automation_rule/automation_rule_interface";
import {
  AutomationRuleControllerI,
  AutomationRuleCreateData,
  AutomationRuleFilter,
} from "./automation_rule_interface";
import {
  AutomationRuleActionDetail,
  AutomationRuleActionRepositoryI,
} from "@/repository/automation_rule_action/automation_rule_action_interface";
import {
  CardControllerI,
  CardCreateData,
  CardFilter,
  CardMoveData,
  CopyCardData,
} from "../card/card_interfaces";
import {
  EnumActions,
  EnumTriggeredBy,
  UserActionEvent,
  EnumUserActionEvent,
} from "@/types/event";
import {
  ActionType,
  EnumInputType,
  EnumSelectionType,
  TriggerType,
} from "@/types/automation_rule";
import {
  EnumOptionPosition,
  EnumOptionsNumberComparisonOperators,
  EnumOptionsSubject,
  EnumOptionsSet,
} from "@/types/options";
import { WhatsAppHttpService } from "@/services/whatsapp/whatsapp_http_service";
import { WhatsAppController } from "../whatsapp/whatsapp_controller";
import { CustomFieldRepositoryI } from "@/repository/custom_field/custom_field_interfaces";
import { UserRepositoryI } from "@/repository/user/user_interfaces";

export class AutomationRuleController implements AutomationRuleControllerI {
  private automation_rule_repo: AutomationRuleRepositoryI;
  private automation_rule_action_repo: AutomationRuleActionRepositoryI;
  private card_controller: CardControllerI;
  private whatsapp_controller: WhatsAppController;
  private custom_field_repo: CustomFieldRepositoryI;
  private user_repo: UserRepositoryI;

  constructor(
    automation_rule_repo: AutomationRuleRepositoryI,
    automation_rule_action_repo: AutomationRuleActionRepositoryI,
    card_controller: CardControllerI,
    whatsapp_controller: WhatsAppController,
    custom_field_repo: CustomFieldRepositoryI,
    user_repo: UserRepositoryI
  ) {
    this.automation_rule_repo = automation_rule_repo;
    this.automation_rule_action_repo = automation_rule_action_repo;
    this.card_controller = card_controller;
    this.whatsapp_controller = whatsapp_controller;
    this.custom_field_repo = custom_field_repo;
    this.user_repo = user_repo;
    this.CreateAutomationRule = this.CreateAutomationRule.bind(this);
    this.GetListAutomationRule = this.GetListAutomationRule.bind(this);
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
    let result = await this.automation_rule_repo.createRule(
      data.toAutomationRuleDetail()
    );
    if (result.status_code != StatusCodes.OK) {
      let msg = "internal server error";
      return new ResponseData({
        message: msg,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    let data_actions = [];
    for (let action of data?.action) {
      // bulk create automation rule action
      let actionData = new AutomationRuleActionDetail({
        ...action,
        rule_id: result?.data?.id,
      });
      data_actions.push(actionData);
    }
    this.automation_rule_action_repo.bulkCreateActions(data_actions);

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
    let result = await this.automation_rule_repo.getRuleList(
      filter.toFilterAutomationRuleDetail(),
      paginate
    );

    if (result && result?.data) {
      const rule_ids = (result?.data?.map((rule) => rule.id) ?? []).filter(
        (id): id is string => id !== undefined
      );
      if (rule_ids.length > 0) {
        const resultAction =
          await this.automation_rule_action_repo.getActionList(
            {
              rule_ids: rule_ids,
            },
            paginate
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

      const rules = await this.automation_rule_repo.matchRules(filter);

      if (rules.status_code !== StatusCodes.OK) {
        return new ResponseData({
          message: "Failed to find matching rules",
          status_code: rules.status_code,
        });
      }

      console.log("filter are: %o", filter);
      console.log("rules are: %o", rules);

      if (rules?.data) {
        // Process rules in parallel for better performance
        const processingPromises = rules.data.map(async (rule) => {
          if (rule?.id) {
            console.log("rule: is: %o", rule);
            let isPermsissable = true;

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
                  ?.operator == EnumOptionsSubject.ByMe
              ) {
                if (rule.created_by !== recentUserAction?.user_id) {
                  isPermsissable = false;
                }
              }

              // by anyone, except me
              if (
                rule.condition?.[EnumSelectionType.OptionalBySubject]
                  ?.operator == EnumOptionsSubject.ByAnyoneExceptMe
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
                    ?.operator == EnumOptionsSubject.BySpecificUser
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
                    ?.operator == EnumOptionsSubject.ByAnyoneExceptSpecificUser
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
                EnumOptionsSubject.ByMe
              ) {
                if (rule.created_by !== recentUserAction?.user_id) {
                  isPermsissable = false;
                }
              }

              // by anyone, except me
              if (
                rule.condition?.[EnumSelectionType.BySubject]?.operator ==
                EnumOptionsSubject.ByAnyoneExceptMe
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
                  EnumOptionsSubject.BySpecificUser
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
                  EnumOptionsSubject.ByAnyoneExceptSpecificUser
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
                const result = await this.card_controller.GetListCard(
                  new CardFilter({
                    list_id: rule.condition?.[EnumSelectionType.List],
                  }),
                  new Paginate(0, 0)
                );
                console.log("COMPARE RESULT: %o", result);
                if (result.status_code !== StatusCodes.OK && !result.data)
                  isPermsissable = false;
                const cardCount = result.data?.length || 0;
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
              console.log("passed permissable actually");
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

      // const actions = await this.automation_rule_action_repo.getByRuleId(
      //   filter.id
      // );

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
        await this.whatsapp_controller.sendNotification(
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
    const moveData = new CardMoveData({
      id: recentUserAction.data.card.id,
      previous_list_id: recentUserAction.data.card.list_id,
      target_list_id:
        action.condition?.[EnumSelectionType.List] ||
        action.condition?.[EnumSelectionType.OptionalList],
      previous_position: recentUserAction.data.card.order,
      target_position_top_or_bottom:
        action.condition?.[EnumSelectionType.Position],
    });

    await this.card_controller.MoveCard(
      "recentUserAction.user_id",
      moveData,
      EnumTriggeredBy.OzzyAutomation
    );
  }

  private async handleArchiveCardAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    await this.card_controller.ArchiveCard(
      recentUserAction?.data?.value_user_id || "",
      recentUserAction?.data?.card?.id,
      EnumTriggeredBy.OzzyAutomation
    );
  }

  private async handleUnarchiveCardAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    await this.card_controller.UnArchiveCard(
      recentUserAction?.data?.value_user_id || "",
      recentUserAction?.data?.card?.id,
      EnumTriggeredBy.OzzyAutomation
    );
  }

  private async handleCopyCardAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    await this.card_controller.CopyCard(
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
}
