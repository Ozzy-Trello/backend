import { IAccurateRepository } from "@/controller/accurate/accurate_interfaces";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SaveItemAdjustmentBody } from "../../repository/accurate/accurate_interfaces";

export default class AccurateController {
  private accurate_repo: IAccurateRepository;

  constructor(accurate_repo: IAccurateRepository) {
    this.accurate_repo = accurate_repo;
  }

  public async Webhook(req: Request, res: Response): Promise<void> {
    try {
      const { access_token, expires_in } = req.body;
      if (!access_token || !expires_in) {
        res.status(400).json({
          status_code: 400,
          message: "Missing token or expires_in",
          data: null,
        });
        return;
      }
      const expiry_date = new Date(Date.now() + Number(expires_in) * 1000);
      const insertData = await this.accurate_repo.addToken(
        access_token,
        expiry_date
      );
      const safeResult = Array.isArray(insertData)
        ? insertData.map((obj) => ({
            ...obj,
            numInsertedOrUpdatedRows: obj.numInsertedOrUpdatedRows
              ? Number(obj.numInsertedOrUpdatedRows)
              : obj.numInsertedOrUpdatedRows,
          }))
        : insertData;
      res.status(StatusCodes.OK).json({
        status_code: StatusCodes.OK,
        message: "Token inserted/updated successfully",
        data: safeResult,
      });
      return;
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      });
      return;
    }
  }

  public async GetItemCategoryList(_: Request, res: Response): Promise<any> {
    try {
      const result = await this.accurate_repo.getItemCategoryList();
      res.status(StatusCodes.OK).json({
        status_code: StatusCodes.OK,
        message: "Item category list fetched successfully",
        data: result,
      });
      return;
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      });
      return;
    }
  }

  public async GetItemCategoryDetail(
    req: Request,
    res: Response
  ): Promise<any> {
    try {
      const result = await this.accurate_repo.getItemCategoryDetail(
        +req.params.id
      );
      res.status(StatusCodes.OK).json({
        status_code: StatusCodes.OK,
        message: "Item category detail fetched successfully",
        data: result,
      });
      return;
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      });
      return;
    }
  }

  public async GetItemDetail(req: Request, res: Response): Promise<any> {
    try {
      const result = await this.accurate_repo.getItemDetail(+req.params.id);
      res.status(StatusCodes.OK).json({
        status_code: StatusCodes.OK,
        message: "Item detail fetched successfully",
        data: result,
      });
      return;
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      });
      return;
    }
  }

  public async GetGlaccountList(req: Request, res: Response): Promise<any> {
    try {
      const result = await this.accurate_repo.getGlaccountList();
      
      res.status(StatusCodes.OK).json({
        status_code: StatusCodes.OK,
        message: "Glaccount list fetched successfully",
        data: result,
      });
      return;
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      });
      return;
    }
  }

  public async GetItemList(req: Request, res: Response): Promise<any> {
    try {
      // Get search parameter from query string if it exists
      const search = req.query.search as string | undefined;
      
      // Pass the search parameter to the repository method
      const result = await this.accurate_repo.getItemList(search);
      
      res.status(StatusCodes.OK).json({
        status_code: StatusCodes.OK,
        message: "Item list fetched successfully",
        data: result,
      });
      return;
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      });
      return;
    }
  }

  public async SaveItemAdjustment(req: Request, res: Response): Promise<void> {
    try {
      const body: SaveItemAdjustmentBody = req.body;
      const result = await this.accurate_repo.saveItemAdjustment(body);
      res.status(200).json({ data: result, message: "Item adjustment saved" });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }
}
