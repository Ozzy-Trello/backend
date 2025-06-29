import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { GroupedSplitJobValues, ISplitJobController } from "./split_job_interfaces";
import { 
  ISplitJobRepository, 
  SplitJobTemplateDetail, 
  SplitJobValueDetail,
  filterSplitJobTemplateDetail,
  filterSplitJobValueDetail
} from "@/repository/split_job/split_job_interfaces";
import { ResponseData } from "@/utils/response_utils";
import { WorkspaceRepositoryI, filterWorkspaceDetail } from "@/repository/workspace/workspace_interfaces";
import { CustomFieldRepositoryI, filterCustomFieldDetail } from "@/repository/custom_field/custom_field_interfaces";
import { RepositoryContext } from "@/repository/repository_context";

export class SplitJobController implements ISplitJobController {
  private repository_context: RepositoryContext;

  constructor(repository_context: RepositoryContext) {
    this.repository_context = repository_context;
  }

  // Split Job Template methods
  async CreateSplitJobTemplate(req: Request): Promise<ResponseData<SplitJobTemplateDetail>> {
    try {
      const { name, workspace_id, custom_field_id, description } = req.body;

      // Validate required fields
      if (!name || !workspace_id || !custom_field_id) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Missing required fields: name, workspace_id, or custom_field_id",
          data: undefined,
        };
      }

      // Verify workspace exists
      const workspaceFilter = new filterWorkspaceDetail({ id: workspace_id });
      const workspaceResponse = await this.repository_context.workspace.getWorkspace(workspaceFilter);
      if (workspaceResponse.status_code !== StatusCodes.OK || !workspaceResponse.data) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid workspace_id: Workspace not found",
          data: undefined,
        };
      }

      // Verify custom field exists and is a number type
      const customFieldFilter: filterCustomFieldDetail = { id: custom_field_id };
      const customFieldResponse = await this.repository_context.custom_field.getCustomField(customFieldFilter);
      if (customFieldResponse.status_code !== StatusCodes.OK || !customFieldResponse.data) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid custom_field_id: Custom field not found",
          data: undefined,
        };
      }

      // Verify custom field is a number type
      if (customFieldResponse.data.type !== "number") {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Custom field must be of type 'number' for split jobs",
          data: undefined,
        };
      }

      // Create the split job template
      const templateData: SplitJobTemplateDetail = {
        name,
        workspace_id,
        custom_field_id,
        description,
      };

      return await this.repository_context.split_job.createSplitJobTemplate(templateData);
    } catch (error) {
      console.error("Error creating split job template:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error creating split job template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async GetSplitJobTemplate(req: Request): Promise<ResponseData<SplitJobTemplateDetail>> {
    try {
      const { id } = req.params;

      if (!id) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Template ID is required",
          data: undefined,
        };
      }

      const filter: filterSplitJobTemplateDetail = { id };
      return await this.repository_context.split_job.getSplitJobTemplate(filter);
    } catch (error) {
      console.error("Error retrieving split job template:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error retrieving split job template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async GetSplitJobTemplates(req: Request): Promise<ResponseData<SplitJobTemplateDetail[]>> {
    try {
      const { workspace_id, custom_field_id } = req.query;

      const filter: filterSplitJobTemplateDetail = {};
      
      if (workspace_id) {
        filter.workspace_id = workspace_id as string;
      }
      
      if (custom_field_id) {
        filter.custom_field_id = custom_field_id as string;
      }

      return await this.repository_context.split_job.getSplitJobTemplates(filter);
    } catch (error) {
      console.error("Error retrieving split job templates:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error retrieving split job templates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async UpdateSplitJobTemplate(req: Request): Promise<ResponseData<SplitJobTemplateDetail>> {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      if (!id) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Template ID is required",
          data: undefined,
        };
      }

      // Check if template exists
      const templateFilter: filterSplitJobTemplateDetail = { id };
      const templateResponse = await this.repository_context.split_job.getSplitJobTemplate(templateFilter);
      if (templateResponse.status_code !== StatusCodes.OK || !templateResponse.data) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Split job template not found",
          data: undefined,
        };
      }

      // Update only allowed fields (name and description)
      const updateData: Partial<SplitJobTemplateDetail> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      return await this.repository_context.split_job.updateSplitJobTemplate(id, updateData);
    } catch (error) {
      console.error("Error updating split job template:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error updating split job template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async DeleteSplitJobTemplate(req: Request): Promise<ResponseData<boolean>> {
    try {
      const { id } = req.params;

      if (!id) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Template ID is required",
          data: false,
        };
      }

      // Check if template exists
      const templateFilter: filterSplitJobTemplateDetail = { id };
      const templateResponse = await this.repository_context.split_job.getSplitJobTemplate(templateFilter);
      if (templateResponse.status_code !== StatusCodes.OK || !templateResponse.data) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Split job template not found",
          data: false,
        };
      }

      // Delete the template (this will also delete associated values)
      return await this.repository_context.split_job.deleteSplitJobTemplate(id);
    } catch (error) {
      console.error("Error deleting split job template:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error deleting split job template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: false,
      };
    }
  }

  // Split Job Value methods
  async CreateSplitJobValue(req: Request): Promise<ResponseData<SplitJobValueDetail>> {
    try {
      const { name, split_job_template_id, card_id, value } = req.body;

      // Validate required fields
      if (!name || !split_job_template_id || !card_id || value === undefined) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Missing required fields: name, split_job_template_id, card_id, or value",
          data: undefined,
        };
      }

      // Verify template exists
      const templateFilter: filterSplitJobTemplateDetail = { id: split_job_template_id };
      const templateResponse = await this.repository_context.split_job.getSplitJobTemplate(templateFilter);
      if (templateResponse.status_code !== StatusCodes.OK || !templateResponse.data) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid split_job_template_id: Template not found",
          data: undefined,
        };
      }

      // Create the split job value
      const valueData: SplitJobValueDetail = {
        name,
        split_job_template_id,
        card_id,
        custom_field_id: templateResponse.data.custom_field_id,
        value: Number(value),
      };

      return await this.repository_context.split_job.createSplitJobValue(valueData);
    } catch (error) {
      console.error("Error creating split job value:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error creating split job value: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async GetSplitJobValue(req: Request): Promise<ResponseData<SplitJobValueDetail>> {
    try {
      const { id } = req.params;

      if (!id) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Value ID is required",
          data: undefined,
        };
      }

      const filter: filterSplitJobValueDetail = { id };
      return await this.repository_context.split_job.getSplitJobValue(filter);
    } catch (error) {
      console.error("Error retrieving split job value:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error retrieving split job value: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async GetSplitJobValues(req: Request): Promise<ResponseData<SplitJobValueDetail[]>> {
    try {
      const { split_job_template_id, card_id, custom_field_id } = req.query;

      const filter: filterSplitJobValueDetail = {};
      
      if (split_job_template_id) {
        filter.split_job_template_id = split_job_template_id as string;
      }
      
      if (card_id) {
        filter.card_id = card_id as string;
      }
      
      if (custom_field_id) {
        filter.custom_field_id = custom_field_id as string;
      }

      return await this.repository_context.split_job.getSplitJobValues(filter);
    } catch (error) {
      console.error("Error retrieving split job values:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error retrieving split job values: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async UpdateSplitJobValue(req: Request): Promise<ResponseData<SplitJobValueDetail>> {
    try {
      const { id } = req.params;
      const { name, value } = req.body;

      if (!id) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Value ID is required",
          data: undefined,
        };
      }

      // Check if value exists
      const valueFilter: filterSplitJobValueDetail = { id };
      const valueResponse = await this.repository_context.split_job.getSplitJobValue(valueFilter);
      if (valueResponse.status_code !== StatusCodes.OK || !valueResponse.data) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Split job value not found",
          data: undefined,
        };
      }

      // Update only allowed fields (name and value)
      const updateData: Partial<SplitJobValueDetail> = {};
      if (name !== undefined) updateData.name = name;
      if (value !== undefined) updateData.value = Number(value);

      return await this.repository_context.split_job.updateSplitJobValue(id, updateData);
    } catch (error) {
      console.error("Error updating split job value:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error updating split job value: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async DeleteSplitJobValue(req: Request): Promise<ResponseData<boolean>> {
    try {
      const { id } = req.params;

      if (!id) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Value ID is required",
          data: false,
        };
      }

      // Check if value exists
      const valueFilter: filterSplitJobValueDetail = { id };
      const valueResponse = await this.repository_context.split_job.getSplitJobValue(valueFilter);
      if (valueResponse.status_code !== StatusCodes.OK || !valueResponse.data) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Split job value not found",
          data: false,
        };
      }

      // Delete the value
      return await this.repository_context.split_job.deleteSplitJobValue(id);
    } catch (error) {
      console.error("Error deleting split job value:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error deleting split job value: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: false,
      };
    }
  }

  async GetSplitJobValuesByCustomField(req: Request): Promise<ResponseData<GroupedSplitJobValues>> {
    try {
      const { card_id } = req.query;

      if (!card_id) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Card ID is required",
          data: {},
        };
      }

      // Get all split job values for this card
      const filter: filterSplitJobValueDetail = { card_id: card_id as string };
      const valuesResponse = await this.repository_context.split_job.getSplitJobValues(filter);

      if (valuesResponse.status_code !== StatusCodes.OK || !valuesResponse.data) {
        return {
          status_code: valuesResponse.status_code,
          message: valuesResponse.message,
          data: {},
        };
      }

      const values = valuesResponse.data;
      const result: GroupedSplitJobValues = {};

      // For each value, get the custom field name
      for (const value of values) {
        // Get custom field details
        const customFieldFilter = { id: value.custom_field_id };
        const customFieldResponse = await this.repository_context.custom_field.getCustomField(customFieldFilter);
        
        if (customFieldResponse.status_code === StatusCodes.OK && customFieldResponse.data) {
          const customFieldName = customFieldResponse.data.name || 'Unknown Field';
          
          // Initialize array if this is the first value for this custom field
          if (!result[customFieldName]) {
            result[customFieldName] = [];
          }
          
          // Add the value to the appropriate group
          result[customFieldName].push(value);
        } else {
          // If we can't find the custom field, group under 'Unknown Field'
          const fallbackName = 'Unknown Field';
          
          if (!result[fallbackName]) {
            result[fallbackName] = [];
          }
          
          result[fallbackName].push(value);
        }
      }

      return {
        status_code: StatusCodes.OK,
        message: "Split job values grouped by custom field",
        data: result,
      };
    } catch (error) {
      console.error("Error retrieving split job values by custom field:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error retrieving split job values by custom field: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: {},
      };
    }
  }
}
