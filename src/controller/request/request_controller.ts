import { IRequestRepository } from "./request_interfaces";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { IAccurateRepository } from "../accurate/accurate_interfaces";
import { AdjustmentType } from "@/repository/accurate/enum";

export class RequestController {
  private requestRepo: IRequestRepository;
  private accurateRepo: IAccurateRepository;

  constructor(
    requestRepo: IRequestRepository,
    accurateRepo: IAccurateRepository
  ) {
    this.requestRepo = requestRepo;
    this.accurateRepo = accurateRepo;
  }

  public async Create(req: Request, res: Response): Promise<void> {
    try {
      const {
        card_id,
        request_type,
        requested_item_id,
        request_amount,
        adjustment_no,
        description,
        item_name,
        adjustment_name,
      } = req.body;
      console.log(req.body, "<< in ireq body");
      const newRequest = await this.requestRepo.createRequest({
        card_id,
        request_type,
        requested_item_id,
        request_amount,
        adjustment_no,
        description,
        item_name,
        adjustment_name,
      });
      res.status(StatusCodes.CREATED).json({
        status_code: StatusCodes.CREATED,
        message: "Request created successfully",
        data: newRequest,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to create request",
        error,
      });
    }
  }

  public async GetAllRequests(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page?.toString() || "1");
      const limit = parseInt(req.query.limit?.toString() || "10");

      const { requests, total } = await this.requestRepo.getAllRequests(
        page,
        limit
      );

      res.status(StatusCodes.OK).json({
        status_code: StatusCodes.OK,
        message: "Requests retrieved successfully",
        data: requests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error(error, "<< in req controller");
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve requests",
        error,
      });
    }
  }

  public async Verify(req: Request, res: Response): Promise<void> {
    try {
      const id = +req.params.id;
      const updated = await this.requestRepo.verifyRequest(+id);
      const formattedDate = new Date()
        .toISOString()
        .slice(0, 10)
        .split("-")
        .reverse()
        .join("/");

      if (!updated) {
        res.status(StatusCodes.NOT_FOUND).json({
          status_code: StatusCodes.NOT_FOUND,
          message: "Request not found or already verified",
        });
        return;
      }

      try {
        const adjustItem = await this.accurateRepo.saveItemAdjustment({
          adjustmentAccountNo: updated.adjustment_no,
          description: `${updated.request_type}_${updated.card_name}_${updated.request_amount} PCS_${updated.description}`,
          detailItem: [
            {
              itemAdjustmentType:
                updated.request_type === "REJECT"
                  ? AdjustmentType.OUT
                  : AdjustmentType.IN,
              quantity: updated.request_amount,
              itemNo: updated.requested_item_id,
            },
          ],
          transDate: formattedDate,
        });

        res.status(StatusCodes.OK).json({
          status_code: StatusCodes.OK,
          message: "Request verified successfully",
          data: updated,
          adjustment: adjustItem.data ? adjustItem.data.d : null,
        });
      } catch (adjustmentError) {
        await this.requestRepo.unverifyRequest(id);
        console.log(adjustmentError, "<< ini adjustment error");

        res.status(StatusCodes.BAD_REQUEST).json({
          status_code: StatusCodes.BAD_REQUEST,
          message:
            "Failed to process adjustment in Accurate, verification rolled back",
          error: adjustmentError,
        });
      }
    } catch (error) {
      console.log(error, "<< ini error");
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to verify request",
        error,
      });
    }
  }
}
