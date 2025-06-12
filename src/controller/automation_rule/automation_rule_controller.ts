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
  RecentUserAction,
} from "./automation_rule_interface";
import {
  AutomationRuleActionDetail,
  AutomationRuleActionRepositoryI,
} from "@/repository/automation_rule_action/automation_rule_action_interface";
import { CardControllerI, CardMoveData } from "../card/card_interfaces";
import {
  EnumActions,
  EnumUserActionEvent,
  UserActionEvent,
} from "@/types/event";
import { ActionType } from "@/types/automation_rule";
import { EnumOptionPosition } from "@/types/options";
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
        filter.toFilterAutomationRuleDetail()
      );

      if (rules.status_code !== StatusCodes.OK) {
        return new ResponseData({
          message: "Failed to find matching rules",
          status_code: rules.status_code,
        });
      }

      if (rules?.data) {
        // Process rules in parallel for better performance
        const processingPromises = rules.data.map((rule) => {
          if (rule?.id) {
            return this.ProcessAutomationAction(
              recentUserAction,
              new AutomationRuleFilter({
                id: rule.id,
                group_type: rule?.group_type,
                type: rule.type,
                workspace_id: rule.workspace_id,
                condition: rule.condition,
              })
            );
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

      const actions = await this.automation_rule_action_repo.getByRuleId(
        filter.id
      );

      if (actions?.data) {
        // Process actions in parallel
        const actionPromises = actions.data.map((action) =>
          this.executeAutomationAction(action, recentUserAction)
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
        default:
          console.warn(
            `Unknown automation action: ${action?.condition?.action}`
          );
      }
    } catch (error) {
      console.error(
        `Error executing automation action ${action?.condition?.action}:`,
        error
      );
      // Don't throw - other actions should continue processing
    }
  }

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
    if (!action?.condition?.position || !recentUserAction?.data.card?.id)
      return;

    const moveData = new CardMoveData({
      id: recentUserAction.data.card.id,
      previous_list_id: recentUserAction.data.card.list_id,
      target_list_id:
        action.condition.target_list_id || recentUserAction.data.card.list_id,
      previous_position: recentUserAction.data.card.order,
      target_position_top_or_bottom:
        action.condition.position === EnumOptionPosition.TopOfList
          ? "top"
          : "bottom",
    });

    await this.card_controller.MoveCard("recentUserAction.user_id", moveData);
  }
}
