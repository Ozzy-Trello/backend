import db from "@/database";
import {
  BoardDetail,
  BoardDetailUpdate,
  BoardRepositoryI,
  filterBoardDetail,
} from "@/repository/board/board_interfaces";
import { Paginate } from "@/utils/data_utils";
import { InternalServerError } from "@/utils/errors";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { sql } from "kysely";
import Board from "@/database/schemas/board";
import { BoardRole } from "@/database/schemas/board_role";
import { Op } from "sequelize";

export class BoardRepository implements BoardRepositoryI {
  createFilter(filter: filterBoardDetail): any {
    const whereClause: any = {};
    const orConditions: any[] = [];
    const notConditions: any[] = [];

    if (filter.id) whereClause.id = filter.id;
    if (filter.name) whereClause.name = filter.name;
    if (filter.description) whereClause.description = filter.description;
    if (filter.workspace_id) whereClause.workspace_id = filter.workspace_id;

    if (filter.__orId) orConditions.push({ id: filter.__orId });
    if (filter.__orName) orConditions.push({ name: filter.__orName });
    if (filter.__orDescription)
      orConditions.push({ description: filter.__orDescription });
    if (filter.__orWorkspaceId)
      orConditions.push({ workspace_id: filter.__orWorkspaceId });

    if (filter.__notId) notConditions.push({ id: filter.__notId });
    if (filter.__notName) notConditions.push({ name: filter.__notName });
    if (filter.__notDescription)
      notConditions.push({ description: filter.__notDescription });
    if (filter.__notWorkspaceId)
      notConditions.push({ workspace_id: filter.__notWorkspaceId });

    if (notConditions.length > 0) {
      whereClause[Op.not] = notConditions;
    }

    if (orConditions.length > 0) {
      whereClause[Op.or] = orConditions;
    }
    return whereClause;
  }

  async deleteBoard(filter: filterBoardDetail): Promise<number> {
    try {
      const board = await Board.destroy({ where: this.createFilter(filter) });
      if (board <= 0) {
        return StatusCodes.NOT_FOUND;
      }
      return StatusCodes.NO_CONTENT;
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          e.message
        );
      }
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e as string
      );
    }
  }

  async createBoard(data: BoardDetail): Promise<ResponseData<BoardDetail>> {
    try {
      const board = await Board.create({
        name: data.name!,
        description: data.description!,
        background: data.background!,
        workspace_id: data.workspace_id,
      });
      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "create board success",
        data: new BoardDetail({
          id: board.id,
          name: board.name,
          description: board.description,
          background: board.background,
          workspace_id: board.workspace_id,
        }),
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          e.message
        );
      }
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e as string
      );
    }
  }

  async addMember(
    id: string,
    user_id: string,
    role_id: string
  ): Promise<number> {
    try {
      await BoardRole.create({
        board_id: id,
        user_id: user_id,
        role_id: role_id,
      });
      return StatusCodes.NO_CONTENT;
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          e.message
        );
      }
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e as string
      );
    }
  }

  async removeMember(id: string, user_id: string): Promise<number> {
    try {
      const board = await BoardRole.destroy({
        where: { user_id, board_id: id },
      });
      if (board <= 0) {
        return StatusCodes.NOT_FOUND;
      }
      return StatusCodes.NO_CONTENT;
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          e.message
        );
      }
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e as string
      );
    }
  }

  async isMember(id: string, user_id: string): Promise<boolean> {
    try {
      const count = await BoardRole.count({
        where: { user_id, board_id: id },
      });
      return count > 0;
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          e.message
        );
      }
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e as string
      );
    }
  }

  async getBoard(
    filter: filterBoardDetail
  ): Promise<ResponseData<BoardDetail>> {
    try {
      const board = await Board.findOne({ where: this.createFilter(filter) });
      if (!board) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "board is not found",
        };
      }
      let result = new BoardDetail({
        id: board.id,
        name: board.name,
        description: board.description,
        background: board.background,
        workspace_id: board.workspace_id,
      });

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "board detail",
        data: result,
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          e.message
        );
      }
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e as string
      );
    }
  }

  async getBoardList(
    filter: filterBoardDetail & { userId?: string },
    paginate: Paginate
  ): Promise<ResponseListData<Array<BoardDetail>>> {
    try {
      console.log(filter, "<< ini filter");

      let query = db.selectFrom("board").selectAll();

      if (filter.id) query = query.where("board.id", "=", filter.id);
      if (filter.name) query = query.where("board.name", "=", filter.name);
      if (filter.description)
        query = query.where("board.description", "=", filter.description);
      if (filter.workspace_id)
        query = query.where("board.workspace_id", "=", filter.workspace_id);

      if (
        filter.__orId ||
        filter.__orName ||
        filter.__orDescription ||
        filter.__orWorkspaceId
      ) {
        query = query.where((eb) => {
          const orConditions = [];
          if (filter.__orId)
            orConditions.push(eb("board.id", "=", filter.__orId));
          if (filter.__orName)
            orConditions.push(eb("board.name", "=", filter.__orName));
          if (filter.__orDescription)
            orConditions.push(
              eb("board.description", "=", filter.__orDescription)
            );
          if (filter.__orWorkspaceId)
            orConditions.push(
              eb("board.workspace_id", "=", filter.__orWorkspaceId)
            );
          return eb.or(orConditions);
        });
      }

      if (filter.__notId) query = query.where("board.id", "!=", filter.__notId);
      if (filter.__notName)
        query = query.where("board.name", "!=", filter.__notName);
      if (filter.__notDescription)
        query = query.where("board.description", "!=", filter.__notDescription);
      if (filter.__notWorkspaceId)
        query = query.where(
          "board.workspace_id",
          "!=",
          filter.__notWorkspaceId
        );

      if (filter.userId) {
        type UserWithRole = { id: string; role_id?: string };
        const user = (await db
          .selectFrom("user")
          .selectAll()
          .where("id", "=", filter.userId)
          .executeTakeFirst()) as UserWithRole | undefined;

        console.log(user, "<< ini isi user");

        if (!user) {
          throw new InternalServerError(
            StatusCodes.NOT_FOUND,
            "User not found"
          );
        }

        query = query.where(({ or }) => {
          const publicBoardsCondition = sql<boolean>`board.visibility = 'public'`;

          const roleMembershipCondition = user?.role_id
            ? sql<boolean>`EXISTS (
                SELECT 1 FROM board_roles 
                WHERE board_roles.board_id = board.id 
                AND board_roles.role_id = ${user.role_id}
              )`
            : sql<boolean>`FALSE`;

          return or([publicBoardsCondition, roleMembershipCondition]);
        });
      }

      let countQuery = db
        .selectFrom("board")
        .select((eb) => eb.fn.countAll().as("count"));

      if (filter.id) countQuery = countQuery.where("id", "=", filter.id);
      if (filter.name) countQuery = countQuery.where("name", "=", filter.name);
      if (filter.description)
        countQuery = countQuery.where("description", "=", filter.description);
      if (filter.workspace_id)
        countQuery = countQuery.where("workspace_id", "=", filter.workspace_id);

      const countResult = await countQuery.executeTakeFirst();
      const total = Number(countResult?.count || 0);

      paginate.setTotal(total);

      query = query.offset(paginate.getOffset()).limit(paginate.limit);

      const boards = await query.execute();

      const result = boards.map((board) => {
        const typedBoard = board as unknown as {
          id: string;
          name: string;
          description: string;
          background: string;
          workspace_id: string;
          visibility: string;
          created_at: Date;
          updated_at: Date;
        };

        return {
          id: typedBoard.id,
          name: typedBoard.name,
          description: typedBoard.description,
          background: typedBoard.background,
          workspace_id: typedBoard.workspace_id,
          visibility: typedBoard.visibility,
          created_at: typedBoard.created_at,
          updated_at: typedBoard.updated_at,
        };
      });

      return new ResponseListData(
        {
          status_code: StatusCodes.OK,
          message: "list board",
          data: result,
        },
        paginate
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  async updateBoard(
    filter: filterBoardDetail,
    data: BoardDetailUpdate & { roleIds?: string[] },
    userRole?: string[]
  ): Promise<number> {
    try {
      const board = await Board.findOne({
        where: this.createFilter(filter),
      });

      if (!board) {
        return StatusCodes.NOT_FOUND;
      }

      const [affectedCount] = await Board.update(data, {
        where: this.createFilter(filter),
      });

      return affectedCount > 0 ? StatusCodes.NO_CONTENT : StatusCodes.NOT_FOUND;
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          e.message
        );
      }
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e as string
      );
    }
  }
}
