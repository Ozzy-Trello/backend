import { Request, Response } from 'express';
import { LabelController } from '@/controller/label/label_controller';
import { LabelControllerI } from '@/controller/label/label_interfaces';
import { Paginate } from '@/utils/data_utils';
import { LabelAttributes } from '@/database/schemas/label';
import { filterLabelDetail } from '@/repository/label/label_interfaces';
import { ResponseData, ResponseListData } from '@/utils/response_utils';
import { LabelRestViewI } from './interfaces';

export default class LabelRestView implements LabelRestViewI {
  private controller: LabelControllerI;
  constructor(controller: LabelControllerI) {
    this.controller = controller;
    this.CreateLabel = this.CreateLabel.bind(this);
    this.GetLabel = this.GetLabel.bind(this);
    this.GetLabels = this.GetLabels.bind(this);
    this.UpdateLabel = this.UpdateLabel.bind(this);
    this.DeleteLabel = this.DeleteLabel.bind(this);
  }
  async CreateLabel(req: Request, res: Response): Promise<void> {
    const { name, value, value_type, workspace_id } = req.body;
    const result = await this.controller.CreateLabel({ name, value, value_type, workspace_id });
    res.status(result.status_code).json({
      data: result.data,
      message: result.message,
    });
  }

  async GetLabel(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await this.controller.GetLabel({ id });
    res.status(result.status_code).json({
      data: result.data,
      message: result.message,
    });
  }

  async GetLabels(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    const paginate = new Paginate(page, limit);
    // Support filter by name, value, value_type via query
    const filter: filterLabelDetail = {};
    if (req.query.name) filter.name = req.query.name.toString();
    if (req.query.value) filter.value = req.query.value.toString();
    if (req.query.value_type) filter.value_type = req.query.value_type as any;
    const result = await this.controller.GetLabelList(filter, paginate);
    res.status(result.status_code).json({
      data: result.data,
      message: result.message,
      paginate: result.paginate,
    });
  }

  async UpdateLabel(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, value, value_type } = req.body;
    const result = await this.controller.UpdateLabel({ id }, { name, value, value_type });
    res.status(result.status_code).json({
      data: result.data,
      message: result.message,
    });
  }

  async DeleteLabel(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await this.controller.DeleteLabel({ id });
    res.status(result.status_code).json({
      message: result.message,
    });
  }
  
}
