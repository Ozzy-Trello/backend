import { FileControllerI, FileCreateData, FileFilter, FileResponse } from "./file_interfaces";
import { FileDetail, FileRepositoryI, filterFileDetail } from "@/repository/file/file_interface";
import { Paginate } from "@/utils/data_utils";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { UploadFile } from "@/services/storage/upload.service";
import { getFileSizeUnit } from "@/utils/file_utils"; // You'll need to create this utility
import { RepositoryContext } from "@/repository/repository_context";

export class FileController implements FileControllerI {
  private repository_context: RepositoryContext;
  
  constructor(repository_context: RepositoryContext) {
    this.repository_context = repository_context;
  }
  
  async UploadFile(userId: string, data: FileCreateData): Promise<ResponseData<FileResponse>> {
    try {
      // Validate the request
      const requiredField = data.checkRequired();
      if (requiredField) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: `${requiredField} is required`,
          data: undefined
        };
      }
      
      if (data.isEmpty()) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "empty data",
          data: undefined
        };
      }
      
      // Prepare file path with prefix if provided
      let filePath = data.file.originalname;
      if (data.prefix) {
        filePath = `${data.prefix}/${filePath}`;
      }
      
      // Upload to S3
      const uploadResult = await UploadFile({
        ...data.file,
        originalname: filePath
      });
      
      // Get appropriate size unit (KB, MB, etc)
      const { size, unit } = getFileSizeUnit(data.file.size);
      
      // Save file metadata to database
      const fileDetail = new FileDetail({
        name: data.name,
        url: uploadResult.fileUrl,
        size: size,
        size_unit: unit,
        mime_type: data.file.mimetype,
        created_by: userId,
      });
      
      const saveResult = await this.repository_context.file.createFile(fileDetail);
      
      if (saveResult.status_code !== StatusCodes.CREATED) {
        return {
          status_code: saveResult.status_code,
          message: saveResult.message,
          data: undefined
        };
      }
      
      // Convert to response format
      const fileResponse = new FileResponse({
        id: saveResult.data!.id!,
        name: saveResult.data!.name,
        url: saveResult.data!.url,
        size: saveResult.data!.size,
        size_unit: saveResult.data!.size_unit,
        mime_type: saveResult.data!.mime_type,
        created_by: saveResult.data!.created_by!,
        created_at: saveResult.data!.created_at!,
      });
      
      return {
        status_code: StatusCodes.CREATED,
        message: "File uploaded successfully",
        data: fileResponse
      };
    } catch (error) {
      console.error("Error in FileController.UploadFile:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to upload file",
        data: undefined
      };
    }
  }
  
  async GetFile(filter: FileFilter): Promise<ResponseData<FileResponse>> {
    try {
      // Validate the filter
      const errorField = filter.getErrorField();
      if (errorField) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: errorField,
          data: undefined
        };
      }
      
      // Convert to repository filter format
      const repoFilter: filterFileDetail = {
        id: filter.id,
        name: filter.name,
        created_by: filter.created_by,
        mime_type: filter.mime_type
      };
      
      // Get file from repository
      const result = await this.repository_context.file.getFile(repoFilter);
      
      if (result.status_code !== StatusCodes.OK) {
        return {
          status_code: result.status_code,
          message: result.message,
          data: undefined
        };
      }
      
      // Convert to response format
      const fileResponse = new FileResponse({
        id: result.data!.id!,
        name: result.data!.name,
        url: result.data!.url,
        size: result.data!.size,
        size_unit: result.data!.size_unit,
        mime_type: result.data!.mime_type,
        created_by: result.data!.created_by!,
        created_at: result.data!.created_at!,
      });
      
      return {
        status_code: StatusCodes.OK,
        message: "File details retrieved successfully",
        data: fileResponse
      };
    } catch (error) {
      console.error("Error in FileController.GetFile:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve file",
        data: undefined
      };
    }
  }
  
  async GetFileList(filter: FileFilter, paginate: Paginate): Promise<ResponseListData<Array<FileResponse>>> {
    try {
      // Convert to repository filter format
      const repoFilter: filterFileDetail = {
        id: filter.id,
        name: filter.name,
        created_by: filter.created_by,
        mime_type: filter.mime_type
      };
      
      // Get files from repository
      const result = await this.repository_context.file.getFileList(repoFilter, paginate);
      
      if (result.status_code !== StatusCodes.OK) {
        return {
          status_code: result.status_code,
          message: result.message,
          data: [],
          paginate: paginate
        };
      }
      
      // Convert to response format
      const fileResponses = result.data!.map(file => new FileResponse({
        id: file.id!,
        name: file.name,
        url: file.url,
        size: file.size,
        size_unit: file.size_unit,
        mime_type: file.mime_type,
        created_by: file.created_by!,
        created_at: file.created_at!,
      }));
      
      return {
        status_code: StatusCodes.OK,
        message: "File list retrieved successfully",
        data: fileResponses,
        paginate: result.paginate
      };
    } catch (error) {
      console.error("Error in FileController.GetFileList:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve file list",
        data: [],
        paginate: paginate
      };
    }
  }
  
  async DeleteFile(filter: FileFilter): Promise<ResponseData<null>> {
    try {
      // Validate the filter
      const errorField = filter.getErrorField();
      if (errorField) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: errorField,
          data: null
        };
      }
      
      if (filter.isEmpty()) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Filter cannot be empty",
          data: null
        };
      }
      
      // Convert to repository filter format
      const repoFilter: filterFileDetail = {
        id: filter.id,
        name: filter.name,
        created_by: filter.created_by,
        mime_type: filter.mime_type
      };
      
      // Delete file from repository
      // The file is not yet deleted in S3
      const status = await this.repository_context.file.deleteFile(repoFilter);
      
      if (status === StatusCodes.NOT_FOUND) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "File not found",
          data: null
        };
      }
      
      return {
        status_code: StatusCodes.OK,
        message: "File deleted successfully",
        data: null
      };
    } catch (error) {
      console.error("Error in FileController.DeleteFile:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to delete file",
        data: null
      };
    }
  }
}