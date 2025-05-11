import { RequestController } from "@/controller/request/request_controller";
import { Request, Response } from "express";

export default class RequestRestView {
  controller: RequestController;
  public Create: (req: Request, res: Response) => Promise<void>;
  public Verify: (req: Request, res: Response) => Promise<void>;
  public GetAllRequests: (req: Request, res: Response) => Promise<void>;

  constructor(controller: RequestController) {
    this.controller = controller;
    this.Create = this.controller.Create.bind(this.controller);
    this.Verify = this.controller.Verify.bind(this.controller);
    this.GetAllRequests = this.controller.GetAllRequests.bind(this.controller);
  }
}
