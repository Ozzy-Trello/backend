import { AutomationRuleRestViewI } from "@/views/rest/interfaces";
import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { ResponseData } from "@/utils/response_utils";
import {
  AutomationRuleControllerI,
  AutomationRuleCreateData,
  AutomationRuleFilter,
} from "@/controller/automation_rule/automation_rule_interface";
import { Paginate } from "@/utils/data_utils";

export default class AutomationRuleRestView implements AutomationRuleRestViewI {
  private controller: AutomationRuleControllerI;

  constructor(c: AutomationRuleControllerI) {
    this.controller = c;
    this.CreateAutomationRule = this.CreateAutomationRule.bind(this);
    this.GetListAutomationRule = this.GetListAutomationRule.bind(this);
  }
	async CreateAutomationRule(req: Request, res: Response): Promise<void> {
		try {
			const create_response: ResponseData<any> = await this.controller.CreateAutomationRule(req.auth!.user_id, new AutomationRuleCreateData({
				type: req.body.type,
				group_type: req.body.group_type,
        workspace_id: req.body.workspace_id,
        condition: req.body.condition,
				filter: req.body.filter,
        action: req.body.action
			}))
			if (create_response.status_code != StatusCodes.OK) {
				if (create_response.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
					console.log(create_response.message)
					res.status(create_response.status_code).json({
						"message": "internal server error",
					})
					return
				}
				res.status(create_response.status_code).json({
					"message": create_response.message,
				})
				return
			}
			res.status(create_response.status_code).json({
				"data": create_response.data,
				"message": create_response.message
			})
			return
		} catch (err) {
			console.log(err)
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({"message": ReasonPhrases.INTERNAL_SERVER_ERROR})
		}
	}

  async GetListAutomationRule(req: Request, res: Response): Promise<void> {
    try {
      let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
      let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
      let paginate = new Paginate(page, limit);

      const list_response: ResponseData<any> =
        await this.controller.GetListAutomationRule(
          new AutomationRuleFilter({
            workspace_id: req.header("workspace-id")?.toString(),
            group_type: req.query.group_type?.toString(),
            type: req.query.type?.toString(),
          }),
          paginate
        );
      if (list_response.status_code != StatusCodes.OK) {
        if (list_response.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
          console.log(list_response.message);
          res.status(list_response.status_code).json({
            message: "internal server error",
          });
          return;
        }
        res.status(list_response.status_code).json({
          message: list_response.message,
        });
        return;
      }
      res.status(list_response.status_code).json({
        data: list_response.data,
        paginate: (list_response as any).paginate,
        message: list_response.message,
      });
      return;
    } catch (err) {
      console.log(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
  }
}
