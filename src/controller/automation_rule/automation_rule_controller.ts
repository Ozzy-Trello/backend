import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { Paginate } from "@/utils/data_utils";
import { AutomationRuleDetail, AutomationRuleRepositoryI } from '@/repository/automation_rule/automation_rule_interface';
import { AutomationRuleControllerI, AutomationRuleCreateData, AutomationRuleFilter, AutomationRuleResponse, RecentUserAction } from './automation_rule_interface';
import { AutomationRuleActionDetail, AutomationRuleActionRepositoryI } from '@/repository/automation_rule_action/automation_rule_action_interface';
import { CardRepositoryI } from "@/repository/card/card_interfaces";
import { CardControllerI, CardMoveData } from "../card/card_interfaces";

export class AutomationRuleController implements AutomationRuleControllerI {
  private automation_rule_repo: AutomationRuleRepositoryI;
  private automation_rule_action_repo: AutomationRuleActionRepositoryI;
  private card_controller: CardControllerI;

  constructor(automation_rule_repo: AutomationRuleRepositoryI, automation_rule_action_repo: AutomationRuleActionRepositoryI, card_controller: CardControllerI) {
    this.automation_rule_repo = automation_rule_repo;
    this.automation_rule_action_repo = automation_rule_action_repo;
    this.card_controller = card_controller;
    this.CreateAutomationRule = this.CreateAutomationRule.bind(this);
    this.GetListAutomationRule = this.GetListAutomationRule.bind(this);
  }

  async CreateAutomationRule(user_id: string, data: AutomationRuleCreateData): Promise<ResponseData<AutomationRuleDetail>> {
    let paylodCheck = data.checkRequired();
    if (paylodCheck) {
      return new ResponseData({
        message: `you need to put '${paylodCheck}'`,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    let result = await this.automation_rule_repo.createRule(data.toAutomationRuleDetail())
    if (result.status_code != StatusCodes.OK) {
      let msg = "internal server error"
      return new ResponseData({
        message: msg,
        status_code: StatusCodes.BAD_REQUEST,
      })
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
    })
  }

  async GetListAutomationRule(filter: AutomationRuleFilter, paginate: Paginate): Promise<ResponseListData<Array<AutomationRuleDetail>>> {
    let result = await this.automation_rule_repo.getRuleList(filter.toFilterAutomationRuleDetail(), paginate);

    if (result && result?.data) {
      const rule_ids = (result?.data?.map(rule => rule.id) ?? []).filter((id): id is string => id !== undefined);
      if (rule_ids.length > 0) {

        const resultAction = await this.automation_rule_action_repo.getActionList({
          rule_ids: rule_ids,
        }, paginate);

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

    return new ResponseListData({
      message: "automation rule action list",
      status_code: StatusCodes.OK,
      data: result.data,
    }, result.paginate)
  }

  async FindMatchingRules(recentUserAction: RecentUserAction, filter: AutomationRuleFilter): Promise<ResponseData<Array<AutomationRuleDetail>>> {

    console.log("Finding matching automation rule for recent user action: %o", recentUserAction);

    const rules = await this.automation_rule_repo.matchRules(filter.toFilterAutomationRuleDetail());
    if (rules.status_code !== StatusCodes.OK) {
      return new ResponseData({
        message: "Failed to find matching rules",
        status_code: rules.status_code,
      });
    }
    
    if (rules && rules?.data) {
      for (const rule of rules?.data) {
        if (rule && rule?.id) {
          this.ProcessAutomationAction(recentUserAction, new AutomationRuleFilter({
            id: rule.id,
            group_type: rule?.group_type,
            type: rule.type,
            workspace_id: rule.workspace_id,
            condition: rule.condition
          }))
        }
      }
    }

    return new ResponseData({
      message: "Matching rules found",
      status_code: StatusCodes.OK,
      data: rules.data,
    });
  }

  async ProcessAutomationAction(recentUserAction: RecentUserAction, filter: AutomationRuleFilter): Promise<ResponseData<any>> {
    if (!filter || !filter.id) {
      return new ResponseData({
        message: "Automation rule is invalid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    const actions = await this.automation_rule_action_repo.getByRuleId(filter?.id);

    actions?.data?.forEach((action: AutomationRuleActionDetail) => {
      switch (action?.condition?.action) {
        case "move":
            if (action?.condition?.position) {
              switch (action?.condition?.position) {
                case "top_of_list":
                  console.log("Executing automation action: Move card to the top list: %o", recentUserAction);
                  this.card_controller.MoveCard("e6097fcc-a35b-4a22-9556-8f648c87b103", new CardMoveData({
                    id: recentUserAction?.card?.id,
                    previous_list_id: recentUserAction?.card?.list_id,
                    target_list_id: recentUserAction?.card?.list_id,
                    previous_position: recentUserAction?.card?.order,
                    target_position_top_or_bottom: "top"
                  }))
                  break;
                case "bottom_of_list":
                  console.log("Executing automation action: Move card to the bottom list: %o", recentUserAction);
                  this.card_controller.MoveCard("e6097fcc-a35b-4a22-9556-8f648c87b103", new CardMoveData({
                    id: recentUserAction?.card?.id,
                    previous_list_id: recentUserAction?.card?.list_id,
                    target_list_id: recentUserAction?.card?.list_id,
                    previous_position: recentUserAction?.card?.order,
                    target_position_top_or_bottom: "bottom",
                  }))
                  break;
                default:
                  break;
              }
            }
          break;
      
        default:
          break;
      }
    });

    return new ResponseData({
      message: "Processing automation actions",
      status_code: StatusCodes.OK,
      data: null,
    });
  }

}