import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";
import db from "@/database/index";
import {
  ISplitJobRepository,
  SplitJobTemplateDetail,
  SplitJobValueDetail,
  filterSplitJobTemplateDetail,
  filterSplitJobValueDetail
} from "./split_job_interfaces";
import { ResponseData } from "@/utils/response_utils";

export class SplitJobRepository implements ISplitJobRepository {
  // Split Job Template methods
  async createSplitJobTemplate(data: SplitJobTemplateDetail): Promise<ResponseData<SplitJobTemplateDetail>> {
    try {
      const id = data.id || uuidv4();
      const template = await db
        .insertInto("split_job_template")
        .values({
          id,
          name: data.name,
          workspace_id: data.workspace_id,
          custom_field_id: data.custom_field_id,
          description: data.description,
        })
        .returningAll()
        .executeTakeFirst();

      if (!template) {
        return {
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "Failed to create split job template",
          data: undefined,
        };
      }

      return {
        status_code: StatusCodes.CREATED,
        message: "Split job template created successfully",
        data: template as SplitJobTemplateDetail,
      };
    } catch (error) {
      console.error("Error creating split job template:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error creating split job template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async getSplitJobTemplate(filter: filterSplitJobTemplateDetail): Promise<ResponseData<SplitJobTemplateDetail>> {
    try {
      let query = db.selectFrom("split_job_template").selectAll();

      if (filter.id) {
        query = query.where("id", "=", filter.id);
      }
      if (filter.workspace_id) {
        query = query.where("workspace_id", "=", filter.workspace_id);
      }
      if (filter.custom_field_id) {
        query = query.where("custom_field_id", "=", filter.custom_field_id);
      }

      const template = await query.executeTakeFirst();

      if (!template) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Split job template not found",
          data: undefined,
        };
      }

      return {
        status_code: StatusCodes.OK,
        message: "Split job template retrieved successfully",
        data: template as SplitJobTemplateDetail,
      };
    } catch (error) {
      console.error("Error retrieving split job template:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error retrieving split job template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async getSplitJobTemplates(filter: filterSplitJobTemplateDetail): Promise<ResponseData<SplitJobTemplateDetail[]>> {
    try {
      let query = db.selectFrom("split_job_template").selectAll();

      if (filter.workspace_id) {
        query = query.where("workspace_id", "=", filter.workspace_id);
      }
      if (filter.custom_field_id) {
        query = query.where("custom_field_id", "=", filter.custom_field_id);
      }

      const templates = await query.execute();

      return {
        status_code: StatusCodes.OK,
        message: "Split job templates retrieved successfully",
        data: templates as SplitJobTemplateDetail[],
      };
    } catch (error) {
      console.error("Error retrieving split job templates:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error retrieving split job templates: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async updateSplitJobTemplate(id: string, data: Partial<SplitJobTemplateDetail>): Promise<ResponseData<SplitJobTemplateDetail>> {
    try {
      // Remove id from data if present to prevent updating the primary key
      const { id: _, ...updateData } = data;

      const updated = await db
        .updateTable("split_job_template")
        .set({
          ...updateData,
          updated_at: new Date(),
        })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst();

      if (!updated) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Split job template not found",
          data: undefined,
        };
      }

      return {
        status_code: StatusCodes.OK,
        message: "Split job template updated successfully",
        data: updated as SplitJobTemplateDetail,
      };
    } catch (error) {
      console.error("Error updating split job template:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error updating split job template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async deleteSplitJobTemplate(id: string): Promise<ResponseData<boolean>> {
    try {
      // First delete all associated split job values
      await this.deleteSplitJobValuesByTemplate(id);

      // Then delete the template
      const result = await db
        .deleteFrom("split_job_template")
        .where("id", "=", id)
        .execute();

      if (result.length === 0) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Split job template not found",
          data: false,
        };
      }

      return {
        status_code: StatusCodes.OK,
        message: "Split job template deleted successfully",
        data: true,
      };
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
  async createSplitJobValue(data: SplitJobValueDetail): Promise<ResponseData<SplitJobValueDetail>> {
    try {
      const id = data.id || uuidv4();
      const value = await db
        .insertInto("split_job_value")
        .values({
          id,
          name: data.name,
          split_job_template_id: data.split_job_template_id,
          card_id: data.card_id,
          custom_field_id: data.custom_field_id,
          value: data.value,
        })
        .returningAll()
        .executeTakeFirst();

      if (!value) {
        return {
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "Failed to create split job value",
          data: undefined,
        };
      }

      return {
        status_code: StatusCodes.CREATED,
        message: "Split job value created successfully",
        data: value as SplitJobValueDetail,
      };
    } catch (error) {
      console.error("Error creating split job value:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error creating split job value: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async getSplitJobValue(filter: filterSplitJobValueDetail): Promise<ResponseData<SplitJobValueDetail>> {
    try {
      let query = db.selectFrom("split_job_value").selectAll();

      if (filter.id) {
        query = query.where("id", "=", filter.id);
      }
      if (filter.split_job_template_id) {
        query = query.where("split_job_template_id", "=", filter.split_job_template_id);
      }
      if (filter.card_id) {
        query = query.where("card_id", "=", filter.card_id);
      }
      if (filter.custom_field_id) {
        query = query.where("custom_field_id", "=", filter.custom_field_id);
      }

      const value = await query.executeTakeFirst();

      if (!value) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Split job value not found",
          data: undefined,
        };
      }

      return {
        status_code: StatusCodes.OK,
        message: "Split job value retrieved successfully",
        data: value as SplitJobValueDetail,
      };
    } catch (error) {
      console.error("Error retrieving split job value:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error retrieving split job value: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async getSplitJobValues(filter: filterSplitJobValueDetail): Promise<ResponseData<SplitJobValueDetail[]>> {
    try {
      let query = db.selectFrom("split_job_value").selectAll();

      if (filter.split_job_template_id) {
        query = query.where("split_job_template_id", "=", filter.split_job_template_id);
      }
      if (filter.card_id) {
        query = query.where("card_id", "=", filter.card_id);
      }
      if (filter.custom_field_id) {
        query = query.where("custom_field_id", "=", filter.custom_field_id);
      }

      const values = await query.execute();

      return {
        status_code: StatusCodes.OK,
        message: "Split job values retrieved successfully",
        data: values as SplitJobValueDetail[],
      };
    } catch (error) {
      console.error("Error retrieving split job values:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error retrieving split job values: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async updateSplitJobValue(id: string, data: Partial<SplitJobValueDetail>): Promise<ResponseData<SplitJobValueDetail>> {
    try {
      // Remove id from data if present to prevent updating the primary key
      const { id: _, ...updateData } = data;

      const updated = await db
        .updateTable("split_job_value")
        .set({
          ...updateData,
          updated_at: new Date(),
        })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst();

      if (!updated) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Split job value not found",
          data: undefined,
        };
      }

      return {
        status_code: StatusCodes.OK,
        message: "Split job value updated successfully",
        data: updated as SplitJobValueDetail,
      };
    } catch (error) {
      console.error("Error updating split job value:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error updating split job value: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }

  async deleteSplitJobValue(id: string): Promise<ResponseData<boolean>> {
    try {
      const result = await db
        .deleteFrom("split_job_value")
        .where("id", "=", id)
        .execute();

      if (result.length === 0) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Split job value not found",
          data: false,
        };
      }

      return {
        status_code: StatusCodes.OK,
        message: "Split job value deleted successfully",
        data: true,
      };
    } catch (error) {
      console.error("Error deleting split job value:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error deleting split job value: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: false,
      };
    }
  }

  async deleteSplitJobValuesByTemplate(templateId: string): Promise<ResponseData<boolean>> {
    try {
      await db
        .deleteFrom("split_job_value")
        .where("split_job_template_id", "=", templateId)
        .execute();

      return {
        status_code: StatusCodes.OK,
        message: "Split job values deleted successfully",
        data: true,
      };
    } catch (error) {
      console.error("Error deleting split job values by template:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Error deleting split job values by template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: false,
      };
    }
  }
}
