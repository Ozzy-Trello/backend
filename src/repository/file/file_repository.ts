import { validate as isValidUUID } from 'uuid';
import { filterFileDetail, FileDetail, FileDetailUpdate, FileRepositoryI } from "./file_interface";
import { Error, Op } from "sequelize";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "@/utils/errors";
import { isFilterEmpty, Paginate } from "@/utils/data_utils";
import File from '@/database/schemas/file';

export class FileRepository implements FileRepositoryI {
  createFilter(filter: filterFileDetail): any {
    const whereClause: any = {};

    if (filter.id) whereClause.id = filter.id;
    if (filter.name) whereClause.name = { [Op.like]: `%${filter.name}%` };
    if (filter.created_by) whereClause.created_by = filter.created_by;
    if (filter.mime_type) whereClause.mime_type = filter.mime_type;
    
    return whereClause;
  }

  async deleteFile(filter: filterFileDetail): Promise<number> {
    try {
      const file = await File.destroy({ where: this.createFilter(filter) });
      if (file <= 0) {
        return StatusCodes.NOT_FOUND;
      }
      return StatusCodes.NO_CONTENT;
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }

  async createFile(data: FileDetail): Promise<ResponseData<FileDetail>> {
    try {
      let file = await File.create({
        name: data.name,
        url: data.url,
        size: data.size,
        size_unit: data.size_unit,
        mime_type: data.mime_type,
        created_by: data.created_by ?? '',
      });
      
      return new ResponseData({
        status_code: StatusCodes.CREATED,
        message: "create file success",
        data: new FileDetail({
          id: file.id,
          name: file.name,
          url: file.url,
          size: file.size,
          size_unit: file.size_unit,
          mime_type: file.mime_type,
          created_by: file.created_by,
          created_at: file.created_at,
          updated_at: file.updated_at
        })
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }

  async getFile(filter: filterFileDetail): Promise<ResponseData<FileDetail>> {
    try {
      if (filter.id && !isValidUUID(filter.id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "file id is not valid uuid",
        };
      }

      let filterData = this.createFilter(filter);
      if (isFilterEmpty(filterData)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "you need filter to get file",
        };
      }

      const file = await File.findOne({ where: filterData });
      if (!file) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "file is not found",
        };
      }
      
      let result = new FileDetail({
        id: file.id,
        name: file.name,
        url: file.url,
        size: file.size,
        size_unit: file.size_unit,
        mime_type: file.mime_type,
        created_by: file.created_by,
        created_at: file.created_at,
        updated_at: file.updated_at
      });

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "file detail",
        data: result,
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }

  async getFileList(filter: filterFileDetail, paginate: Paginate): Promise<ResponseListData<Array<FileDetail>>> {
    try {
      let result: Array<FileDetail> = [];
      let filterData = this.createFilter(filter);
      
      paginate.setTotal(await File.count({ where: filterData }));
      
      const files = await File.findAll({
        where: filterData,
        offset: paginate.getOffset(),
        limit: paginate.limit,
        order: [['created_at', 'DESC']]
      });
      
      for (const file of files) {
        result.push(new FileDetail({
          id: file.id,
          name: file.name,
          url: file.url,
          size: file.size,
          size_unit: file.size_unit,
          mime_type: file.mime_type,
          created_by: file.created_by,
          created_at: file.created_at,
          updated_at: file.updated_at
        }));
      }
      
      return new ResponseListData({
        status_code: StatusCodes.OK,
        message: "list file",
        data: result,
      }, paginate);
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }

  async updateFile(filter: filterFileDetail, data: FileDetailUpdate): Promise<number> {
    try {
      let filterData = this.createFilter(filter);
      if (isFilterEmpty(filterData)) {
        return StatusCodes.BAD_REQUEST;
      }
      
      const effected = await File.update(data.toObject(), { where: filterData });
      if (effected[0] == 0) {
        return StatusCodes.NOT_FOUND;
      }
      
      return StatusCodes.NO_CONTENT;
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }
}