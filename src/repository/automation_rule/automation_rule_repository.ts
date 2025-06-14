import AutomationRule from "@/database/schemas/automation_rule";
import { Error, literal, Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "@/utils/errors";
import { Paginate } from "@/utils/data_utils";
import {
  AutomationRuleDetail,
  AutomationRuleRepositoryI,
  AutomationRuleUpdate,
  filterAutomationRule,
} from "./automation_rule_interface";
import { AutomationRuleResponse } from "@/controller/automation_rule/automation_rule_interface";

export class AutomationRuleRepository implements AutomationRuleRepositoryI {
  createFilter(filter: filterAutomationRule): any {
    const where: any = {};
    const or: any[] = [];
    const not: any[] = [];

    console.log(filter, "<< ini di create filter");

    if (filter.id) where.id = filter.id;
    if (filter.workspace_id) where.workspace_id = filter.workspace_id;
    if (filter.group_type) where.group_type = filter.group_type;
    if (filter.type) where.type = filter.type;
    if (filter.created_by) where.type = filter.created_by;
    if (filter.updated_by) where.type = filter.updated_by;

    if (filter.__orId) or.push({ id: filter.__orId });
    if (filter.__orWorkspaceId)
      or.push({ workspace_id: filter.__orWorkspaceId });
    if (filter.__orGroupType) or.push({ group_type: filter.__orGroupType });
    if (filter.__orType) or.push({ type: filter.__orType });

    if (filter.__notId) not.push({ id: filter.__notId });
    if (filter.__notWorkspaceId)
      not.push({ workspace_id: filter.__notWorkspaceId });
    if (filter.__notGroupType) not.push({ group_type: filter.__notGroupType });
    if (filter.__notType) not.push({ type: filter.__notType });

    if (filter.condition && typeof filter.condition === "object") {
      for (const key in filter.condition) {
        const val = filter.condition[key];
        if (val !== undefined) {
          if (!where[Op.and]) where[Op.and] = [];
          where[Op.and].push(literal(`condition->>'${key}' = '${val}'`));
        }
      }
    }

    if (or.length > 0) where[Op.or] = or;
    if (not.length > 0) where[Op.not] = not;

    return where;
  }

  async getRule(
    filter: filterAutomationRule
  ): Promise<ResponseData<AutomationRuleDetail>> {
    try {
      const rule = await AutomationRule.findOne({
        where: this.createFilter(filter),
      });
      if (!rule) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "automation rule not found",
        };
      }
      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "automation rule detail",
        data: new AutomationRuleDetail(rule.toJSON()),
      });
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async getRuleList(
    filter: filterAutomationRule,
    paginate: Paginate
  ): Promise<ResponseListData<Array<AutomationRuleDetail>>> {
    const result: AutomationRuleDetail[] = [];
    paginate.setTotal(
      await AutomationRule.count({ where: this.createFilter(filter) })
    );
    const rules = await AutomationRule.findAll({
      where: this.createFilter(filter),
      offset: paginate.getOffset(),
      limit: paginate.limit,
    });
    for (const rule of rules) {
      result.push(new AutomationRuleDetail(rule.toJSON()));
    }
    return new ResponseListData(
      {
        status_code: StatusCodes.OK,
        message: "list automation rules",
        data: result,
      },
      paginate
    );
  }

  async createRule(
    data: AutomationRuleDetail
  ): Promise<ResponseData<AutomationRuleDetail>> {
    try {
      console.log(data, "<< di repo");
      const rule = await AutomationRule.create({
        id: data.id || uuidv4(),
        workspace_id: data.workspace_id,
        group_type: data.group_type,
        type: data.type,
        condition: data.condition,
        created_by: data?.created_by,
      });
      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "automation rule created",
        data: new AutomationRuleDetail(rule.toJSON()),
      });
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async updateRule(
    filter: filterAutomationRule,
    data: AutomationRuleUpdate
  ): Promise<number> {
    try {
      const updated = await AutomationRule.update(data.toObject(), {
        where: this.createFilter(filter),
      });
      if (updated[0] === 0) return StatusCodes.NOT_FOUND;
      return StatusCodes.NO_CONTENT;
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async deleteRule(filter: filterAutomationRule): Promise<number> {
    try {
      const deleted = await AutomationRule.destroy({
        where: this.createFilter(filter),
      });
      if (deleted === 0) return StatusCodes.NOT_FOUND;
      return StatusCodes.NO_CONTENT;
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async matchRules(
    filter: filterAutomationRule
  ): Promise<ResponseData<Array<AutomationRuleDetail>>> {
    const f = this.createFilter(filter);
    console.log("da fiilter is: %o", f);
    const actions = await AutomationRule.findAll({
      where: f,
    });

    const result = actions.map(
      (action) => new AutomationRuleDetail(action.toJSON())
    );

    return new ResponseData({
      status_code: StatusCodes.OK,
      message: "matched automation rule actions",
      data: result,
    });
  }
}
