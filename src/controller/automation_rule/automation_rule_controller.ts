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
import { CardControllerI, CardCreateData, CardFilter, CardMoveData, CopyCardData } from "../card/card_interfaces";
import {
  EnumActions,
  EnumTriggeredBy,
  UserActionEvent,
} from "@/types/event";
import { ActionType, EnumInputType, EnumSelectionType } from "@/types/automation_rule";
import { EnumOptionPosition, EnumOptionsNumberComparisonOperators, EnumOptionsSubject } from "@/types/options";
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
    
    data.created_by = user_id
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

      const rules = await this.automation_rule_repo.matchRules(
        filter
      );

      if (rules.status_code !== StatusCodes.OK) {
        return new ResponseData({
          message: "Failed to find matching rules",
          status_code: rules.status_code,
        });
      }

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
              if (recentUserAction?.data?.card?.list_id != rule.condition?.[EnumSelectionType.List]) {
                isPermsissable = false;
              }
            } // end of lsit

            // optional by subject
            if (rule.condition?.[EnumSelectionType.OptionalBySubject]) {
              console.log(`rule has optional ${EnumSelectionType.OptionalBySubject} dependency`);
              
              // by me
              if ( rule.condition?.[EnumSelectionType.OptionalBySubject]?.operator == EnumOptionsSubject.ByMe) {
                if (rule.created_by !== recentUserAction?.user_id) {
                  isPermsissable = false;
                }
              }

              // by anyone, except me
              if ( rule.condition?.[EnumSelectionType.OptionalBySubject]?.operator == EnumOptionsSubject.ByAnyoneExceptMe) {
                if (rule.created_by === recentUserAction?.user_id) {
                  isPermsissable = false;
                }
              }

              if (typeof rule.condition?.[EnumSelectionType.OptionalBySubject] == 'object') {

                // by specific user - baru bisa single user
                if ( rule.condition?.[EnumSelectionType.OptionalBySubject]?.operator == EnumOptionsSubject.BySpecificUser) {
                  if (!rule.condition?.[EnumSelectionType.OptionalBySubject]?.data.includes(recentUserAction?.user_id)) {
                    isPermsissable = false;
                  }
                }

                // anyone, except specific user
                if ( rule.condition?.[EnumSelectionType.OptionalBySubject]?.operator == EnumOptionsSubject.ByAnyoneExceptSpecificUser) {
                  if (rule.condition?.[EnumSelectionType.OptionalBySubject]?.data.includes(recentUserAction?.user_id)) {
                    isPermsissable = false;
                  }
                }
              }
            } // end of optional by subject

            // By subject
            if (rule.condition?.[EnumSelectionType.BySubject]) {
              console.log(`rule has optional ${EnumSelectionType.BySubject} dependency`);

              // by me
              if ( rule.condition?.[EnumSelectionType.BySubject]?.operator == EnumOptionsSubject.ByMe) {
                if (rule.created_by !== recentUserAction?.user_id) {
                  isPermsissable = false;
                }
              }

              // by anyone, except me
              if ( rule.condition?.[EnumSelectionType.BySubject]?.operator == EnumOptionsSubject.ByAnyoneExceptMe) {
                if (rule.created_by === recentUserAction?.user_id) {
                  isPermsissable = false;
                }
              }

              if (typeof rule.condition?.[EnumSelectionType.BySubject] == 'object') {
                // by specific user
                if ( rule.condition?.[EnumSelectionType.BySubject]?.operator == EnumOptionsSubject.BySpecificUser) {
                  if (!rule.condition?.[EnumSelectionType.BySubject]?.data.includes(recentUserAction?.user_id)) {
                    isPermsissable = false;
                  }
                }

                // anyone, except specific user
                if ( rule.condition?.[EnumSelectionType.BySubject]?.operator == EnumOptionsSubject.ByAnyoneExceptSpecificUser) {
                  if (rule.condition?.[EnumSelectionType.BySubject]?.data.includes(recentUserAction?.user_id)) {
                    isPermsissable = false;
                  }
                }
              }
            } // end of by subject


            // number of cards in list
            if (rule.condition?.[EnumSelectionType.NumberComparison]) {
               console.log("rule has number of cards in list dependency dependency");
              // check if list match first
              if (recentUserAction?.data?.card?.list_id != rule.condition?.[EnumSelectionType.List]) {
                isPermsissable = false;
              } else {
                const result = await this.card_controller.GetListCard(new CardFilter({list_id: rule.condition?.[EnumSelectionType.List]}), new Paginate(0, 0));
                console.log("COMPARE RESULT: %o", result);
                if (result.status_code !== StatusCodes.OK && !result.data) isPermsissable = false;
                const cardCount = result.data?.length || 0;
                const numberToCompare = rule.condition?.[EnumInputType.Number];

                if (rule?.condition?.[EnumSelectionType.NumberComparison] == rule.condition?.[EnumOptionsNumberComparisonOperators.Exactly]) {
                  if (cardCount != numberToCompare) isPermsissable = false;
                } else if (rule?.condition?.[EnumSelectionType.NumberComparison] == rule.condition?.[EnumOptionsNumberComparisonOperators.FewerThan]) {
                  if (cardCount >= numberToCompare) isPermsissable = false;
                } else if (rule?.condition?.[EnumSelectionType.NumberComparison] == rule.condition?.[EnumOptionsNumberComparisonOperators.MoreThan]) {
                  if (cardCount <= numberToCompare) isPermsissable = false;
                }
              }
            } // end of number of cards in list

            if (isPermsissable) {
              return this.ProcessAutomationAction(
                recentUserAction,
                new AutomationRuleFilter({
                  id: rule.id,
                  group_type: rule?.group_type,
                  type: rule.type,
                  workspace_id: rule.workspace_id,
                  condition: rule.condition,
                  action: rule.action
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
          action.condition.multi_fields ? action.condition.multi_fields : []
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
      target_list_id: action.condition?.[EnumSelectionType.List] || action.condition?.[EnumSelectionType.OptionalList],
      previous_position: recentUserAction.data.card.order,
      target_position_top_or_bottom: action.condition?.[EnumSelectionType.Position]
    });

    await this.card_controller.MoveCard("recentUserAction.user_id", moveData, EnumTriggeredBy.OzzyAutomation);
  }

  private async handleArchiveCardAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {
    await this.card_controller.ArchiveCard(recentUserAction?.data?.value_user_id || "", recentUserAction?.data?.card?.id, EnumTriggeredBy.OzzyAutomation);
  }

  private async handleUnarchiveCardAction(
    action: AutomationRuleActionDetail,
    recentUserAction: UserActionEvent
  ): Promise<void> {;
    await this.card_controller.UnArchiveCard(recentUserAction?.data?.value_user_id || "", recentUserAction?.data?.card?.id, EnumTriggeredBy.OzzyAutomation);
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
        target_list_id: action?.condition?.[EnumSelectionType.List] || action?.condition?.[EnumSelectionType.OptionalList],
        position: action?.condition?.[EnumSelectionType.Position] || action?.condition?.[EnumSelectionType.OptionalPosition],
        is_with_attachments: true,
        is_with_checklist: true,
        is_with_labels: true,
        is_with_comments: true,
        is_with_members: true,
        is_wtih_custom_fields: true
      }), 
      EnumTriggeredBy.OzzyAutomation);
  }
}
