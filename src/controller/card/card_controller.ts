import { validate as isValidUUID } from 'uuid';

import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { Paginate } from "@/utils/data_utils";
import { CardActionActivity, CardActivity, CardDetail, CardRepositoryI } from '@/repository/card/card_interfaces';
import { CreateCardResponse, fromCardDetailToCardResponse, fromCardDetailToCardResponseCard, CardControllerI, CardCreateData, CardFilter, CardResponse, UpdateCardData, fromCustomFieldDetailToCustomFieldResponseCard, AssignCardResponse, CardMoveData } from '@/controller/card/card_interfaces';
import { ListRepositoryI } from '@/repository/list/list_interfaces';
import { CustomFieldCardDetail, CustomFieldRepositoryI, CustomFieldTrigger } from '@/repository/custom_field/custom_field_interfaces';
import { TriggerControllerI } from '../trigger/trigger_interfaces';
import { CardActivityType, ConditionType, TriggerTypes } from '@/types/custom_field';

export class CardController implements CardControllerI {
  private card_repo: CardRepositoryI
  private list_repo: ListRepositoryI
  private custom_field_repo: CustomFieldRepositoryI
  private trigger_controller: TriggerControllerI

  constructor(card_repo: CardRepositoryI, list_repo: ListRepositoryI, custom_field_repo: CustomFieldRepositoryI, trigger_controller: TriggerControllerI) {
    this.card_repo = card_repo;
    this.list_repo = list_repo;
    this.custom_field_repo = custom_field_repo;
    this.trigger_controller = trigger_controller;
    this.GetCard = this.GetCard.bind(this);
    this.GetListCard = this.GetListCard.bind(this);
    this.DeleteCard = this.DeleteCard.bind(this);
    this.UpdateCard = this.UpdateCard.bind(this);
    this.CreateCard = this.CreateCard.bind(this);
    
    this.UpdateCustomField = this.UpdateCustomField.bind(this);
    this.AddCustomField = this.AddCustomField.bind(this);
    this.RemoveCustomField = this.RemoveCustomField.bind(this);
    this.GetListCustomField = this.GetListCustomField.bind(this);
  }

  async UpdateCustomField(card_id: string, custom_field_id: string, value: string | number): Promise<ResponseData<null>> {
    let warning = undefined;
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

    let checkCustomField = await this.custom_field_repo.getAssignCard(custom_field_id, card_id);
    if (checkCustomField.status_code != StatusCodes.OK){
      return new ResponseData({
        message: checkCustomField.message,
        status_code: checkCustomField.status_code,
      })
    }

    let data = await this.trigger_controller.prepareDataSource(value, checkCustomField.data?.source!);
    if (data.status_code != StatusCodes.OK){
      return new ResponseData({
        message: data.message,
        status_code: data.status_code,
      })
    }

    // if (checkCustomField.data?.trigger_id) {
    //   let triggerRes = await this.trigger_controller.doTrigger(checkCustomField.data.trigger_id!, value, {target_list_id: card_id} )
    //   if (triggerRes.status_code != StatusCodes.OK){
    //     warning = "trigger failed, error : " + triggerRes.message
    //   }
    // }

    let assignCustomFieldRes = await this.custom_field_repo.updateAssignedCard(
      custom_field_id, card_id, data.data!
    );
    if (assignCustomFieldRes != StatusCodes.NO_CONTENT){
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR
      })  
    }

    return new ResponseData({
      message: "Update Success",
      warning: warning,
      status_code: StatusCodes.OK,
    })
  }

  async AddCustomField(card_id: string, custom_field_id: string, value: string | number): Promise<ResponseData<null>> {
    let data = new CustomFieldCardDetail({card_id: card_id})
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

    if (value) {
      let checkSource = await this.trigger_controller.prepareDataSource(value, checkCustomField.data?.source!);
      if (checkSource.status_code != StatusCodes.OK){
        return new ResponseData({
          message: checkSource.message,
          status_code: checkSource.status_code,
        })
      }
      data.value_number = checkSource.data?.value_number;
      data.value_string = checkSource.data?.value_string;
      data.value_user_id = checkSource.data?.value_user_id;
    }

    // if (trigger) {
    //   let checkSourceVal = await this.trigger_controller.checkConditionalValue(trigger.conditional_value, checkCustomField.data?.source!, trigger.action)
    //   if (checkSourceVal.status_code != StatusCodes.OK){
    //     return new ResponseData({
    //       message: checkSourceVal.message,
    //       status_code: checkSourceVal.status_code,
    //     })
    //   }
    // }

    let assignCustomFieldRes = await this.custom_field_repo.assignToCard(custom_field_id, data);
    if (assignCustomFieldRes != StatusCodes.NO_CONTENT){
      if (assignCustomFieldRes == StatusCodes.CONFLICT) {
        return new ResponseData({
          message: "this custom field already assigned",
          status_code: assignCustomFieldRes
        })
      }
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR
      })
    }

    if (checkCustomField.status_code == StatusCodes.OK && value) {
      let selectedCustomField = await this.custom_field_repo.getAssignCard(custom_field_id ,card_id);
      if (selectedCustomField.status_code != StatusCodes.OK){
        return new ResponseData({
          message: selectedCustomField.message,
          status_code: selectedCustomField.status_code,
        })
      }
      // let tiggerRes = await this.trigger_controller.doTrigger(selectedCustomField.data!.trigger_id!, value, {target_list_id: card_id} )
      // if (tiggerRes.status_code != StatusCodes.OK){
      //   return new ResponseData({
      //     message: tiggerRes.message,
      //     status_code: tiggerRes.status_code,
      //   })
      // }
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
      if (assignCustomFieldRes == StatusCodes.NOT_FOUND){
        return new ResponseData({
          message: "this custom field is not assigned",
          status_code: StatusCodes.BAD_REQUEST
        })
      }
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
    
    let listCheck = await this.list_repo.getList({id: data.list_id})
    if (listCheck.status_code != StatusCodes.OK) {
      let msg = "internal server error"
      if (listCheck.status_code == StatusCodes.NOT_FOUND){
        msg = "list is not found"
      }
      return new ResponseData({
        message: msg,
        status_code: StatusCodes.BAD_REQUEST,
      })
    }

    // let checkList = await this.card_repo.getCard({ list_id: data.list_id, name: data.name });
    // if (checkList.status_code == StatusCodes.OK) {
    //   return new ResponseData({
    //     message: "card name already exist on your board",
    //     status_code: StatusCodes.CONFLICT,
    //   })
    // }

    let createResponse = await this.card_repo.createCard(data.toCardDetail());
    if (createResponse.status_code == StatusCodes.INTERNAL_SERVER_ERROR) {
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }

    this.trigger_controller.doTrigger({
      type: ConditionType.CardInBoard,
      workspace_id: listCheck.data?.workspace_id!,
      condition: {
        action: 'added',
        by: 'anyone',
        board: listCheck.data?.board_id!,
      },
      group_type: TriggerTypes.CardMove,
      data: {
        card_id: createResponse.data?.id
      }
    })

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

  async MoveCard(user_id: string, filter: CardMoveData): Promise<ResponseData<CardResponse>> {
    try {
      // 1. Validate card ID
      if (!filter.id || !isValidUUID(filter.id)) {
        return new ResponseData({
          message: "Card ID is invalid or missing",
          status_code: StatusCodes.BAD_REQUEST
        });
      }
  
      // 2. Get the current card information before move
      const card = await this.card_repo.getCard({ id: filter.id });
      if (card.status_code !== StatusCodes.OK) {
        return new ResponseData({
          message: card.message,
          status_code: card.status_code
        });
      }
  
      // 3. Call the repository's moveCard function
      const moveResponse = await this.card_repo.moveCard({
        id: filter.id,
        previous_list_id: filter.previous_list_id,
        target_list_id: filter.target_list_id,
        previous_position: filter.previous_position,
        target_position: filter.target_position
      });
      
      if (moveResponse.status_code !== StatusCodes.OK) {
        return new ResponseData({
          message: moveResponse.message,
          status_code: moveResponse.status_code
        });
      }
  
      // 4. If moved between lists, add a card activity
      const sourceListId = card.data!.list_id;
      const targetListId = filter.target_list_id || sourceListId;
      
      if (targetListId !== sourceListId) {
        await this.card_repo.addActivity({ id: filter.id }, new CardActivity({
          activity_type: CardActivityType.Action,
          card_id: filter.id,
          sender_id: user_id
        }, new CardActionActivity({
          source: {
            origin_list_id: sourceListId,
            destination_list_id: targetListId
          }
        })));
      }
      
      // 5. Return the moved card data
      return new ResponseData({
        message: "Card moved successfully",
        status_code: StatusCodes.OK,
        data: fromCardDetailToCardResponse(moveResponse.data!)
      });
      
    } catch (e) {
      if (e instanceof Error) {
        return new ResponseData({
          message: e.message,
          status_code: StatusCodes.INTERNAL_SERVER_ERROR
        });
      }
      return new ResponseData({
        message: "Internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR
      });
    }
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

  async GetCardActivity(card_id: string, paginate: Paginate): Promise<ResponseListData<Array<CardResponse>>> {
    if (!isValidUUID(card_id)){
      return new ResponseListData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      }, paginate)
    }
    let cardCheck = await this.card_repo.getCard({id: card_id})
    if (cardCheck.status_code != StatusCodes.OK) {
      return new ResponseListData({
        message: cardCheck.message,
        status_code: StatusCodes.BAD_REQUEST
      }, paginate)
    }

    let cardsActivity = await this.card_repo.getCardActivities(card_id, paginate);
    return new ResponseListData({
      message: "Card activity",
      status_code: StatusCodes.OK,
      data: cardsActivity.data!,
    }, cardsActivity.paginate)
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

  async UpdateCard(user_id: string, filter: CardFilter, data: UpdateCardData): Promise<ResponseData<null>> {
    let warning = undefined;
    let move_to_other_board = false
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

    let selectedCard = await this.card_repo.getCard(filter.toFilterCardDetail());
    if (selectedCard.status_code == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Card is not found",
        status_code: StatusCodes.NOT_FOUND,
      })
    }

    if (data.list_id) {
      if (selectedCard.data?.list_id == data.list_id!){
        return new ResponseData({
          message: "card is already on this list",
          status_code: StatusCodes.NOT_ACCEPTABLE,
        })
      }

      let currentList = await this.list_repo.getList({id: selectedCard.data?.list_id!});
      if (currentList.status_code!=StatusCodes.OK){
        return new ResponseData({
          message: "current list is not broken or deleted",
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        })
      }
      let targetList = await this.list_repo.getList({id: data.list_id!});
      if (targetList.status_code!=StatusCodes.OK){
        return new ResponseData({
          message: "target list error " + targetList.message,
          status_code: targetList.status_code,
        })
      }

      if (targetList.data?.board_id != currentList.data?.board_id) {
        move_to_other_board = true
      }
    }

    if (filter.id) {
      // let checkList = await this.card_repo.getCard({ __notId: filter.id, __orName: data.name, __orListId: filter.list_id});
      // if (checkList.status_code == StatusCodes.OK) {
      //   return new ResponseData({
      //     message: "this card name already taken by others",
      //     status_code: StatusCodes.NOT_FOUND,
      //   })
      // }
    }else {
      return new ResponseData({
        message: "Update card without card id is not support right now",
        status_code: StatusCodes.NOT_ACCEPTABLE,
      })
    }

    const updateResponse = await this.card_repo.updateCard(filter.toFilterCardDetail(), data.toCardDetailUpdate());
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Card is not found",
        status_code: StatusCodes.NOT_FOUND,
      })
    }

    if (data.list_id && selectedCard.data?.list_id! != data.list_id!) {
      const activityRes = await this.card_repo.addActivity(filter.toFilterCardDetail(), new CardActivity({
        activity_type: CardActivityType.Action,
        card_id: selectedCard.data?.id,
        sender_id: user_id,
      }, new CardActionActivity({
        // action_type: CardActionType.MoveList,
        source: {
          origin_list_id: selectedCard.data?.list_id!,
          destination_list_id: data.list_id!
        },
      })))
      if (activityRes.status_code != StatusCodes.OK) {
        warning = "successfull but error to add to activities, " + activityRes.message  
      }

      if (move_to_other_board){
        let assignRes = await this.custom_field_repo.assignAllBoardCustomFieldToCard(data.list_id!, selectedCard.data?.id!)
        if (assignRes.status_code != StatusCodes.OK) {
          warning = "successfull move but error assign all custom fields, " + assignRes.message  
        }
      }
    }

    return new ResponseData({
      message: "Card is updated successful",
      status_code: StatusCodes.NO_CONTENT,
      warning: warning,
    })
  }
}