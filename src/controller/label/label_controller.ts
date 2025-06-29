import { ResponseData } from '@/utils/response_utils';
import { LabelAttributes } from '@/database/schemas/label';
import { Paginate } from '@/utils/data_utils';
import { StatusCodes } from 'http-status-codes';
import { CardLabelDetail, CreateCardLabelData, filterLabelDetail } from '@/repository/label/label_interfaces';
import { LabelControllerI } from '@/controller/label/label_interfaces';
import { filterWorkspaceDetail } from '@/repository/workspace/workspace_interfaces';
import { RepositoryContext } from '@/repository/repository_context';

export class LabelController implements LabelControllerI {
  private repository_context: RepositoryContext;
  constructor(repository_context: RepositoryContext) {
    this.repository_context = repository_context;
    this.CreateLabel = this.CreateLabel.bind(this);
    this.GetLabel = this.GetLabel.bind(this);
    this.GetLabels = this.GetLabels.bind(this);
    this.UpdateLabel = this.UpdateLabel.bind(this);
    this.DeleteLabel = this.DeleteLabel.bind(this);
  }

  async CreateLabel(
    data: Omit<LabelAttributes, "id" | "created_at" | "updated_at">
  ): Promise<ResponseData<LabelAttributes>> {
    if (!data.name) {
      return new ResponseData({
        message: "'name' is required",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    const workspace = await this.repository_context.workspace.getWorkspace(new filterWorkspaceDetail({id: data.workspace_id}))
    if (workspace.status_code != StatusCodes.OK) {
      let msg = "internal server error";
      if (workspace.status_code == StatusCodes.NOT_FOUND) {
        msg = "workspace is not found";
      }
      return new ResponseData({
        message: msg,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    const result = await this.repository_context.label.createLabel(data);
    if (result.status_code !== StatusCodes.OK) {
      return new ResponseData({
        message: result.message,
        status_code: result.status_code,
      });
    }
    return new ResponseData({
      message: "Label created successfully",
      status_code: StatusCodes.CREATED,
      data: result.data,
    });
  }

  async GetLabel(
    filter: filterLabelDetail
  ): Promise<ResponseData<LabelAttributes>> {
    if (!filter || Object.keys(filter).length === 0) {
      return new ResponseData({
        message: "You need to provide a filter to get label data",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    const result = await this.repository_context.label.getLabel(filter);
    if (result.status_code !== StatusCodes.OK) {
      return new ResponseData({
        message: result.message,
        status_code: result.status_code,
      });
    }
    return new ResponseData({
      message: result.message,
      status_code: result.status_code,
      data: result.data,
    });
  }

  // async GetLabelList(filter: filterLabelDetail, paginate: Paginate): Promise<ResponseListData<LabelAttributes[]>> {
  //   const workspace = await this.workspace_repo.getWorkspace(new filterWorkspaceDetail({id: filter.workspace_id}))
  //   if (workspace.status_code != StatusCodes.OK) {
  //     let msg = "internal server error"
  //     if (workspace.status_code == StatusCodes.NOT_FOUND){
  //       msg = "workspace is not found"
  //     }
  //     return new ResponseListData({
  //       message: msg,
  //       status_code: StatusCodes.BAD_REQUEST,
  //     }, paginate);
  //   }
  //   const result = await this.repo.getLabels(filter, paginate);
  //   return new ResponseListData({
  //     message: result.message,
  //     status_code: result.status_code,
  //     data: result.data,
  //   }, result.paginate);
  // }

  async UpdateLabel(
    filter: filterLabelDetail,
    data: Partial<LabelAttributes>
  ): Promise<ResponseData<LabelAttributes>> {
    if (!filter || Object.keys(filter).length === 0) {
      return new ResponseData({
        message: "You need filter to update",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    if (!data || Object.keys(data).length === 0) {
      return new ResponseData({
        message: "You need data to update",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    const workspace = await this.repository_context.workspace.getWorkspace(new filterWorkspaceDetail({id: filter.workspace_id}))
    if (workspace.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: workspace.message,
        status_code: workspace.status_code,
      });
    }

    if (data.workspace_id) {
      const workspace = await this.repository_context.workspace.getWorkspace(new filterWorkspaceDetail({id: data.workspace_id}))
      if (workspace.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: workspace.message,
          status_code: workspace.status_code,
        });
      }
    }

    // Only support update by id for now
    if (!filter.id) {
      return new ResponseData({
        message: "id is required for update",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    const result = await this.repository_context.label.updateLabel(filter.id, data);
    if (result.status_code !== StatusCodes.OK) {
      return new ResponseData({
        message: result.message,
        status_code: result.status_code,
      });
    }
    return new ResponseData({
      message: "Label updated successfully",
      status_code: StatusCodes.OK,
      data: result.data,
    });
  }

  async DeleteLabel(filter: filterLabelDetail): Promise<ResponseData<null>> {
    if (!filter || Object.keys(filter).length === 0) {
      return new ResponseData({
        message: "You need filter to delete",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    if (filter.workspace_id) {
      return new ResponseData({
        message: "You cannot delete label by workspace_id",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    if (!filter.id) {
      return new ResponseData({
        message: "id is required for delete",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    const result = await this.repository_context.label.deleteLabel(filter.id);
    if (result.status_code !== StatusCodes.NO_CONTENT) {
      return new ResponseData({
        message: result.message,
        status_code: result.status_code,
      });
    }
    return new ResponseData({
      message: "Label deleted successfully",
      status_code: StatusCodes.NO_CONTENT,
    });
  }

  async AddLabelToCard(
    data: CreateCardLabelData
  ): Promise<ResponseData<CardLabelDetail>> {
    if (!data.card_id || !data.label_id || !data.created_by) {
      return new ResponseData({
        message: "'card_id', 'label_id', and 'created_by' are required",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    const result = await this.repository_context.label.addLabelToCard(data);
    if (result.status_code !== StatusCodes.OK) {
      return new ResponseData({
        message: result.message,
        status_code: result.status_code,
      });
    }
    return new ResponseData({
      message: "Label added to card successfully",
      status_code: StatusCodes.CREATED,
      data: result.data,
    });
  }

  async RemoveLabelFromCard(label_id: string, card_id: string): Promise<ResponseData<null>> {
    const result = await this.repository_context.label.removeLabelFromCard(label_id, card_id);
    if (result.status_code !== StatusCodes.NO_CONTENT) {
      return new ResponseData({
        message: result.message,
        status_code: result.status_code,
      });
    }
    return new ResponseData({
      message: "Label removed from Card successfully",
      status_code: StatusCodes.NO_CONTENT,
    });
  }

  async GetLabels(
    workspace_id: string,
    card_id: string,
    paginate: Paginate
  ): Promise<ResponseData<CardLabelDetail[]>> {
    if (!workspace_id || !card_id) {
      return new ResponseData({
        message: "'workspace_id' and 'card_id' are required",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    const result = await this.repository_context.label.getLabels(workspace_id, card_id, paginate);
    if (result.status_code !== StatusCodes.OK) {
      return new ResponseData({
        message: result.message,
        status_code: result.status_code,
      });
    }
    return new ResponseData({
      message: "Card labels retrieved successfully",
      status_code: StatusCodes.OK,
      data: result.data,
    });
  }

  async GetAssignedLabelInCard(
    workspace_id: string,
    card_id: string
  ): Promise<ResponseData<CardLabelDetail[]>> {
    if (!workspace_id || !card_id) {
      return new ResponseData({
        message: "'workspace_id' and 'card_id' are required",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    const result = await this.repository_context.label.getAssignedLabelInCard(workspace_id, card_id);
    if (result.status_code !== StatusCodes.OK) {
      return new ResponseData({
        message: result.message,
        status_code: result.status_code,
      });
    }
    return new ResponseData({
      message: "Card labels retrieved successfully",
      status_code: StatusCodes.OK,
      data: result.data,
    });
  }

  async GetAllLabels(
    workspace_id: string
  ): Promise<ResponseData<LabelAttributes[]>> {
    console.log("baba all controller");
    if (!workspace_id) {
      return new ResponseData({
        message: "'workspace_id' is required",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    const result = await this.repository_context.label.getAllLabels(workspace_id);
    if (result.status_code !== StatusCodes.OK) {
      return new ResponseData({
        message: result.message,
        status_code: result.status_code,
      });
    }
    return new ResponseData({
      message: "Labels retrieved successfully",
      status_code: StatusCodes.OK,
      data: result.data,
    });
  }

  async RemoveAllLabelsFromCard(card_id: string): Promise<ResponseData<null>> {
    const result = await this.repository_context.label.removeAllLabelsFromCard(
      card_id
    );
    if (result.status_code !== StatusCodes.NO_CONTENT) {
      return new ResponseData({
        message: result.message,
        status_code: result.status_code,
      });
    }
    return new ResponseData({
      message: "All labels removed from card successfully",
      status_code: StatusCodes.NO_CONTENT,
    });
  }
}
