import { SearchControllerI } from "@/controller/search/search_interfaces";
import { Paginate } from "@/utils/data_utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export interface SearchRestViewI {
  UnifiedSearch(req: Request, res: Response): Promise<void>;
}

export default class SearchRestView implements SearchRestViewI {
  private search_controller: SearchControllerI;

  constructor(search_controller: SearchControllerI) {
    this.search_controller = search_controller;
    this.UnifiedSearch = this.UnifiedSearch.bind(this);
  }

  async UnifiedSearch(req: Request, res: Response): Promise<void> {
    try {
      const query =
        req.query.q?.toString() || req.query.query?.toString() || "";
      const workspaceId = req.header("workspace-id")?.toString();
      const userId = req.auth?.user_id;

      let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
      let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
      let paginate = new Paginate(page, limit);

      const searchResponse = await this.search_controller.UnifiedSearch(
        query,
        workspaceId,
        userId,
        paginate
      );

      if (searchResponse.status_code !== StatusCodes.OK) {
        if (searchResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
          res.status(searchResponse.status_code).json({
            message: "internal server error",
          });
          return;
        }
        res.status(searchResponse.status_code).json({
          message: searchResponse.message,
        });
        return;
      }

      res.status(searchResponse.status_code).json({
        data: searchResponse.data,
        message: searchResponse.message,
        paginate: searchResponse.paginate,
      });
    } catch (error) {
      console.error("Search API error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
      });
    }
  }
}
