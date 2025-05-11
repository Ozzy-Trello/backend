import AccurateController from "@/controller/accurate/accurate_controller";

export default class AccurateRestView {
  controller: AccurateController;
  public Webhook: (req: any, res: any) => Promise<void>;
  public GetItemCategoryList: (req: any, res: any) => Promise<void>;
  public GetItemCategoryDetail: (req: any, res: any) => Promise<void>;
  public GetItemDetail: (req: any, res: any) => Promise<void>;
  public GetGlaccountList: (req: any, res: any) => Promise<void>;
  public GetItemList: (req: any, res: any) => Promise<void>;
  public SaveItemAdjustment: (req: any, res: any) => Promise<void>;

  constructor(controller: AccurateController) {
    this.controller = controller;
    this.Webhook = this.controller.Webhook.bind(this.controller);
    this.GetItemCategoryList = this.controller.GetItemCategoryList.bind(
      this.controller
    );
    this.GetItemCategoryDetail = this.controller.GetItemCategoryDetail.bind(
      this.controller
    );
    this.GetItemDetail = this.controller.GetItemDetail.bind(this.controller);
    this.GetGlaccountList = this.controller.GetGlaccountList.bind(this.controller);
    this.GetItemList = this.controller.GetItemList.bind(this.controller);
    this.SaveItemAdjustment = this.controller.SaveItemAdjustment.bind(this.controller);
  }
}
