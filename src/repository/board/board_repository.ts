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
import { Role } from "@/database/schemas/role";

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

  async createBoard(
    data: BoardDetail & { roleIds?: string[] }
  ): Promise<ResponseData<BoardDetail>> {
    if (!data.name) {
      throw new Error("Board name is required");
    }

    if (!data.workspace_id) {
      throw new Error("Workspace ID is required");
    }

    try {
      // Generate a new UUID for the board
      const boardId = crypto.randomUUID();
      const now = new Date();

      // Create the board
      const [board] = await db
        .insertInto("board")
        .values({
          id: boardId,
          name: data.name,
          description: data.description || "",
          background: data.background || "",
          workspace_id: data.workspace_id,
          created_by: data.created_by,
          updated_by: data.updated_by || data.created_by,
          created_at: now,
          updated_at: now,
          visibility: "public", // Default visibility
        } as any) // Type assertion to bypass strict type checking
        .returningAll()
        .execute();

      // Assign roles if provided
      const roleIds = data.roleIds || [];
      if (roleIds.length > 0) {
        // Insert role assignments in batch
        await db.transaction().execute(async (trx) => {
          await Promise.all(
            roleIds.map((roleId) =>
              trx
                .insertInto("board_roles" as any) // Type assertion as a workaround
                .values({
                  board_id: board.id,
                  role_id: roleId,
                  created_at: new Date(),
                  updated_at: new Date(),
                })
                .execute()
            )
          );
        });
      }

      // Return the created board
      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "Board created successfully",
        data: new BoardDetail({
          id: board.id,
          name: board.name,
          description: board.description || undefined,
          background: board.background || undefined,
          workspace_id: board.workspace_id,
        }),
      });
    } catch (error) {
      console.error("Error creating board:", error);
      throw new Error("Failed to create board");
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

  async removeMember(id: string): Promise<number> {
    try {
      const board = await BoardRole.destroy({
        where: { board_id: id },
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

  async isMember(id: string): Promise<boolean> {
    try {
      const count = await BoardRole.count({
        where: { board_id: id },
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
      const board = (await Board.findOne({
        where: this.createFilter(filter),
      })) as any;

      if (!board?.id) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "board is not found",
        };
      }

      const boardRoles = await BoardRole.findAll({
        where: { board_id: board.id },
      });

      if (!boardRoles || boardRoles.length === 0) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "board roles not found",
        };
      }

      const roleData = await Role.findAll({
        where: {
          id: boardRoles.map((role: BoardRole) => role.role_id),
        },
      });

      const result = new BoardDetail({
        id: board.id,
        name: board.name,
        description: board.description,
        background: board.background,
        workspace_id: board.workspace_id,
        roleIds: roleData.map((role: Role) => role.id),
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
        String(e)
      );
    }
  }

  async getBoardList(
    filter: filterBoardDetail & { userId?: string },
    paginate: Paginate
  ): Promise<ResponseListData<Array<BoardDetail>>> {
    try {
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

      // query = query.offset(paginate.getOffset()).limit(paginate.limit);

      query = query.orderBy("created_at", "asc");

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
    data: BoardDetailUpdate & { roleIds?: string[] }
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
