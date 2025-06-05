import { filterAutomationRuleAction, AutomationRuleActionDetail, AutomationRuleActionUpdate, AutomationRuleActionRepositoryI } from "./automation_rule_action_interface";
import AutomationRuleAction from "@/database/schemas/automation_rule_action";
import { Error, literal, Op } from "sequelize";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "@/utils/errors";
import { Paginate } from "@/utils/data_utils";
import { v4 as uuidv4 } from 'uuid';


export class AutomationRuleActionRepository implements AutomationRuleActionRepositoryI {
  createFilter(filter: filterAutomationRuleAction): any {
    const where: any = {};
    const or: any[] = [];
    const not: any[] = [];

    if (filter.id) where.id = filter.id;
    if (filter.rule_id) where.rule_id = filter.rule_id;
    if (filter.rule_ids && filter.rule_ids.length > 0) where.rule_id = { [Op.in]: filter.rule_ids };
    if (filter.group_type) where.group_type = filter.group_type;
    if (filter.type) where.type = filter.type;

    if (filter.__orId) or.push({ id: filter.__orId });
    if (filter.__orRuleId) or.push({ rule_id: filter.__orRuleId });
    if (filter.__orGroupType) or.push({ group_type: filter.__orGroupType });
    if (filter.__orType) or.push({ type: filter.__orType });

    if (filter.__notId) not.push({ id: filter.__notId });
    if (filter.__notRuleId) not.push({ rule_id: filter.__notRuleId });
    if (filter.__notGroupType) not.push({ group_type: filter.__notGroupType });
    if (filter.__notType) not.push({ type: filter.__notType });

    if (filter.condition && typeof filter.condition === 'object') {
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

  async bulkCreateActions(actions: AutomationRuleActionDetail[]): Promise<ResponseData<AutomationRuleActionDetail[]>> {
    try {
      const records = actions.map((a) => ({
        id: a.id || uuidv4(),
        rule_id: a.rule_id || '',
        group_type: a.group_type || '',
        type: a.type || '',
        condition: a.condition,
      }));

      const created = await AutomationRuleAction.bulkCreate(records);

      const details = created.map((item) => new AutomationRuleActionDetail(item.toJSON()));
      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "bulk automation rule actions created",
        data: details,
      });
    } catch (e) {
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, (e instanceof Error ? e.message : String(e)));
    }
  }

  async getAction(filter: filterAutomationRuleAction): Promise<ResponseData<AutomationRuleActionDetail>> {
    try {
      const action = await AutomationRuleAction.findOne({ where: this.createFilter(filter) });
      if (!action) {
        return { status_code: StatusCodes.NOT_FOUND, message: "automation rule action not found" };
      }
      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "automation rule action detail",
        data: new AutomationRuleActionDetail(action.toJSON()),
      });
    } catch (e) {
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, (e instanceof Error ? e.message : String(e)));
    }
  }

  async getActionList(filter: filterAutomationRuleAction, paginate: Paginate): Promise<ResponseListData<Array<AutomationRuleActionDetail>>> {
    const result: AutomationRuleActionDetail[] = [];
    paginate.setTotal(await AutomationRuleAction.count({ where: this.createFilter(filter) }));
    const actions = await AutomationRuleAction.findAll({
      where: this.createFilter(filter),
      offset: paginate.getOffset(),
      limit: paginate.limit,
    });
    for (const action of actions) {
      result.push(new AutomationRuleActionDetail(action.toJSON()));
    }
    return new ResponseListData({
      status_code: StatusCodes.OK,
      message: "list automation rule actions",
      data: result,
    }, paginate);
  }

  async createAction(data: filterAutomationRuleAction): Promise<ResponseData<AutomationRuleActionDetail>> {
    try {
      const action = await AutomationRuleAction.create({
        id: data.id || uuidv4(),
        rule_id: data.rule_id || uuidv4(),
        group_type: data.group_type || '',
        type: data.type || '',
        condition: data.condition || {},
      });
      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "automation rule action created",
        data: new AutomationRuleActionDetail(action.toJSON()),
      });
    } catch (e) {
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, (e instanceof Error ? e.message : String(e)));
    }
  }

  async updateAction(filter: filterAutomationRuleAction, data: AutomationRuleActionUpdate): Promise<number> {
    try {
      const updated = await AutomationRuleAction.update(data.toObject(), { where: this.createFilter(filter) });
      if (updated[0] === 0) return StatusCodes.NOT_FOUND;
      return StatusCodes.NO_CONTENT;
    } catch (e) {
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, (e instanceof Error ? e.message : String(e)));
    }
  }

  async deleteAction(filter: filterAutomationRuleAction): Promise<number> {
    try {
      const deleted = await AutomationRuleAction.destroy({ where: this.createFilter(filter) });
      if (deleted === 0) return StatusCodes.NOT_FOUND;
      return StatusCodes.NO_CONTENT;
    } catch (e) {
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, (e instanceof Error ? e.message : String(e)));
    }
  }

  async getByRuleId(rule_id: string): Promise<ResponseData<AutomationRuleActionDetail[]>> {
    try {
      const actions = await AutomationRuleAction.findAll({ where: { rule_id } });
      if (!actions || actions.length === 0) {
        return new ResponseData({
          status_code: StatusCodes.NOT_FOUND,
          message: "No actions found for this rule",
          data: [],
        });
      }
      const details = actions.map((item) => new AutomationRuleActionDetail(item.toJSON()));
      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "Automation rule actions retrieved successfully",
        data: details,
      });
    } catch (e) {
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, (e instanceof Error ? e.message : String(e)));
    }
  }
}
