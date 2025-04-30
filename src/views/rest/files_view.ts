import { FileControllerI, FileCreateData, FileFilter } from "@/controller/file/file_interfaces";
import { Paginate } from "@/utils/data_utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import multer from "multer";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export default class FileRestView {
  private file_controller: FileControllerI;

  constructor(file_controller: FileControllerI) {
    this.file_controller = file_controller;
    
    // Bind methods to preserve 'this' context
    this.uploadFile = this.uploadFile.bind(this);
    this.getFileList = this.getFileList.bind(this);
    this.getFile = this.getFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
  }

  // Middleware function to handle file upload
  uploadMiddleware() {
    return upload.single('file');
  }

  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(StatusCodes.BAD_REQUEST).json({
          "message": "No file uploaded",
        });
        return;
      }

      // Create file data from request
      const fileData = new FileCreateData({
        file: req.file,
        name: req.body.name,
        prefix: req.body.prefix,
        card_id: req.body.card_id
      });

      // Upload file and save metadata
      const fileResponse = await this.file_controller.UploadFile(req.auth!.user_id, fileData);

      if (fileResponse.status_code !== StatusCodes.CREATED) {
        if (fileResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
          res.status(fileResponse.status_code).json({
            "message": "internal server error",
          });
          return;
        }
        res.status(fileResponse.status_code).json({
          "message": fileResponse.message,
        });
        return;
      }
      
      res.status(fileResponse.status_code).json({
        "data": fileResponse.data,
        "message": fileResponse.message
      });
      return;
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        "message": "internal server error",
      });
      return;
    }
  }

  async getFileList(req: Request, res: Response): Promise<void> {
    try {
      // Parse pagination parameters
      let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
      let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
      let paginate = new Paginate(page, limit);
      
      // Create filter from request
      const filter = new FileFilter({
        created_by: req.query.created_by?.toString(),
        card_id: req.query.card_id?.toString(),
        mime_type: req.query.mime_type?.toString()
      });
    
      // Get file list
      const fileResponse = await this.file_controller.GetFileList(filter, paginate);
    
      if (fileResponse.status_code !== StatusCodes.OK) {
        if (fileResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
          res.status(fileResponse.status_code).json({
            "message": "internal server error",
          });
          return;
        }
        res.status(fileResponse.status_code).json({
          "message": fileResponse.message,
        });
        return;
      }
    
      res.status(fileResponse.status_code).json({
        "data": fileResponse.data,
        "message": fileResponse.message,
        "paginate": fileResponse.paginate,
      });
      return;
    } catch (error) {
      console.error("Error getting file list:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        "message": "internal server error",
      });
      return;
    }
  }

  async getFile(req: Request, res: Response): Promise<void> {
    try {
      // Create filter from request
      const filter = new FileFilter({
        id: req.params.id
      });
    
      // Get file
      const fileResponse = await this.file_controller.GetFile(filter);
    
      if (fileResponse.status_code !== StatusCodes.OK) {
        if (fileResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
          res.status(fileResponse.status_code).json({
            "message": "internal server error",
          });
          return;
        }
        res.status(fileResponse.status_code).json({
          "message": fileResponse.message,
        });
        return;
      }
    
      res.status(fileResponse.status_code).json({
        "data": fileResponse.data,
        "message": fileResponse.message
      });
      return;
    } catch (error) {
      console.error("Error getting file:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        "message": "internal server error",
      });
      return;
    }
  }

  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      // Create filter from request
      const filter = new FileFilter({
        id: req.params.id
      });
    
      // Delete file
      const fileResponse = await this.file_controller.DeleteFile(filter);
    
      if (fileResponse.status_code !== StatusCodes.OK) {
        if (fileResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
          res.status(fileResponse.status_code).json({
            "message": "internal server error",
          });
          return;
        }
        res.status(fileResponse.status_code).json({
          "message": fileResponse.message,
        });
        return;
      }
    
      res.status(fileResponse.status_code).json({
        "message": fileResponse.message
      });
      return;
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        "message": "internal server error",
      });
      return;
    }
  }
}