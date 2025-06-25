import { validate as isValidUUID } from "uuid";

import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";
import {
  CardCustomFieldDetail,
  CardCustomFieldResponse,
  CardCustomFieldValueUpdate,
  CustomFieldDetail,
  CustomFieldDetailUpdate,
  filterCustomFieldDetail,
} from "@/repository/custom_field/custom_field_interfaces";
import {
  EnumCustomFieldType,
  EnumCustomFieldSource,
} from "@/types/custom_field";
import { EnumTriggeredBy } from "@/types/event";

export interface CustomFieldControllerI {
  CreateCustomField(
    user_id: string,
    data: CustomFieldCreateData
  ): Promise<ResponseData<CreateCustomFieldResponse>>;
  GetCustomField(
    filter: CustomFieldFilter
  ): Promise<ResponseData<CustomFieldResponse>>;
  GetListCustomField(
    filter: CustomFieldFilter,
    paginate: Paginate,
    user_id?: string
  ): Promise<ResponseListData<Array<CustomFieldResponse>>>;
  DeleteCustomField(filter: CustomFieldFilter): Promise<ResponseData<null>>;
  UpdateCustomField(
    filter: CustomFieldFilter,
    data: UpdateCustomFieldData
  ): Promise<ResponseData<null>>;

  GetListCardCustomField(
    workspace_id: string,
    card_id: string,
    user_id?: string
  ): Promise<ResponseData<Array<CardCustomFieldResponse>>>;
  SetCardCustomFieldValue(
    user_id: string,
    workspace_id: string,
    card_id: string,
    custom_field_id: string,
    data: CardCustomFieldValueUpdate,
    triggeredBy: EnumTriggeredBy
  ): Promise<ResponseData<CardCustomFieldResponse>>;

  ReorderCustomFields(
    user_id: string,
    workspaceId: string,
    customFieldId: string,
    targetPosition: number,
    targetPositionTopOrBottom?: "top" | "bottom"
  ): Promise<ResponseData<null>>;
}

export class CreateCustomFieldResponse {
  id!: string;

  constructor(payload: Partial<CreateCustomFieldResponse>) {
    Object.assign(this, payload);
  }
}

export class CustomFieldResponse {
  id!: string;
  name?: string;
  description?: string;
  source?: EnumCustomFieldSource;
  trigger_id?: string;
  type!: EnumCustomFieldType;
  is_show_at_front!: boolean;
  options?: CustomOptions | string;
  order!: number;
  can_view?: string[];
  can_edit?: string[];

  constructor(payload: Partial<CustomFieldResponse>) {
    Object.assign(this, payload);

    if (typeof this.options === "string") {
      try {
        console.log("parsing to json...");
        this.options = CustomOptions.toJSON(this.options);
        console.log("parsing to json...");
      } catch (e) {
        console.log("gagal parsing: %o: ", e);
        console.error("Invalid options JSON:", e);
      }
    }
  }
}

export function fromCustomFieldDetailToCustomFieldResponse(
  data: CustomFieldDetail
): CustomFieldResponse {
  return new CustomFieldResponse({
    id: data.id,
    name: data.name!,
    description: data.description,
    source: data.source,
    trigger_id: data.trigger?.id,
    can_view: data.can_view,
    can_edit: data.can_edit,
  });
}

export function fromCustomFieldDetailToCustomFieldResponseCustomField(
  data: Array<CustomFieldDetail>
): Array<CustomFieldResponse> {
  let result: Array<CustomFieldResponse> = [];
  for (const datum of data) {
    result.push(fromCustomFieldDetailToCustomFieldResponse(datum));
  }
  return result;
}

export class UpdateCustomFieldData {
  name?: string;
  description?: string;
  workspace_id?: string;
  trigger_id?: string;
  order?: number;
  can_view?: string[];
  can_edit?: string[];

  constructor(payload: Partial<UpdateCustomFieldData>) {
    Object.assign(this, payload);
    this.toCustomFieldDetailUpdate = this.toCustomFieldDetailUpdate.bind(this);
    this.isEmpty = this.isEmpty.bind(this);
    this.getErrorfield = this.getErrorfield.bind(this);
  }

  isEmpty(): boolean {
    return (
      this.name == undefined &&
      this.description == undefined &&
      this.trigger_id == undefined &&
      this.order == undefined &&
      this.can_view == undefined &&
      this.can_edit == undefined
    );
  }

  toCustomFieldDetailUpdate(): CustomFieldDetailUpdate {
    return new CustomFieldDetailUpdate({
      name: this.name,
      description: this.description,
      trigger_id: this.trigger_id,
      order: this.order,
      can_view: this.can_view,
      can_edit: this.can_edit,
    });
  }

  getErrorfield(): string | null {
    if (this.workspace_id && !isValidUUID(this.workspace_id)) {
      return "'workspace_id' is not valid uuid";
    }
    if (this.trigger_id && !isValidUUID(this.trigger_id)) {
      return "'trigger_id' is not valid uuid,";
    }
    return null;
  }
}

export class CustomFieldFilter {
  id?: string;
  name?: string;
  workspace_id?: string;
  description?: string;
  source?: EnumCustomFieldSource;
  trigger_id?: string;

  constructor(payload: Partial<CustomFieldFilter>) {
    Object.assign(this, payload);
    this.isEmpty = this.isEmpty.bind(this);
    this.toFilterCustomFieldDetail = this.toFilterCustomFieldDetail.bind(this);
    this.getErrorfield = this.getErrorfield.bind(this);
  }

  toFilterCustomFieldDetail(): filterCustomFieldDetail {
    return {
      id: this.id,
      name: this.name,
      workspace_id: this.workspace_id,
      source: this.source,
      description: this.description,
      trigger_id: this.trigger_id,
    };
  }

  isEmpty(): boolean {
    return (
      this.id == undefined &&
      this.name == undefined &&
      this.workspace_id == undefined &&
      this.source == undefined &&
      this.description == undefined &&
      this.trigger_id == undefined
    );
  }

  getErrorfield(): string | null {
    if (this.id && !isValidUUID(this.id)) {
      return "'id' is not valid uuid";
    }
    if (this.workspace_id && !isValidUUID(this.workspace_id)) {
      return "'workspace_id' is not valid uuid";
    }
    return null;
  }
}

export class CustomFieldCreateData {
  name!: string;
  description?: string;
  workspace_id!: string;
  source!: EnumCustomFieldSource;
  trigger_id?: string;
  type!: EnumCustomFieldType;
  is_show_at_front!: boolean;
  options?: CustomOptions | string;
  order!: number;
  can_view?: string[];
  can_edit?: string[];

  constructor(payload: Partial<CustomFieldCreateData>) {
    Object.assign(this, payload);
    // Convert options from string to CustomOptions if needed
    if (typeof this.options === "string") {
      try {
        this.options = CustomOptions.toJSON(this.options);
      } catch (e) {
        console.error("Invalid options JSON:", e);
      }
    } else if (this.options && !(this.options instanceof CustomOptions)) {
      // If it's an object but not a DashCardConfig instance
      this.options = new CustomOptions(this.options as any);
    }
    this.toCustomFieldDetail = this.toCustomFieldDetail.bind(this);
    this.checkRequired = this.checkRequired.bind(this);
    this.getErrorField = this.getErrorField.bind(this);
  }

  toCustomFieldDetail(): CustomFieldDetail {
    return new CustomFieldDetail({
      name: this.name,
      description: this.description,
      workspace_id: this.workspace_id,
      source: this.source,
      type: this.type,
      is_show_at_front: this.is_show_at_front,
      options: this.options,
      order: this.order,
      can_view: this.can_view,
      can_edit: this.can_edit,
      trigger: {
        id: this.trigger_id!,
        condition_value: "",
      },
    });
  }

  checkRequired(): string | null {
    if (this.workspace_id == undefined) return "workspace_id";
    if (this.name == undefined) return "name";
    if (this.source == undefined) return "source";
    return null;
  }

  getErrorField(): string | null {
    if (this.workspace_id && !isValidUUID(this.workspace_id!)) {
      return "'workspace_id' is not valid uuid";
    }
    if (this.trigger_id && !isValidUUID(this.trigger_id)) {
      return "'trigger_id' is not valid uuid";
    }
    if (
      this.source &&
      typeof this.source == "string" &&
      !(
        this.source.toLowerCase() == EnumCustomFieldSource.Custom ||
        this.source.toLowerCase() == EnumCustomFieldSource.Product ||
        this.source.toLowerCase() == EnumCustomFieldSource.User
      )
    ) {
      return "'source' sould be 'user','product' or 'custom'";
    }
    return null;
  }
}

export interface CustomOption {
  value: string;
  label: string;
}

export class CustomOptions extends Array<CustomOption> {
  constructor(options?: CustomOption[] | string | null) {
    super();

    // Handle different input types safely
    if (Array.isArray(options)) {
      // Already an array, spread it safely
      this.push(...options);
    } else if (typeof options === "string" && options.trim()) {
      // JSON string from database
      try {
        const parsed = JSON.parse(options);
        if (Array.isArray(parsed)) {
          this.push(...parsed);
        }
        // If parsed is not an array, leave this empty
      } catch (e) {
        // Invalid JSON, leave this empty
        console.warn("Failed to parse options JSON:", options, e);
      }
    }
    // If options is null, undefined, or empty string, leave this as empty array
  }

  validate(): string | null {
    if (!Array.isArray(this)) return "options must be an array";
    return null;
  }

  toString(): string {
    return JSON.stringify(this);
  }

  static toJSON(jsonStr: string | null | undefined): CustomOptions {
    if (!jsonStr) {
      return new CustomOptions();
    }

    try {
      const data = JSON.parse(jsonStr);
      return new CustomOptions(data);
    } catch (e) {
      console.warn(
        "Failed to parse options JSON in static method:",
        jsonStr,
        e
      );
      return new CustomOptions(); // Return empty instead of throwing
    }
  }

  toJSON(): CustomOption[] {
    return [...this];
  }
}
