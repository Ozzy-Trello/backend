import { validate as isValidUUID, v4 as uuidv4 } from "uuid";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { broadcastToWebSocket } from "@/server";
import { Paginate } from "@/utils/data_utils";
import {
  CardActionActivity,
  CardActivity,
  CardDetail,
  CardDetailUpdate,
  CardRepositoryI,
  filterMoveCard,
} from "@/repository/card/card_interfaces";
import {
  CreateCardResponse,
  fromCardDetailToCardResponse,
  fromCardDetailToCardResponseCard,
  CardControllerI,
  CardCreateData,
  CardFilter,
  CardResponse,
  UpdateCardData,
  fromCustomFieldDetailToCustomFieldResponseCard,
  AssignCardResponse,
  CardMoveData,
  CardSearch,
  CopyCardData,
} from "@/controller/card/card_interfaces";
import { ListRepositoryI } from "@/repository/list/list_interfaces";
import {
  CustomFieldCardDetail,
  CustomFieldRepositoryI,
} from "@/repository/custom_field/custom_field_interfaces";
import { TriggerControllerI } from "../trigger/trigger_interfaces";
import { CardActivityType } from "@/types/custom_field";
import {
  CardAttachmentDetail,
  CardAttachmentRepositoryI,
} from "@/repository/card_attachment/card_attachment_interface";
import {
  CardListTimeDetail,
  CardListTimeRepositoryI,
} from "@/repository/card_list_time/card_list_time_interface";
import {
  CardBoardTimeDetail,
  CardBoardTimeRepositoryI,
} from "@/repository/card_board_time/card_board_time_interface";
import { CardType } from "@/types/card";
import {
  AutomationRuleControllerI,
  AutomationRuleFilter,
} from "../automation_rule/automation_rule_interface";
import { EventPublisher } from "@/event_publisher";
import { EnumTriggeredBy, EnumUserActionEvent, UserActionEvent } from "@/types/event";
import { UUID } from "sequelize";
import { EnumOptionPosition } from "@/types/options";

export class CardController implements CardControllerI {
  private event_publisher: EventPublisher | undefined;
  private card_repo: CardRepositoryI;
  private list_repo: ListRepositoryI;
  private custom_field_repo: CustomFieldRepositoryI;
  private trigger_controller: TriggerControllerI;
  private card_attachmment_repo: CardAttachmentRepositoryI;
  private card_list_time_repo: CardListTimeRepositoryI;
  private card_board_time_repo: CardBoardTimeRepositoryI;
  private automation_rule_controller: AutomationRuleControllerI | undefined;

  constructor(
    card_repo: CardRepositoryI,
    list_repo: ListRepositoryI,
    custom_field_repo: CustomFieldRepositoryI,
    trigger_controller: TriggerControllerI,
    card_attachmment_repo: CardAttachmentRepositoryI,
    card_list_time_repo: CardListTimeRepositoryI,
    card_board_time_repo: CardBoardTimeRepositoryI
  ) {
    this.card_repo = card_repo;
    this.list_repo = list_repo;
    this.custom_field_repo = custom_field_repo;
    this.trigger_controller = trigger_controller;
    this.card_attachmment_repo = card_attachmment_repo;
    this.card_list_time_repo = card_list_time_repo;
    this.card_board_time_repo = card_board_time_repo;
    this.ArchiveCard = this.ArchiveCard.bind(this);
    this.UnArchiveCard = this.UnArchiveCard.bind(this);
    this.GetCard = this.GetCard.bind(this);
    this.GetListCard = this.GetListCard.bind(this);
    this.DeleteCard = this.DeleteCard.bind(this);
    this.UpdateCard = this.UpdateCard.bind(this);
    this.CreateCard = this.CreateCard.bind(this);
    this.CopyCard = this.CopyCard.bind(this);

    this.UpdateCustomField = this.UpdateCustomField.bind(this);
    this.AddCustomField = this.AddCustomField.bind(this);
    this.RemoveCustomField = this.RemoveCustomField.bind(this);
    this.GetListCustomField = this.GetListCustomField.bind(this);
  }

  SetAutomationRuleController(
    automation_rule_controller: AutomationRuleControllerI
  ): void {
    this.automation_rule_controller = automation_rule_controller;
  }

  SetEventPublisher(event_publisher: EventPublisher): void {
    this.event_publisher = event_publisher;
  }

  async ArchiveCard(
    user_id: string,
    card_id: string,
    triggerdBy: EnumTriggeredBy
  ): Promise<ResponseData<null>> {
    if (!isValidUUID(card_id)) {
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    let checkCard = await this.card_repo.getCard({ id: card_id });
    console.log("hasil checking.. archiving the card nih...", checkCard);
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      });
    }

    if (checkCard.data?.archive) {
      return new ResponseData({
        message: "this card is already archived",
        status_code: StatusCodes.NOT_ACCEPTABLE,
      });
    }

    broadcastToWebSocket(EnumUserActionEvent.CardArchived, {
      card: checkCard.data,
      listId: checkCard?.data?.list_id,
      createdBy: user_id,
    });

    // publish event
    if (this.event_publisher && triggerdBy === EnumTriggeredBy.User && checkCard?.data) {
      const event: UserActionEvent = {
        eventId: uuidv4(),
        type: EnumUserActionEvent.CardArchived,
        workspace_id: "",
        user_id: user_id,
        timestamp: new Date(),
        data: {
          card: {
            id: checkCard.data.id,
            list_id: checkCard.data.list_id
          }
        }
      }
      console.log("Trying to publish event: %s", event.eventId);
      this.event_publisher.publishUserAction(event);
    }

    const updateResponse = await this.card_repo.updateCard(
      new CardFilter({ id: card_id }),
      new CardDetailUpdate({ archive: true })
    );
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Card is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    return new ResponseData({
      message: "success",
      status_code: StatusCodes.OK,
    });
  }

  async UnArchiveCard(
    user_id: string,
    card_id: string,
    triggerdBy: EnumTriggeredBy
  ): Promise<ResponseData<null>> {
    if (!isValidUUID(card_id)) {
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    let checkCard = await this.card_repo.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      });
    }

    if (!checkCard.data?.archive) {
      return new ResponseData({
        message: "this card is already in unarchived status",
        status_code: StatusCodes.NOT_ACCEPTABLE,
      });
    }

    broadcastToWebSocket(EnumUserActionEvent.CardArchived, {
      card: checkCard.data,
      listId: checkCard?.data?.list_id,
      createdBy: user_id,
    });

    // publish event
    if (this.event_publisher && triggerdBy === EnumTriggeredBy.User) {
      const event: UserActionEvent = {
        eventId: uuidv4(),
        type: EnumUserActionEvent.CardUnarchived,
        workspace_id: "",
        user_id: user_id,
        timestamp: new Date(),
        data: {
          card: {
            id: checkCard.data.id,
            list_id: checkCard.data.list_id
          }
        }
      }
      console.log("Trying to publish event: %s", event.eventId);
      this.event_publisher.publishUserAction(event);
    }

    const updateResponse = await this.card_repo.updateCard(
      new CardFilter({ id: card_id }),
      new CardDetailUpdate({ archive: false })
    );
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Card is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }

    return new ResponseData({
      message: "success",
      status_code: StatusCodes.OK,
    });
  }

  async UpdateCustomField(
    card_id: string,
    custom_field_id: string,
    value: string | number,
    triggerdBy: EnumTriggeredBy
  ): Promise<ResponseData<null>> {
    let warning = undefined;
    console.log("update custom field");

    if (!isValidUUID(card_id)) {
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    if (!isValidUUID(custom_field_id)) {
      return new ResponseData({
        message: "'custom_field_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    let checkCard = await this.card_repo.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      });
    }

    let checkCustomField = await this.custom_field_repo.getAssignCard(
      custom_field_id,
      card_id
    );
    if (checkCustomField.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCustomField.message,
        status_code: checkCustomField.status_code,
      });
    }

    let data = await this.trigger_controller.prepareDataSource(
      value,
      checkCustomField.data?.source!
    );
    if (data.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: data.message,
        status_code: data.status_code,
      });
    }

    // if (checkCustomField.data?.trigger_id) {
    //   let triggerRes = await this.trigger_controller.doTrigger(checkCustomField.data.trigger_id!, value, {target_list_id: card_id} )
    //   if (triggerRes.status_code != StatusCodes.OK){
    //     warning = "trigger failed, error : " + triggerRes.message
    //   }
    // }

    let assignCustomFieldRes = await this.custom_field_repo.updateAssignedCard(
      custom_field_id,
      card_id,
      data.data!
    );
    if (assignCustomFieldRes != StatusCodes.NO_CONTENT) {
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }

    return new ResponseData({
      message: "Update Success",
      warning: warning,
      status_code: StatusCodes.OK,
    });
  }

  async AddCustomField(
    card_id: string,
    custom_field_id: string,
    value: string | number,
    triggerdBy: EnumTriggeredBy
  ): Promise<ResponseData<null>> {
    let data = new CustomFieldCardDetail({ card_id: card_id });
    if (!isValidUUID(card_id)) {
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    if (!isValidUUID(custom_field_id)) {
      return new ResponseData({
        message: "'custom_field_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    let checkCard = await this.card_repo.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      });
    }

    let checkCustomField = await this.custom_field_repo.getCustomField({
      id: custom_field_id,
    });
    if (checkCustomField.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCustomField.message,
        status_code: checkCustomField.status_code,
      });
    }

    if (value) {
      let checkSource = await this.trigger_controller.prepareDataSource(
        value,
        checkCustomField.data?.source!
      );
      if (checkSource.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: checkSource.message,
          status_code: checkSource.status_code,
        });
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

    let assignCustomFieldRes = await this.custom_field_repo.assignToCard(
      custom_field_id,
      data
    );
    if (assignCustomFieldRes != StatusCodes.NO_CONTENT) {
      if (assignCustomFieldRes == StatusCodes.CONFLICT) {
        return new ResponseData({
          message: "this custom field already assigned",
          status_code: assignCustomFieldRes,
        });
      }
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }

    if (checkCustomField.status_code == StatusCodes.OK && value) {
      let selectedCustomField = await this.custom_field_repo.getAssignCard(
        custom_field_id,
        card_id
      );
      if (selectedCustomField.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: selectedCustomField.message,
          status_code: selectedCustomField.status_code,
        });
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
    });
  }

  async RemoveCustomField(
    card_id: string,
    custom_field_id: string,
    triggerdBy: EnumTriggeredBy
  ): Promise<ResponseData<null>> {
    if (!isValidUUID(card_id)) {
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    if (!isValidUUID(custom_field_id)) {
      return new ResponseData({
        message: "'custom_field_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    let checkCard = await this.card_repo.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      });
    }

    let checkCustomField = await this.custom_field_repo.getCustomField({
      id: custom_field_id,
    });
    if (checkCustomField.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCustomField.message,
        status_code: checkCustomField.status_code,
      });
    }

    let assignCustomFieldRes = await this.custom_field_repo.unAssignFromCard(
      custom_field_id,
      card_id
    );
    if (assignCustomFieldRes != StatusCodes.NO_CONTENT) {
      if (assignCustomFieldRes == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: "this custom field is not assigned",
          status_code: StatusCodes.BAD_REQUEST,
        });
      }
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }

    return new ResponseData({
      message: "Success",
      status_code: StatusCodes.NO_CONTENT,
    });
  }

  async GetListCustomField(
    card_id: string,
    paginate: Paginate
  ): Promise<ResponseListData<Array<AssignCardResponse>>> {
    if (!isValidUUID(card_id)) {
      return new ResponseListData(
        {
          message: "'card_id' is not valid uuid",
          status_code: StatusCodes.BAD_REQUEST,
        },
        paginate
      );
    }

    let checkCard = await this.card_repo.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseListData(
        {
          message: checkCard.message,
          status_code: checkCard.status_code,
        },
        paginate
      );
    }

    let res = await this.custom_field_repo.getListAssignCard(card_id, paginate);
    if (res.status_code != StatusCodes.OK) {
      return new ResponseListData(
        {
          message: res.message,
          status_code: res.status_code,
        },
        paginate
      );
    }

    return new ResponseListData(
      {
        message: "list of custom field on this card",
        status_code: StatusCodes.OK,
        data: fromCustomFieldDetailToCustomFieldResponseCard(res.data!),
      },
      paginate
    );
  }

  async CreateCard(
    user_id: string,
    data: CardCreateData,
    triggerdBy: EnumTriggeredBy
  ): Promise<ResponseData<CreateCardResponse>> {
    let paylodCheck = data.checkRequired();
    if (paylodCheck) {
      return new ResponseData({
        message: `you need to put '${paylodCheck}'`,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    let errorField = data.getErrorField();
    if (errorField) {
      return new ResponseData({
        message: errorField,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    let listCheck = await this.list_repo.getList({ id: data.list_id });
    if (listCheck.status_code != StatusCodes.OK) {
      let msg = "internal server error";
      if (listCheck.status_code == StatusCodes.NOT_FOUND) {
        msg = "list is not found";
      }
      return new ResponseData({
        message: msg,
        status_code: StatusCodes.BAD_REQUEST,
      });
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
      });
    }

    if (data.type === CardType.Regular) {
      /**
       * Do async procedures after card created
       * 1. track time in list
       * 2. track time in board
       * 3. trigger
       */

      // insert time tracking record for inserted card in related list
      this.card_list_time_repo.createCardTimeInList(
        new CardListTimeDetail({
          card_id: createResponse.data?.id!,
          list_id: data.list_id,
          entered_at: createResponse.data?.created_at! || new Date(),
        })
      );

      // insert time tracking record for inserted card in related board
      this.card_board_time_repo.createCardTimeInBoard(
        new CardBoardTimeDetail({
          card_id: createResponse.data?.id!,
          board_id: listCheck.data?.board_id!,
          entered_at: createResponse.data?.created_at || new Date(),
        })
      );
    }

    // Prepare card response for WebSocket broadcast
    const cardResponse = {
      id: createResponse.data?.id,
      name: data.name,
      description: data.description,
      order: data.order,
      listId: data.list_id,
      createdAt: createResponse.data?.created_at,
      createdBy: user_id,
    };

    // Broadcast to WebSocket clients
    broadcastToWebSocket(EnumUserActionEvent.CardCreated, {
      card: cardResponse,
      listId: data.list_id,
      createdBy: user_id,
    });

    if (this.event_publisher && triggerdBy === EnumTriggeredBy.User) {
      const event: UserActionEvent = {
        eventId: uuidv4(),
        type: EnumUserActionEvent.CardCreated,
        workspace_id: "",
        user_id: user_id,
        timestamp: new Date(),
        data: {
          card: {
            id: cardResponse.id,
            list_id: cardResponse.listId
          },
          list: {
            id: cardResponse.listId
          }
        },
      }
      console.log("Trying to publish event: %s", event.eventId);
      this.event_publisher.publishUserAction(event);

      event.eventId = uuidv4();
      event.type = EnumUserActionEvent.CreatedIn;
      console.log("Trying to publish event: %s", event.eventId);
      this.event_publisher.publishUserAction(event);

      event.eventId = uuidv4();
      event.type = EnumUserActionEvent.CardAddedTo;
      console.log("Trying to publish event: %s", event.eventId);
      this.event_publisher.publishUserAction(event); //added to
    }

    return new ResponseData({
      message: "Card created successfully",
      status_code: StatusCodes.CREATED,
      data: new CreateCardResponse({
        id: createResponse.data?.id,
      }),
    });
  }

  async CopyCard(user_id: string, copyCardData: CopyCardData, triggeredBy: EnumTriggeredBy): Promise<ResponseData<CreateCardResponse>> {
    console.log("in controller copying card: %o", copyCardData);
    if (!copyCardData?.card_id) {
      return new ResponseData({
        message: "'card_id' cannot be empty",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    if (!isValidUUID(copyCardData?.card_id)) {
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    // find source card
    let checkedData = await this.card_repo.getListCard({id: copyCardData?.card_id}, new Paginate(0, 0));
    console.log("in controller copying card: checkedData: %o", checkedData);

    if (checkedData.status_code != StatusCodes.OK || !checkedData.data || checkedData.data?.length < 1) {
      return new ResponseData({
        message: "no source card found",
        status_code: checkedData.status_code,
      });
    }
    let cardToCopied = checkedData?.data[0];

    // re-adjust copied card before
    if (copyCardData.target_list_id) cardToCopied.list_id = copyCardData?.target_list_id;
    if (copyCardData.name) cardToCopied.name = copyCardData?.name;
    if (!cardToCopied.type) cardToCopied.type = CardType.Regular;

    // insert the data
    const createCardResult = await this.card_repo.createCard(cardToCopied);
    if (checkedData.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: createCardResult.message,
        status_code: createCardResult.status_code,
      });
    }

    
    /**
     * do the asyb procedures below
     * 1. broadcast to websocket
     * 2. publish event
     * 3. re-position card in list if applicable
     * 5. insert time in list and time in board
     * 6. insert other card attributes if applicable
     */
    
    // Broadcast to WebSocket clients
    broadcastToWebSocket(EnumUserActionEvent.CardCreated, {
      card: createCardResult.data,
      listId: copyCardData.target_list_id,
      createdBy: user_id,
    });

    // publish event
    if (this.event_publisher && triggeredBy === EnumTriggeredBy.User) {
      const event: UserActionEvent = {
        eventId: uuidv4(),
        type: EnumUserActionEvent.CardCopied,
        workspace_id: "",
        user_id: user_id,
        timestamp: new Date(),
        data: {
          card: {
            id: createCardResult.data,
            list_id: copyCardData.target_list_id,
          },
          list: {
            id: copyCardData.target_list_id
          }
        },
      }

      console.log("Trying to publish event: %s", event.eventId);
      this.event_publisher.publishUserAction(event);

      event.eventId = uuidv4();
      event.type = EnumUserActionEvent.CardAddedTo;
      console.log("Trying to publish event: %s", event.eventId);
      this.event_publisher.publishUserAction(event); //added to
    }


    if (copyCardData?.position) {
      // re-adjust copycard data position
      let moveCardParams: filterMoveCard = {  
        id: createCardResult?.data?.id,
        previous_list_id: copyCardData.target_list_id,
        target_list_id: copyCardData.target_list_id,
      };
      
      if ([EnumOptionPosition.BottomOfList, EnumOptionPosition.TopOfList].includes(copyCardData?.position as EnumOptionPosition)) {
        moveCardParams.target_position_top_or_bottom = copyCardData?.position as string;
      } else {
        moveCardParams.target_position = copyCardData?.position as number;
      }

      this.card_repo.moveCard(moveCardParams);
    }
    

    // insert time tracking record for inserted card in related list
    this.card_list_time_repo.createCardTimeInList(
      new CardListTimeDetail({
        card_id: createCardResult?.data?.id!,
        list_id: copyCardData?.target_list_id,
        entered_at: createCardResult?.data?.created_at! || new Date(),
      })
    );

    this.list_repo.getList({ id: copyCardData?.target_list_id }).then(result => {
      if (result.status_code == StatusCodes.OK) {
        // insert time tracking record for inserted card in related board
        this.card_board_time_repo.createCardTimeInBoard(
          new CardBoardTimeDetail({
            card_id: createCardResult.data?.id!,
            board_id: result?.data?.board_id!,
            entered_at: createCardResult?.data?.created_at || new Date(),
          })
        );
      }
    })

    // insert attachment
    if (copyCardData.is_with_attachments) {
      this.card_attachmment_repo.getCardAttachmentList({card_id: copyCardData?.card_id}, new Paginate(0, 0)).then(result => {
        if (result.status_code === StatusCodes.OK && result.data) {
          const attachments = result?.data?.map(item => ({
            ...item,
            card_id: createCardResult?.data?.id as string,
          }));

          // insert in bulk
          this.card_attachmment_repo.createCardAttachmentInBulk(attachments).then(result => console.log("insert attachment in bulk: %o", result));
        }
      });
    }

    // insert checklist
    if (copyCardData.is_with_checklist) {

    }

    // insert comments
    if (copyCardData.is_with_comments) {

    }

    // insert labels
    if (copyCardData.is_with_labels) {

    }

    // insert members
    if (copyCardData.is_with_members) {

    }

    return new ResponseData({
      message: "Card copied successfully",
      status_code: StatusCodes.CREATED,
      data: new CreateCardResponse({
        id: createCardResult.data?.id,
      }),
    });

  }


  async GetCard(filter: CardFilter): Promise<ResponseData<CardResponse>> {
    if (filter.isEmpty()) {
      return new ResponseData({
        message: "you need to put filter to get list data",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    let errorFiled = filter.getErrorfield();
    if (errorFiled) {
      return new ResponseData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    if (filter.list_id) {
      let checkList = await this.list_repo.getList({ id: filter.list_id });
      if (checkList.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: checkList.message,
          status_code: checkList.status_code,
        });
      }
    }

    let checkList = await this.card_repo.getCard(filter.toFilterCardDetail());
    if (checkList.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkList.message,
        status_code: checkList.status_code,
      });
    }

    // if (filter.id && filter.board_id && filter.list_id && checkList.data) {
    //   let card_in_board = await this.card_board_time_repo.getCardTimeInBoard(filter.id, filter.board_id);
    //   checkList.data.formatted_time_in_board = card_in_board.data?.formatted_time_in_board;

    //   let card_in_list = await this.card_list_time_repo.getCardTimeInCurrentList(filter.id, filter.list_id);
    //   checkList.data.formatted_time_in_list = card_in_list.data?.formatted_time_in_list;
    // }

    return new ResponseData({
      message: checkList.message,
      status_code: checkList.status_code,
      data: fromCardDetailToCardResponse(checkList.data!),
    });
  }

  async MoveCard(
    user_id: string,
    filter: CardMoveData,
    triggerdBy: EnumTriggeredBy
  ): Promise<ResponseData<CardResponse>> {
    try {
      // 1. Validate card ID
      if (!filter.id || !isValidUUID(filter.id)) {
        return new ResponseData({
          message: "Card ID is invalid or missing",
          status_code: StatusCodes.BAD_REQUEST,
        });
      }

      // 2. Get the current card information before move
      const card = await this.card_repo.getCard({ id: filter.id });
      if (card.status_code !== StatusCodes.OK) {
        return new ResponseData({
          message: card.message,
          status_code: card.status_code,
        });
      }

      // 3. Call the repository's moveCard function
      const moveResponse = await this.card_repo.moveCard({
        id: filter.id,
        previous_list_id: filter.previous_list_id,
        target_list_id: filter.target_list_id,
        previous_position: filter.previous_position,
        target_position: filter.target_position,
        target_position_top_or_bottom: filter?.target_position_top_or_bottom,
      });

      if (moveResponse.status_code !== StatusCodes.OK) {
        return new ResponseData({
          message: moveResponse.message,
          status_code: moveResponse.status_code,
        });
      }

      // 4. If moved between lists, add a card activity
      const sourceListId = card.data!.list_id;
      const targetListId = filter.target_list_id || sourceListId;

      if (targetListId !== sourceListId) {
        await this.card_repo.addActivity(
          { id: filter.id },
          new CardActivity(
            {
              activity_type: CardActivityType.Action,
              card_id: filter.id,
              sender_id: user_id,
            },
            new CardActionActivity({
              source: {
                origin_list_id: sourceListId,
                destination_list_id: targetListId,
              },
            })
          )
        );
      }

      // Do async procedures
      if (sourceListId !== targetListId) {
        // Update time tracking record of previous list
        const u = await this.card_list_time_repo.updateTimeTrackingRecord({
          card_id: filter.id,
          list_id: filter.previous_list_id,
          exited_at: new Date(),
        });

        // Insert time tracking record for moved card in new list
        this.card_list_time_repo.createCardTimeInList(
          new CardListTimeDetail({
            card_id: filter.id,
            list_id: filter.target_list_id,
            entered_at: new Date(),
          })
        );

        console.log("Update time tracking record");
      }

      // 5. Broadcast WebSocket message with correct format
      const cardResponse = fromCardDetailToCardResponse(moveResponse.data!);

      // Broadcast to WebSocket clients
      broadcastToWebSocket(EnumUserActionEvent.CardMoved, {
        card: cardResponse,
        fromListId: sourceListId,
        toListId: targetListId,
        movedBy: user_id,
      });

      // 6. publish event
      if (this.event_publisher && triggerdBy === EnumTriggeredBy.User) {
        const event: UserActionEvent = {
          eventId: uuidv4(),
          type: EnumUserActionEvent.CardMoved,
          workspace_id: "",
          user_id: user_id,
          timestamp: new Date(),
          data: {
            card: {
              id: cardResponse.id,
              description: cardResponse.description!,
              type: CardType.Regular,
              list_id: cardResponse.list_id!,
              is_mirror: cardResponse.is_mirror!,
            },
            list: {
              id: targetListId
            },
            previous_data: {
              list_id: card.data?.list_id,
              order: card.data?.order
            }
          }
        }


        console.log("Trying to publish event: %s", event.eventId);
        this.event_publisher.publishUserAction(event); //general move

        
        event.eventId = uuidv4();
        event.type = EnumUserActionEvent.CardAddedTo;
        console.log("Trying to publish event: %s", event.eventId);
        this.event_publisher.publishUserAction(event); //added to

        event.eventId = uuidv4();
        event.type = EnumUserActionEvent.CardMovedInto;
        console.log("Trying to publish event: %s", event.eventId);
        this.event_publisher.publishUserAction(event); //moved into

        event.eventId = uuidv4();
        event.type = EnumUserActionEvent.CardMovedOutOf;
        console.log("Trying to publish event: %s", event.eventId);
        this.event_publisher.publishUserAction(event); //moved out of
      }

      // 7. Return the moved card data
      return new ResponseData({
        message: "Card moved successfully",
        status_code: StatusCodes.OK,
        data: cardResponse,
      });
    } catch (e) {
      console.error("Error in MoveCard:", e);
      if (e instanceof Error) {
        return new ResponseData({
          message: e.message,
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
      }
      return new ResponseData({
        message: "Internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async GetListCard(
    filter: CardFilter,
    paginate: Paginate
  ): Promise<ResponseListData<Array<CardResponse>>> {
    let errorFiled = filter.getErrorfield();
    if (errorFiled) {
      return new ResponseListData(
        {
          message: errorFiled,
          status_code: StatusCodes.BAD_REQUEST,
        },
        paginate
      );
    }

    if (filter.list_id) {
      let checkList = await this.list_repo.getList({ id: filter.list_id });
      if (checkList.status_code != StatusCodes.OK) {
        return new ResponseListData(
          {
            message: checkList.message,
            status_code: StatusCodes.BAD_REQUEST,
          },
          paginate
        );
      }
    }

    let cards = await this.card_repo.getListCard(
      filter.toFilterCardDetail(),
      paginate
    );
    if (cards.status_code != StatusCodes.OK) {
      return new ResponseListData(
        {
          message: cards.message,
          status_code: StatusCodes.BAD_REQUEST,
        },
        paginate
      );
    }

    const cardIds = cards.data?.map((card) => card.id) || [];
    const attachmentCovers =
      await this.card_attachmment_repo.getCoverAttachmentList(cardIds);
    if (attachmentCovers.status_code != StatusCodes.OK) {
      return new ResponseListData(
        {
          message: attachmentCovers.message,
          status_code: StatusCodes.BAD_REQUEST,
        },
        paginate
      );
    }
    const attachmentCoversMap = new Map();
    attachmentCovers?.data?.forEach((attachment) => {
      attachmentCoversMap.set(attachment.card_id, attachment);
    });

    let timeInBoards = [];
    const timeInBoardMap = new Map();
    if (filter.board_id) {
      if (isValidUUID(filter.board_id)) {
        const result = await this.card_board_time_repo.getCardTimeInBoardList(
          cardIds,
          filter?.board_id
        );
        if (result.status_code != StatusCodes.OK) {
          return new ResponseListData(
            {
              message: result.message,
              status_code: StatusCodes.BAD_REQUEST,
            },
            paginate
          );
        }
        timeInBoards = result?.data || [];
        if (timeInBoards) {
          timeInBoards?.forEach((item) => {
            timeInBoardMap.set(item.card_id, item.formatted_time_in_board);
          });
        }
      }
    }

    let timeInLists = [];
    const timeInListMap = new Map();
    if (filter.list_id) {
      const result = await this.card_list_time_repo.getCardTimeInListByCardList(
        cardIds,
        filter?.list_id
      );
      if (result.status_code != StatusCodes.OK) {
        return new ResponseListData(
          {
            message: result.message,
            status_code: StatusCodes.BAD_REQUEST,
          },
          paginate
        );
      }
      timeInLists = result?.data || [];
      if (timeInLists) {
        timeInLists?.forEach((item) => {
          timeInListMap.set(item.card_id, item.formatted_time_in_list);
        });
      }
    }

    // map other details to card item
    cards.data?.forEach((card) => {
      // Set cover
      const attachment = attachmentCoversMap.get(card.id);
      if (attachment) {
        card.cover = (attachment as CardAttachmentDetail)?.file?.url;
      }

      // set time in board
      const timeInBoard = timeInBoardMap.get(card.id);
      if (timeInBoard) card.formatted_time_in_board = timeInBoard;

      // set time in list
      const timeInList = timeInListMap.get(card.id);
      if (timeInList) card.formatted_time_in_list = timeInList;
    });

    console.log("card is: %o", cards.data);

    return new ResponseListData(
      {
        message: "Card list",
        status_code: StatusCodes.OK,
        data: fromCardDetailToCardResponseCard(cards.data!),
      },
      cards.paginate
    );
  }

  async SearchCard(
    filter: CardSearch,
    paginate: Paginate
  ): Promise<ResponseListData<Array<CardResponse>>> {
    let cards = await this.card_repo.getListCard(
      filter.toFilterCardDetail(),
      paginate
    );

    const cardIds = cards.data?.map((card) => card.id) || [];
    const attachmentCovers =
      await this.card_attachmment_repo.getCoverAttachmentList(cardIds);
    const attachmentCoversMap = new Map();
    attachmentCovers?.data?.forEach((attachment) => {
      attachmentCoversMap.set(attachment.card_id, attachment);
    });

    // map other details to card item
    cards.data?.forEach((card) => {
      // Set cover
      const attachment = attachmentCoversMap.get(card.id);
      if (attachment) {
        card.cover = (attachment as CardAttachmentDetail).file.url;
      }
    });

    return new ResponseListData(
      {
        message: "Card list",
        status_code: StatusCodes.OK,
        data: fromCardDetailToCardResponseCard(cards.data!),
      },
      cards.paginate
    );
  }

  async GetCardActivity(
    card_id: string,
    paginate: Paginate
  ): Promise<ResponseListData<Array<CardResponse>>> {
    if (!isValidUUID(card_id)) {
      return new ResponseListData(
        {
          message: "'card_id' is not valid uuid",
          status_code: StatusCodes.BAD_REQUEST,
        },
        paginate
      );
    }
    let cardCheck = await this.card_repo.getCard({ id: card_id });
    if (cardCheck.status_code != StatusCodes.OK) {
      return new ResponseListData(
        {
          message: cardCheck.message,
          status_code: StatusCodes.BAD_REQUEST,
        },
        paginate
      );
    }

    let cardsActivity = await this.card_repo.getCardActivities(
      card_id,
      paginate
    );
    return new ResponseListData(
      {
        message: "Card activity",
        status_code: StatusCodes.OK,
        data: cardsActivity.data!,
      },
      cardsActivity.paginate
    );
  }

  async DeleteCard(filter: CardFilter, triggerdBy: EnumTriggeredBy): Promise<ResponseData<null>> {
    if (filter.isEmpty()) {
      return new ResponseData({
        message: "you need filter to delete",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    let errorFiled = filter.getErrorfield();
    if (errorFiled) {
      return new ResponseData({
        message: errorFiled,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    if (filter.list_id) {
      let checkList = await this.list_repo.getList({ id: filter.list_id });
      if (checkList.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: checkList.message,
          status_code: StatusCodes.BAD_REQUEST,
        });
      }
    }
    const deleteResponse = await this.card_repo.deleteCard(filter);
    if (deleteResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Card is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    return new ResponseData({
      message: "Card is deleted successful",
      status_code: StatusCodes.NO_CONTENT,
    });
  }

  async UpdateCard(
    user_id: string,
    filter: CardFilter,
    data: UpdateCardData,
    triggerdBy: EnumTriggeredBy
  ): Promise<ResponseData<null>> {
    let warning = undefined;
    let move_to_other_board = false;
    if (filter.isEmpty()) {
      return new ResponseData({
        message: "you need filter to update",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    if (data.isEmpty()) {
      return new ResponseData({
        message: "you need data to update",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    let errorField = filter.getErrorfield();
    if (errorField) {
      return new ResponseData({
        message: errorField,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    errorField = data.getErrorfield();
    if (errorField) {
      return new ResponseData({
        message: errorField,
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    if (filter.list_id) {
      let checkList = await this.list_repo.getList({ id: filter.list_id });
      if (checkList.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: checkList.message,
          status_code: StatusCodes.BAD_REQUEST,
        });
      }
    }

    let selectedCard = await this.card_repo.getCard(
      filter.toFilterCardDetail()
    );
    if (selectedCard.status_code == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Card is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }

    if (data.list_id) {
      if (selectedCard.data?.list_id == data.list_id!) {
        return new ResponseData({
          message: "card is already on this list",
          status_code: StatusCodes.NOT_ACCEPTABLE,
        });
      }

      let currentList = await this.list_repo.getList({
        id: selectedCard.data?.list_id!,
      });
      if (currentList.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: "current list is not broken or deleted",
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
      }
      let targetList = await this.list_repo.getList({ id: data.list_id! });
      if (targetList.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: "target list error " + targetList.message,
          status_code: targetList.status_code,
        });
      }

      if (targetList.data?.board_id != currentList.data?.board_id) {
        move_to_other_board = true;
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
    } else {
      return new ResponseData({
        message: "Update card without card id is not support right now",
        status_code: StatusCodes.NOT_ACCEPTABLE,
      });
    }

    const updateResponse = await this.card_repo.updateCard(
      filter.toFilterCardDetail(),
      data.toCardDetailUpdate()
    );

    broadcastToWebSocket(EnumUserActionEvent.CardUpdated, {
      card: data,
      listId: filter?.list_id || data?.list_id,
      udpatedBy: user_id,
    });

    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Card is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }

    if (data.list_id && selectedCard.data?.list_id! != data.list_id!) {
      const activityRes = await this.card_repo.addActivity(
        filter.toFilterCardDetail(),
        new CardActivity(
          {
            activity_type: CardActivityType.Action,
            card_id: selectedCard.data?.id,
            sender_id: user_id,
          },
          new CardActionActivity({
            // action_type: CardActionType.MoveList,
            source: {
              origin_list_id: selectedCard.data?.list_id!,
              destination_list_id: data.list_id!,
            },
          })
        )
      );
      if (activityRes.status_code != StatusCodes.OK) {
        warning =
          "successfull but error to add to activities, " + activityRes.message;
      }

      if (move_to_other_board) {
        let assignRes =
          await this.custom_field_repo.assignAllBoardCustomFieldToCard(
            data.list_id!,
            selectedCard.data?.id!
          );
        if (assignRes.status_code != StatusCodes.OK) {
          warning =
            "successfull move but error assign all custom fields, " +
            assignRes.message;
        }
      }
    }

    return new ResponseData({
      message: "Card is updated successful",
      status_code: StatusCodes.NO_CONTENT,
      warning: warning,
    });
  }

  async CompleteCard(
    user_id: string,
    card_id: string,
    triggerdBy: EnumTriggeredBy
  ): Promise<ResponseData<null>> {
    if (!isValidUUID(card_id)) {
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    let checkCard = await this.card_repo.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      });
    }
    if (checkCard.data?.is_complete) {
      return new ResponseData({
        message: "Card is already complete",
        status_code: StatusCodes.NOT_ACCEPTABLE,
      });
    }
    const updateResponse = await this.card_repo.updateCard(
      { id: card_id },
      new CardDetailUpdate({ is_complete: true, completed_at: new Date() })
    );
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Card is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    return new ResponseData({
      message: "Card marked as complete",
      status_code: StatusCodes.OK,
    });
  }

  async IncompleteCard(
    user_id: string,
    card_id: string,
    triggerdBy: EnumTriggeredBy
  ): Promise<ResponseData<null>> {
    if (!isValidUUID(card_id)) {
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    let checkCard = await this.card_repo.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      });
    }
    if (!checkCard.data?.is_complete) {
      return new ResponseData({
        message: "Card is already incomplete",
        status_code: StatusCodes.NOT_ACCEPTABLE,
      });
    }
    const updateResponse = await this.card_repo.updateCard(
      { id: card_id },
      new CardDetailUpdate({ is_complete: false, completed_at: undefined })
    );
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Card is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }
    return new ResponseData({
      message: "Card marked as incomplete",
      status_code: StatusCodes.OK,
    });
  }

  async GetCardTimeInList(
    card_id: string
  ): Promise<ResponseData<Array<CardListTimeDetail>>> {
    if (!isValidUUID(card_id)) {
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    let checkCard = await this.card_repo.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      });
    }

    let res = await this.card_list_time_repo.getCardTimeInList(card_id);
    if (res.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: res.message,
        status_code: res.status_code,
      });
    }

    return new ResponseData({
      message: "list of time tracking in this card",
      status_code: StatusCodes.OK,
      data: res.data!,
    });
  }

  async GetCardTimeInBoard(
    card_id: string,
    board_id: string
  ): Promise<ResponseData<CardBoardTimeDetail>> {
    if (!isValidUUID(card_id)) {
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    if (!isValidUUID(board_id)) {
      return new ResponseData({
        message: "'board_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }

    let checkCard = await this.card_repo.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      });
    }

    let res = await this.card_board_time_repo.getCardTimeInBoard(
      card_id,
      board_id
    );
    if (res.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: res.message,
        status_code: res.status_code,
      });
    }

    return new ResponseData({
      message: "list of time tracking in this card",
      status_code: StatusCodes.OK,
      data: res.data!,
    });
  }

  async GetDashcardCount(dashcardId: string): Promise<ResponseData<number>> {
    try {
      // Get the dashcard
      const dashcardResponse = await this.card_repo.getCard({ id: dashcardId });

      if (
        dashcardResponse.status_code !== StatusCodes.OK ||
        !dashcardResponse.data
      ) {
        return new ResponseData({
          message: "Dashcard not found",
          status_code: StatusCodes.NOT_FOUND,
          data: 0,
        });
      }

      const dashConfig = dashcardResponse.data.getDashConfig();

      if (
        !dashConfig ||
        !dashConfig.filters ||
        dashConfig.filters.length === 0
      ) {
        // No filters - count all non-dashcard cards
        const count = await this.card_repo.countAllCards();

        return new ResponseData({
          status_code: StatusCodes.OK,
          message: "Dashcard count retrieved successfully",
          data: count,
        });
      }

      // Count cards with filters
      const count = await this.card_repo.countCardsWithFilters(
        dashConfig.filters
      );

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "Dashcard count retrieved successfully",
        data: count,
      });
    } catch (e) {
      console.error("Error in GetDashcardCount:", e);
      return new ResponseData({
        message: "Internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        data: 0,
      });
    }
  }

  async MakeMirrorCard(
    user_id: string,
    card_id: string,
    target_list_id: string,
    triggerdBy: EnumTriggeredBy
  ): Promise<ResponseData<CardDetail>> {
    if (!isValidUUID(card_id)) {
      return new ResponseData({
        message: "'card_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    if (!isValidUUID(target_list_id)) {
      return new ResponseData({
        message: "'list_id' is not valid uuid",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    // Optionally: validasi card utama dan list target exist (bisa pakai repo)
    const result = await this.card_repo.copyCardWithMirror(
      card_id,
      target_list_id
    );
    return result;
  }
}
