import { Request, Response } from "express";
import { LabelControllerI } from "@/controller/label/label_interfaces";
import { Paginate } from "@/utils/data_utils";
import { LabelRestViewI } from "./interfaces";

export default class LabelRestView implements LabelRestViewI {
  private controller: LabelControllerI;
  constructor(controller: LabelControllerI) {
    this.controller = controller;
    this.CreateLabel = this.CreateLabel.bind(this);
    this.GetLabel = this.GetLabel.bind(this);
    this.GetLabels = this.GetLabels.bind(this);
    this.UpdateLabel = this.UpdateLabel.bind(this);
    this.DeleteLabel = this.DeleteLabel.bind(this);
    this.AddLabelToCard = this.AddLabelToCard.bind(this);
    this.RemoveLabelFromCard = this.RemoveLabelFromCard.bind(this);
    this.GetAssignedLabelInCard = this.GetAssignedLabelInCard.bind(this);
    this.GetAllLabels = this.GetAllLabels.bind(this);
  }
  async CreateLabel(req: Request, res: Response): Promise<void> {
    const { name, value, value_type, workspace_id } = req.body;
    const result = await this.controller.CreateLabel({
      name,
      value,
      value_type,
      workspace_id,
    });
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

  async UpdateLabel(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, value, value_type } = req.body;
    const result = await this.controller.UpdateLabel(
      { id },
      { name, value, value_type }
    );
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

  async AddLabelToCard(req: Request, res: Response): Promise<void> {
    const card_id = req.params.id?.toString();
    const { label_id } = req.body;
    const workspace_id = req.header("workspace-id")?.toString();
    if (!workspace_id) {
      res.status(400).json({ message: "workspace-id header is required" });
      return;
    }
    const user_id = req.auth!.user_id;
    const result = await this.controller.AddLabelToCard({
      card_id: card_id,
      label_id: label_id,
      created_by: user_id,
      workspace_id: workspace_id,
    });
    res.status(result.status_code).json({
      data: result.data,
      message: result.message,
    });
  }

  async RemoveLabelFromCard(req: Request, res: Response): Promise<void> {
    const { id, label_id } = req.params;
    const result = await this.controller.RemoveLabelFromCard(label_id, id);
    res.status(result.status_code).json({
      message: result.message,
    });
  }

  async GetLabels(req: Request, res: Response): Promise<void> {
    const card_id = req.query.card_id?.toString();
    const workspace_id = req.header("workspace-id")?.toString();
    if (!workspace_id) {
      res.status(400).json({ message: "workspace-id header is required" });
      return;
    }
    const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    const paginate = new Paginate(page, limit);
    const result = await this.controller.GetLabels(
      workspace_id,
      card_id || "",
      paginate
    );
    res.status(result.status_code).json({
      data: result.data,
      message: result.message,
    });
  }

  async GetAssignedLabelInCard(req: Request, res: Response): Promise<void> {
    const card_id = req.params.id?.toString();
    const workspace_id = req.header("workspace-id")?.toString();
    if (!workspace_id) {
      res.status(400).json({ message: "workspace-id header is required" });
      return;
    }
    const result = await this.controller.GetAssignedLabelInCard(
      workspace_id,
      card_id || ""
    );
    res.status(result.status_code).json({
      data: result.data,
      message: result.message,
    });
  }

  async GetAllLabels(req: Request, res: Response): Promise<void> {
    const workspace_id = req.header("workspace-id")?.toString();
    if (!workspace_id) {
      res.status(400).json({ message: "workspace-id header is required" });
      return;
    }
    const result = await this.controller.GetAllLabels(workspace_id);
    res.status(result.status_code).json({
      data: result.data,
      message: result.message,
    });
  }
}
