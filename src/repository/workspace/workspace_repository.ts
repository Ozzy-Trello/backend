import {
  filterWorkspaceDetail,
  WorkspaceDetail,
  WorkspaceDetailUpdate,
  WorkspaceRepositoryI,
} from "@/repository/workspace/workspace_interfaces";
import Workspace from "@/database/schemas/workspace";
import { Error, FindOptions, Includeable, Op, QueryTypes } from "sequelize";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "@/utils/errors";
import { isFilterEmpty, Paginate } from "@/utils/data_utils";
import { WorkspaceMember } from "@/database/schemas/workspace_member";
import db from "@/database";
import { ExpressionBuilder } from "kysely";
import { Database } from "@/types/database";

export class WorkspaceRepository implements WorkspaceRepositoryI {
  createFilter(filter: filterWorkspaceDetail): any {
    const whereClause: any = {};
    const orConditions: any[] = [];
    const notConditions: any[] = [];

    if (filter.id) whereClause.id = filter.id;
    if (filter.name) whereClause.name = filter.name;
    if (filter.description) whereClause.description = filter.description;
    if (filter.slug) whereClause.slug = filter.slug;

    if (filter.__orId) orConditions.push({ id: filter.__orId });
    if (filter.__orName) orConditions.push({ name: filter.__orName });
    if (filter.__orSlug) orConditions.push({ slug: filter.__orSlug });
    if (filter.__orDescription)
      orConditions.push({ description: filter.__orDescription });

    if (filter.__notId) notConditions.push({ id: filter.__notId });
    if (filter.__notName) notConditions.push({ name: filter.__notName });
    if (filter.__notSlug) notConditions.push({ slug: filter.__notSlug });
    if (filter.__notDescription)
      notConditions.push({ description: filter.__notDescription });

    if (notConditions.length > 0) {
      whereClause[Op.not] = notConditions;
    }

    if (orConditions.length > 0) {
      whereClause[Op.or] = orConditions;
    }
    return whereClause;
  }

  createValueFilter(
    eb: ExpressionBuilder<Database, any>,
    filter: filterWorkspaceDetail
  ) {
    let query = eb.and([]); // Inisialisasi sebagai kondisi AND kosong

    if (filter.id) query = eb.and([query, eb("id", "=", filter.id)]);
    if (filter.name) query = eb.and([query, eb("name", "=", filter.name)]);
    if (filter.slug) query = eb.and([query, eb("slug", "=", filter.slug)]);
    if (filter.description)
      query = eb.and([query, eb("description", "=", filter.description)]);

    // OR conditions
    const orConditions = [];
    if (filter.__orId) orConditions.push(eb("id", "=", filter.__orId));
    if (filter.__orName) orConditions.push(eb("name", "=", filter.__orName));
    if (filter.__orSlug) orConditions.push(eb("slug", "=", filter.__orSlug));
    if (filter.__orDescription)
      orConditions.push(eb("description", "=", filter.__orDescription));

    if (orConditions.length > 0) {
      query = eb.and([query, eb.or(orConditions)]);
    }

    // NOT conditions
    const notConditions = [];
    if (filter.__notId) notConditions.push(eb("id", "!=", filter.__notId));
    if (filter.__notName)
      notConditions.push(eb("name", "!=", filter.__notName));

    if (notConditions.length > 0) {
      query = eb.and([query, ...notConditions]);
    }

    return query;
  }

  async deleteWorkspace(filter: filterWorkspaceDetail): Promise<number> {
    try {
      const workspace = await Workspace.destroy({
        where: this.createFilter(filter),
      });
      if (workspace <= 0) {
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

  async createWorkspace(
    data: WorkspaceDetail
  ): Promise<ResponseData<WorkspaceDetail>> {
    try {
      const workspace = await Workspace.create({
        name: data.name!,
        description: data.description!,
        slug: data.slug!,
      });
      return new ResponseData({
        status_code: StatusCodes.CREATED,
        message: "create workspace success",
        data: new WorkspaceDetail({
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          slug: workspace.slug,
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
      const workspace = await WorkspaceMember.create({
        workspace_id: id,
        user_id: user_id,
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
      const workspace = await WorkspaceMember.destroy({
        where: { user_id, workspace_id: id },
      });
      if (workspace <= 0) {
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

  async isMember(id: string, user_id: string): Promise<number> {
    try {
      const total = await WorkspaceMember.count({
        where: { user_id, workspace_id: id },
      });
      if (total <= 0) {
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

  async getWorkspace(
    filter: filterWorkspaceDetail
  ): Promise<ResponseData<WorkspaceDetail>> {
    try {
      if (isFilterEmpty(filter)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "you need filter to get workspace detail",
        };
      }
      let qry = db.selectFrom("workspace").selectAll();
      qry = qry.where((eb) => this.createValueFilter(eb, filter));
      if (filter.user_id_owner) {
        qry = qry
          .innerJoin(
            "workspace_member",
            "workspace.id",
            "workspace_member.workspace_id"
          )
          .where("workspace_member.user_id", "=", filter.user_id_owner);
      }
      let qryResult = await qry.executeTakeFirst();
      if (!qryResult) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "workspace is not found",
        };
      }

      let result = new WorkspaceDetail({
        id: qryResult.id,
        name: qryResult.name,
        description: qryResult.description,
        slug: qryResult.slug,
      });

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "workspace detail",
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

  async getWorkspaceList(
    filter: filterWorkspaceDetail,
    paginate: Paginate
  ): Promise<ResponseListData<Array<WorkspaceDetail>>> {
    let result: Array<WorkspaceDetail> = [];
    let qry = db.selectFrom("workspace");
    if (filter.user_id_owner) {
      qry = qry
        .innerJoin(
          "workspace_member",
          "workspace.id",
          "workspace_member.workspace_id"
        )
        .where("workspace_member.user_id", "=", filter.user_id_owner);
    }
    let total = await qry
      .select(({ fn }) => fn.count<number>("workspace.id").as("total"))
      .executeTakeFirst();
    paginate.setTotal(total?.total!);

    let qryResult = await qry
      .selectAll()
      .offset(paginate.getOffset())
      .limit(paginate.limit)
      .execute();
    qryResult.map((raw) => {
      result.push(
        new WorkspaceDetail({
          id: raw.id,
          name: raw.name,
          description: raw.description,
          slug: raw.slug,
        })
      );
    });

    return new ResponseListData(
      {
        status_code: StatusCodes.OK,
        message: "list workspace",
        data: result,
      },
      paginate
    );
  }

  async updateWorkspace(
    filter: filterWorkspaceDetail,
    data: WorkspaceDetailUpdate
  ): Promise<number> {
    try {
      const effected = await Workspace.update(data.toObject(), {
        where: this.createFilter(filter),
      });
      if (effected[0] == 0) {
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
}
