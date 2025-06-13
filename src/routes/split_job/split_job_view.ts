import express, { Request, Response, Router } from "express";
import { ISplitJobController } from "@/controller/split_job/split_job_interfaces";

export interface ISplitJobRestView {
  router: Router;
}

export class SplitJobRestView implements ISplitJobRestView {
  public router: Router;
  private controller: ISplitJobController;

  constructor(controller: ISplitJobController) {
    this.controller = controller;
    this.router = express.Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Split Job Template routes
    this.router.post("/templates", this.createSplitJobTemplate.bind(this));
    this.router.get("/templates", this.getSplitJobTemplates.bind(this));
    this.router.get("/templates/:id", this.getSplitJobTemplate.bind(this));
    this.router.put("/templates/:id", this.updateSplitJobTemplate.bind(this));
    this.router.delete("/templates/:id", this.deleteSplitJobTemplate.bind(this));

    // Split Job Value routes
    this.router.post("/values", this.createSplitJobValue.bind(this));
    this.router.get("/values", this.getSplitJobValues.bind(this));
    this.router.get("/values/:id", this.getSplitJobValue.bind(this));
    this.router.put("/values/:id", this.updateSplitJobValue.bind(this));
    this.router.delete("/values/:id", this.deleteSplitJobValue.bind(this));
    
    // Custom grouped endpoints
    this.router.get("/values-by-custom-field", this.getSplitJobValuesByCustomField.bind(this));
  }

  // Split Job Template handlers
  private async createSplitJobTemplate(req: Request, res: Response): Promise<void> {
    const result = await this.controller.CreateSplitJobTemplate(req);
    res.status(result.status_code).json(result);
  }

  private async getSplitJobTemplate(req: Request, res: Response): Promise<void> {
    const result = await this.controller.GetSplitJobTemplate(req);
    res.status(result.status_code).json(result);
  }

  private async getSplitJobTemplates(req: Request, res: Response): Promise<void> {
    const result = await this.controller.GetSplitJobTemplates(req);
    res.status(result.status_code).json(result);
  }

  private async updateSplitJobTemplate(req: Request, res: Response): Promise<void> {
    const result = await this.controller.UpdateSplitJobTemplate(req);
    res.status(result.status_code).json(result);
  }

  private async deleteSplitJobTemplate(req: Request, res: Response): Promise<void> {
    const result = await this.controller.DeleteSplitJobTemplate(req);
    res.status(result.status_code).json(result);
  }

  // Split Job Value handlers
  private async createSplitJobValue(req: Request, res: Response): Promise<void> {
    const result = await this.controller.CreateSplitJobValue(req);
    res.status(result.status_code).json(result);
  }

  private async getSplitJobValue(req: Request, res: Response): Promise<void> {
    const result = await this.controller.GetSplitJobValue(req);
    res.status(result.status_code).json(result);
  }

  private async getSplitJobValues(req: Request, res: Response): Promise<void> {
    const result = await this.controller.GetSplitJobValues(req);
    res.status(result.status_code).json(result);
  }

  private async updateSplitJobValue(req: Request, res: Response): Promise<void> {
    const result = await this.controller.UpdateSplitJobValue(req);
    res.status(result.status_code).json(result);
  }

  private async deleteSplitJobValue(req: Request, res: Response): Promise<void> {
    const result = await this.controller.DeleteSplitJobValue(req);
    res.status(result.status_code).json(result);
  }

  private async getSplitJobValuesByCustomField(req: Request, res: Response): Promise<void> {
    const result = await this.controller.GetSplitJobValuesByCustomField(req);
    res.status(result.status_code).json(result);
  }
}
