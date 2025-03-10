import { validate as isValidUUID } from 'uuid';

import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { Paginate } from "@/utils/data_utils";
import { CardRepositoryI } from '@/repository/card/card_interfaces';
import { CreateCardResponse, fromCardDetailToCardResponse, fromCardDetailToCardResponseCard, CardControllerI, CardCreateData, CardFilter, CardResponse, UpdateCardData, fromCustomFieldDetailToCustomFieldResponseCard, AssignCardResponse } from '@/controller/card/card_interfaces';
import { ListRepositoryI } from '@/repository/list/list_interfaces';
import { CustomFieldRepositoryI } from '@/repository/custom_field/custom_field_interfaces';

export class CardController implements CardControllerI {
  private card_repo: CardRepositoryI
  private list_repo: ListRepositoryI
  private custom_field_repo: CustomFieldRepositoryI

  constructor(card_repo: CardRepositoryI, list_repo: ListRepositoryI, custom_field_repo: CustomFieldRepositoryI) {
    this.card_repo = card_repo;
    this.list_repo = list_repo;
    this.custom_field_repo = custom_field_repo;
    this.GetCard = this.GetCard.bind(this);
    this.GetListCard = this.GetListCard.bind(this);
    this.DeleteCard = this.DeleteCard.bind(this);
    this.UpdateCard = this.UpdateCard.bind(this);
    this.CreateCard = this.CreateCard.bind(this);
  }
  async UpdateCustomField(card_id: string, custom_field_id: string, value: string): Promise<ResponseData<null>> {
    if (!isValidUUID(card_id)){
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    if (!isValidUUID(custom_field_id)){
      return new ResponseData({
        message: "'custom_field_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    let checkCard = await this.card_repo.getCard({id: card_id});
    if (checkCard.status_code != StatusCodes.OK){
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      })  
    }

    let checkCustomField = await this.custom_field_repo.getCustomField({id: custom_field_id});
    if (checkCustomField.status_code != StatusCodes.OK){
      return new ResponseData({
        message: checkCustomField.message,
        status_code: checkCustomField.status_code,
      })  
    }

    throw new Error('Method not implemented.');
  }

  async AddCustomField(card_id: string, custom_field_id: string): Promise<ResponseData<null>> {
    if (!isValidUUID(card_id)){
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    if (!isValidUUID(custom_field_id)){
      return new ResponseData({
        message: "'custom_field_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    let checkCard = await this.card_repo.getCard({id: card_id});
    if (checkCard.status_code != StatusCodes.OK){
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      })  
    }

    let checkCustomField = await this.custom_field_repo.getCustomField({id: custom_field_id});
    if (checkCustomField.status_code != StatusCodes.OK){
      return new ResponseData({
        message: checkCustomField.message,
        status_code: checkCustomField.status_code,
      })  
    }

    let assignCustomFieldRes = await this.custom_field_repo.assignToCard(custom_field_id, card_id);
    if (assignCustomFieldRes != StatusCodes.NO_CONTENT){
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR
      })  
    }

    return new ResponseData({
      message: "Success",
      status_code: StatusCodes.NO_CONTENT,
    })
  }

  async RemoveCustomField(card_id: string, custom_field_id: string): Promise<ResponseData<null>> {
    if (!isValidUUID(card_id)){
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    if (!isValidUUID(custom_field_id)){
      return new ResponseData({
        message: "'custom_field_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    let checkCard = await this.card_repo.getCard({id: card_id});
    if (checkCard.status_code != StatusCodes.OK){
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      })  
    }

    let checkCustomField = await this.custom_field_repo.getCustomField({id: custom_field_id});
    if (checkCustomField.status_code != StatusCodes.OK){
      return new ResponseData({
        message: checkCustomField.message,
        status_code: checkCustomField.status_code,
      })  
    }

    let assignCustomFieldRes = await this.custom_field_repo.unAssignFromCard(custom_field_id, card_id);
    if (assignCustomFieldRes != StatusCodes.NO_CONTENT){
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR
      })  
    }

    return new ResponseData({
      message: "Success",
      status_code: StatusCodes.NO_CONTENT,
    })
  }

  async GetListCustomField(card_id: string, paginate: Paginate): Promise<ResponseListData<Array<AssignCardResponse>>> {
    if (!isValidUUID(card_id)){
      return new ResponseListData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      }, paginate)
    }

    let checkCard = await this.card_repo.getCard({id: card_id});
    if (checkCard.status_code != StatusCodes.OK){
      return new ResponseListData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      }, paginate)  
    }

    let res = await this.custom_field_repo.getListAssignCard(card_id, paginate);
    if (res.status_code != StatusCodes.OK){
      return new ResponseListData({
        message: res.message,
        status_code: res.status_code
      }, paginate)
    }

    return new ResponseListData({
      message: "list of custom field on this card",
      status_code: StatusCodes.OK,
      data: fromCustomFieldDetailToCustomFieldResponseCard(res.data!)
    }, paginate)
  }

  async CreateCard(user_id: string, data: CardCreateData): Promise<ResponseData<CreateCardResponse>> {
    let paylodCheck = data.checkRequired();
    if (paylodCheck) {
      return new ResponseData({
        message: `you need to put '${paylodCheck}'`,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    let errorField = data.getErrorField();
    if (errorField) {
      return new ResponseData({
        message: errorField,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    
    let workspace = await this.list_repo.getList({id: data.list_id})
    if (workspace.status_code != StatusCodes.OK) {
      let msg = "internal server error"
      if (workspace.status_code == StatusCodes.NOT_FOUND){
        msg = "list is not found"
      }
      return new ResponseData({
        message: msg,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    let checkList = await this.card_repo.getCard({ list_id: data.list_id, name: data.name });
    if (checkList.status_code == StatusCodes.OK) {
      return new ResponseData({
        message: "card name already exist on your board",
        status_code: StatusCodes.CONFLICT,
      })
    }

    let createResponse = await this.card_repo.createCard(data.toCardDetail());
    if (createResponse.status_code == StatusCodes.INTERNAL_SERVER_ERROR) {
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }

    return new ResponseData({
      message: "Card created successfully",
      status_code: StatusCodes.CREATED,
      data: new CreateCardResponse({
        id: createResponse.data?.id,
      }),
    })
  }

  async GetCard(filter: CardFilter): Promise<ResponseData<CardResponse>> {
    if (filter.isEmpty()){
      return new ResponseData({
        message: "you need to put filter to get list data",
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    let errorFiled =  filter.getErrorfield();
    if (errorFiled){
      return new ResponseData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    if(filter.list_id){
      let checkList = await this.list_repo.getList({id: filter.list_id});
      if (checkList.status_code == StatusCodes.NOT_FOUND){
        return new ResponseData({
          message: checkList.message,
          status_code: checkList.status_code,
        })  
      }
    }

    let checkList = await this.card_repo.getCard(filter.toFilterCardDetail());
    if (checkList.status_code != StatusCodes.OK){
      return new ResponseData({
        message: checkList.message,
        status_code: checkList.status_code,
      })  
    }

    return new ResponseData({
      message: checkList.message,
      status_code: checkList.status_code,
      data: fromCardDetailToCardResponse(checkList.data!),
    })
  }

  async GetListCard(filter: CardFilter, paginate: Paginate): Promise<ResponseListData<Array<CardResponse>>> {
    let errorFiled =  filter.getErrorfield();
    if (errorFiled){
      return new ResponseListData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST
      }, paginate)
    }

    if(filter.list_id){
      let checkList = await this.list_repo.getList({id: filter.list_id});
      if (checkList.status_code != StatusCodes.OK){
        return new ResponseListData({
          message: checkList.message,
          status_code: StatusCodes.BAD_REQUEST
        }, paginate)
      }
    }

    let cards = await this.card_repo.getListCard(filter.toFilterCardDetail(), paginate);
    return new ResponseListData({
      message: "Card list",
      status_code: StatusCodes.OK,
      data: fromCardDetailToCardResponseCard(cards.data!),
    }, cards.paginate)
  }

  async DeleteCard(filter: CardFilter): Promise<ResponseData<null>> {
    if (filter.isEmpty()) {
      return new ResponseData({
        message: "you need filter to delete",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    let errorFiled = filter.getErrorfield();
    if (errorFiled){
      return new ResponseData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    if(filter.list_id){
      let checkList = await this.list_repo.getList({id: filter.list_id});
      if (checkList.status_code != StatusCodes.OK){
        return new ResponseData({
          message: checkList.message,
          status_code: StatusCodes.BAD_REQUEST,
        })
      }
    }
    const deleteResponse = await this.card_repo.deleteCard(filter);
    if (deleteResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Card is not found",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    return new ResponseData({
      message: "Card is deleted successful",
      status_code: StatusCodes.NO_CONTENT,
    })
  }

  async UpdateCard(filter: CardFilter, data: UpdateCardData): Promise<ResponseData<null>> {
    if (filter.isEmpty()) {
      return new ResponseData({
        message: "you need filter to update",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    if (data.isEmpty()) {
      return new ResponseData({
        message: "you need data to update",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    let errorFiled = filter.getErrorfield();
    if (errorFiled){
      return new ResponseData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }
    errorFiled = data.getErrorfield();
    if (errorFiled){
      return new ResponseData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    if(filter.list_id){
      let checkList = await this.list_repo.getList({id: filter.list_id});
      if (checkList.status_code != StatusCodes.OK){
        return new ResponseData({
          message: checkList.message,
          status_code: StatusCodes.BAD_REQUEST,
        })
      }
    }

    if (filter.id) {
      let currentBoard = await this.card_repo.getCard({ id: filter.id });
      if (currentBoard.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "Card is not found",
          status_code: StatusCodes.NOT_FOUND,
        })
      }

      let checkList = await this.card_repo.getCard({ __notId: filter.id, __orName: data.name, __orListId: filter.list_id});
      if (checkList.status_code == StatusCodes.OK) {
        return new ResponseData({
          message: "this list name already taken by others",
          status_code: StatusCodes.NOT_FOUND,
        })
      }
    }

    const updateResponse = await this.card_repo.updateCard(filter.toFilterCardDetail(), data.toCardDetailUpdate());
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Card is not found",
        status_code: StatusCodes.NOT_FOUND,
      })
    }
    return new ResponseData({
      message: "Card is updated successful",
      status_code: StatusCodes.NO_CONTENT,
    })
  }
}