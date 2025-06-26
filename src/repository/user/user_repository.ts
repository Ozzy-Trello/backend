import { validate as isValidUUID } from "uuid";

import {
  filterUserDetail,
  UserDetail,
  UserDetailUpdate,
  UserRepositoryI,
} from "@/repository/user/user_interfaces";
import User from "@/database/schemas/user";
import { Error, Op, where } from "sequelize";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "@/utils/errors";
import { isFilterEmpty, Paginate } from "@/utils/data_utils";
import { Role } from "@/database/schemas/role";
import Permission from "@/database/schemas/permission";

export class UserRepository implements UserRepositoryI {
  createFilter(filter: filterUserDetail): any {
    const whereClause: any = {};
    const orConditions: any[] = [];
    const notConditions: any[] = [];

    if (filter.id) whereClause.id = filter.id;
    if (filter.username) whereClause.username = filter.username;
    if (filter.email) whereClause.email = filter.email;
    if (filter.phone) whereClause.phone = filter.phone;
    if (filter.identify) {
      orConditions.push(
        { username: filter.identify },
        { email: filter.identify },
        { phone: filter.identify }
      );
    }
    if (filter.__orId) orConditions.push({ id: filter.__orId });
    if (filter.__orUsername)
      orConditions.push({ username: filter.__orUsername });
    if (filter.__orEmail) orConditions.push({ email: filter.__orEmail });
    if (filter.__orPhone) orConditions.push({ phone: filter.__orPhone });

    if (filter.__notId) notConditions.push({ id: filter.__notId });
    if (filter.__notUsername)
      notConditions.push({ username: filter.__notUsername });
    if (filter.__notEmail) notConditions.push({ email: filter.__notEmail });
    if (filter.__notPhone) notConditions.push({ phone: filter.__notPhone });

    if (notConditions.length > 0) {
      whereClause[Op.not] = notConditions;
    }

    if (orConditions.length > 0) {
      whereClause[Op.or] = orConditions;
    }
    return whereClause;
  }

  async deleteUser(filter: filterUserDetail): Promise<number> {
    try {
      const user = await User.destroy({ where: this.createFilter(filter) });
      if (user <= 0) {
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

  async createUser(data: UserDetail): Promise<ResponseData<UserDetail>> {
    try {
      let user = await User.create({
        username: data.username,
        email: data.email!,
        phone: data.phone!,
        password: data.getHashedPassword(),
      });
      return new ResponseData({
        status_code: StatusCodes.CREATED,
        message: "create user success",
        data: new UserDetail({
          id: user.id,
          email: user.email,
          phone: user.phone,
          password: data.password,
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

  async getUser(filter: filterUserDetail): Promise<ResponseData<UserDetail>> {
    try {
      let qry = User;
      if (filter.id && !isValidUUID(filter.id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "user id is not valid uuid",
        };
      }
      if (filter.withPassword) {
        qry = User.scope("withPassword");
      }

      let filterData = this.createFilter(filter);
      if (isFilterEmpty(filterData)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "you need filter to get user",
        };
      }

      const user = await qry.findOne({
        where: filterData,
        include: [
          {
            model: Role,
            as: "role",
            include: [
              {
                model: Permission,
                as: "permission",
              },
            ],
          },
        ],
      });
      if (!user) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "user is not found",
        };
      }
      let result = new UserDetail({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        password: user.password,
        role: user.role_id
          ? {
              id: (user as any).role?.id,
              name: (user as any).role?.name,
              description: (user as any).role?.description,
              permission: {
                id: (user as any).role?.permission?.id,
                level: (user as any).role?.permission?.level,
                description: (user as any).role?.permission?.description,
                permissions: (user as any).role?.permission?.permissions,
              },
            }
          : undefined,
      });

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "user detail",
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

  async getUserList(
    filter: filterUserDetail,
    paginate: Paginate
  ): Promise<ResponseListData<Array<UserDetail>>> {
    let qry = User;
    let result: Array<UserDetail> = [];
    if (filter.withPassword) {
      qry = User.scope("withPassword");
    }
    let filterData = this.createFilter(filter);
    paginate.setTotal(await qry.count({ where: filterData }));
    const users = await qry.findAll({
      where: filterData,
      offset: paginate.getOffset(),
      limit: paginate.limit,
    });
    for (const user of users) {
      result.push(
        new UserDetail({
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
        })
      );
    }
    return new ResponseListData(
      {
        status_code: StatusCodes.OK,
        message: "list user",
        data: result,
      },
      paginate
    );
  }

  async updateUser(
    filter: filterUserDetail,
    data: UserDetailUpdate
  ): Promise<number> {
    try {
      let filterData = this.createFilter(filter);
      if (isFilterEmpty(filterData)) {
        return StatusCodes.BAD_REQUEST;
      }
      const effected = await User.update(data.toObject(), {
        where: filterData,
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
