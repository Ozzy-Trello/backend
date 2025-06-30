import { validate as isValidUUID, v4 as uuidv4 } from "uuid";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { broadcastToWebSocket } from "@/server";
import { Paginate } from "@/utils/data_utils";
import {
  CardActivity,
  CardActivityAction,
  CardDetail,
  CardDetailUpdate,
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
  ListDashcardDataResponse,
  DashCardConfig,
} from "@/controller/card/card_interfaces";
import { ListDetail } from "@/repository/list/list_interfaces";
import {
  CustomFieldCardDetail,
} from "@/repository/custom_field/custom_field_interfaces";
import {
  CardAttachmentDetail,
} from "@/repository/card_attachment/card_attachment_interface";
import {
  CardListTimeDetail,
} from "@/repository/card_list_time/card_list_time_interface";
import {
  CardBoardTimeDetail,
} from "@/repository/card_board_time/card_board_time_interface";
import { CardType } from "@/types/card";
import {
  AutomationRuleControllerI,
} from "../automation_rule/automation_rule_interface";
import {
  WhatsAppControllerI,
  WhatsAppController,
} from "@/controller/whatsapp/whatsapp_controller";
import { EventPublisher } from "@/event_publisher";
import {
  EnumTriggeredBy,
  EnumUserActionEvent,
  UserActionEvent,
} from "@/types/event";
import { EnumOptionPosition } from "@/types/options";
import { RepositoryContext } from "@/repository/repository_context";
import { CardActivityType } from "@/types/custom_field";
import { EnumSelectionType } from "@/types/automation_rule";

export class CardController implements CardControllerI {
  private event_publisher: EventPublisher | undefined;
  private repository_context: RepositoryContext;
  private automation_rule_controller: AutomationRuleControllerI | undefined;
  private whatsapp_controller: WhatsAppControllerI;

  // Deduplication cache for mention processing
  private mentionProcessingCache: Set<string> = new Set();

  constructor(
    repository_context: RepositoryContext,
    whatsapp_controller: WhatsAppControllerI
  ) {
    this.repository_context = repository_context;
    this.whatsapp_controller = whatsapp_controller;
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
    let checkCard = await this.repository_context.card.getCard({ id: card_id });
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
    if (
      this.event_publisher &&
      triggerdBy === EnumTriggeredBy.User &&
      checkCard?.data
    ) {
      const event: UserActionEvent = {
        eventId: uuidv4(),
        type: EnumUserActionEvent.CardArchived,
        workspace_id: "",
        user_id: user_id,
        timestamp: new Date(),
        data: {
          card: checkCard.data,
        },
      };
      console.log("Trying to publish event: %s", event.eventId);
      this.event_publisher.publishUserAction(event);
    }

    this.repository_context.card.addActivity(new CardActivity({
      sender_user_id: user_id,
      card_id: card_id,
      activity_type: CardActivityType.Action,
      triggered_by: triggerdBy,
      action: new CardActivityAction({
        action: EnumUserActionEvent.CardArchived
      })
    }))
    const updateResponse = await this.repository_context.card.updateCard(
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
    let checkCard = await this.repository_context.card.getCard({ id: card_id });
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
          card: checkCard.data,
        },
      };
      console.log("Trying to publish event: %s", event.eventId);
      this.event_publisher.publishUserAction(event);
    }

    const updateResponse = await this.repository_context.card.updateCard(
      new CardFilter({ id: card_id }),
      new CardDetailUpdate({ archive: false })
    );
    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Card is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }

    this.repository_context.card.addActivity(new CardActivity({
      sender_user_id: user_id,
      card_id: card_id,
      activity_type: CardActivityType.Action,
      triggered_by: triggerdBy,
      action: new CardActivityAction({
        action: EnumUserActionEvent.CardUnarchived
      })
    }));

    return new ResponseData({
      message: "success",
      status_code: StatusCodes.OK,
    });
  }

  async UpdateCustomField(
    user_id: string,
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

    let checkCard = await this.repository_context.card.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      });
    }

    let checkCustomField = await this.repository_context.custom_field.getAssignCard(
      custom_field_id,
      card_id
    );
    if (checkCustomField.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCustomField.message,
        status_code: checkCustomField.status_code,
      });
    }

    let assignCustomFieldRes = await this.repository_context.custom_field.updateAssignedCard(
      custom_field_id,
      card_id,
      new CustomFieldCardDetail({
        card_id: card_id,
        value_string: value.toString(),
      })
    );
    
    if (assignCustomFieldRes != StatusCodes.NO_CONTENT) {
      return new ResponseData({
        message: "internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }

    this.repository_context.card.addActivity(new CardActivity({
      sender_user_id: user_id,
      card_id: card_id,
      activity_type: CardActivityType.Action,
      triggered_by: triggerdBy,
      action: new CardActivityAction({
        action: EnumUserActionEvent.CardCustomFieldChange,
        new_value: {"custom_field_id": value}
      })
    }));

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

    let checkCard = await this.repository_context.card.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      });
    }

    let checkCustomField = await this.repository_context.custom_field.getCustomField({
      id: custom_field_id,
    });
    if (checkCustomField.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCustomField.message,
        status_code: checkCustomField.status_code,
      });
    }

    let assignCustomFieldRes = await this.repository_context.custom_field.assignToCard(
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
      let selectedCustomField = await this.repository_context.custom_field.getAssignCard(
        custom_field_id,
        card_id
      );
      if (selectedCustomField.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: selectedCustomField.message,
          status_code: selectedCustomField.status_code,
        });
      }
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

    let checkCard = await this.repository_context.card.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      });
    }

    let checkCustomField = await this.repository_context.custom_field.getCustomField({
      id: custom_field_id,
    });
    if (checkCustomField.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCustomField.message,
        status_code: checkCustomField.status_code,
      });
    }

    let assignCustomFieldRes = await this.repository_context.custom_field.unAssignFromCard(
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

    let checkCard = await this.repository_context.card.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseListData(
        {
          message: checkCard.message,
          status_code: checkCard.status_code,
        },
        paginate
      );
    }

    let res = await this.repository_context.custom_field.getListAssignCard(card_id, paginate);
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

    let listCheck = await this.repository_context.list.getList({ id: data.list_id });
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


    let createResponse = await this.repository_context.card.createCard(data.toCardDetail());
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
      this.repository_context.card_list_time_history.createCardTimeInList(
        new CardListTimeDetail({
          card_id: createResponse.data?.id!,
          list_id: data.list_id,
          entered_at: createResponse.data?.created_at! || new Date(),
        })
      );

      // insert time tracking record for inserted card in related board
      this.repository_context.card_board_time_history.createCardTimeInBoard(
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
          card: createResponse.data,
          list: new ListDetail({id: data.list_id}),
        },
      };
      console.log("Trying to publish event: %s", event.eventId);
      this.event_publisher.publishUserAction(event);

      event.eventId = uuidv4();
      event.type = EnumUserActionEvent.CreatedIn;
      console.log("Trying to publish event: %s", event.eventId);
      this.event_publisher.publishUserAction(event);
    }

    this.repository_context.card.addActivity(new CardActivity({
      sender_user_id: user_id,
      card_id: createResponse.data?.id,
      activity_type: CardActivityType.Action,
      triggered_by: triggerdBy,
      action: new CardActivityAction({
        action: EnumUserActionEvent.CardCreated,
      })
    }));

    return new ResponseData({
      message: "Card created successfully",
      status_code: StatusCodes.CREATED,
      data: new CreateCardResponse({
        id: createResponse.data?.id,
      }),
    });
  }

  async CopyCard(
    user_id: string,
    copyCardData: CopyCardData,
    triggeredBy: EnumTriggeredBy
  ): Promise<ResponseData<CreateCardResponse>> {
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
    let checkedData = await this.repository_context.card.getListCard(
      { id: copyCardData?.card_id },
      new Paginate(0, 0)
    );
    console.log("in controller copying card: checkedData: %o", checkedData);

    if (
      checkedData.status_code != StatusCodes.OK ||
      !checkedData.data ||
      checkedData.data?.length < 1
    ) {
      return new ResponseData({
        message: "no source card found",
        status_code: checkedData.status_code,
      });
    }
    let cardToCopied = checkedData?.data[0];

    // re-adjust copied card before
    if (copyCardData.target_list_id)
      cardToCopied.list_id = copyCardData?.target_list_id;
    if (copyCardData.name) cardToCopied.name = copyCardData?.name;
    if (!cardToCopied.type) cardToCopied.type = CardType.Regular;

    // insert the data
    const createCardResult = await this.repository_context.card.createCard(cardToCopied);
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
          card: createCardResult.data,
          list: new ListDetail({
            id: copyCardData.target_list_id,
          }),
        },
      };

      console.log("Trying to publish event: %s", event.eventId);
      this.event_publisher.publishUserAction(event);

      // event.eventId = uuidv4();
      // event.type = EnumUserActionEvent.CardAddedTo;
      // console.log("Trying to publish event: %s", event.eventId);
      // this.event_publisher.publishUserAction(event); //added to
    }

    // comment - activity
    this.repository_context.card.addActivity(new CardActivity({
      sender_user_id: user_id,
      card_id: createCardResult.data?.id,
      activity_type: CardActivityType.Action,
      triggered_by: triggeredBy,
      action: new CardActivityAction({
        action: EnumUserActionEvent.CardCopied,
      })
    }));

    if (copyCardData?.position) {
      // re-adjust copycard data position
      let moveCardParams: filterMoveCard = {
        id: createCardResult?.data?.id,
        previous_list_id: copyCardData.target_list_id,
        target_list_id: copyCardData.target_list_id,
      };

      if (
        [
          EnumOptionPosition.BottomOfList,
          EnumOptionPosition.TopOfList,
        ].includes(copyCardData?.position as EnumOptionPosition)
      ) {
        moveCardParams.target_position_top_or_bottom =
          copyCardData?.position as string;
      } else {
        moveCardParams.target_position = copyCardData?.position as number;
      }

      this.repository_context.card.moveCard(moveCardParams);
    }

    // insert time tracking record for inserted card in related list
    this.repository_context.card_list_time_history.createCardTimeInList(
      new CardListTimeDetail({
        card_id: createCardResult?.data?.id!,
        list_id: copyCardData?.target_list_id,
        entered_at: createCardResult?.data?.created_at! || new Date(),
      })
    );

    this.repository_context.list
      .getList({ id: copyCardData?.target_list_id })
      .then((result) => {
        if (result.status_code == StatusCodes.OK) {
          // insert time tracking record for inserted card in related board
          this.repository_context.card_board_time_history.createCardTimeInBoard(
            new CardBoardTimeDetail({
              card_id: createCardResult.data?.id!,
              board_id: result?.data?.board_id!,
              entered_at: createCardResult?.data?.created_at || new Date(),
            })
          );
        }
      });

    // insert attachment
    if (copyCardData.is_with_attachments) {
      this.repository_context.card_attachment
        .getCardAttachmentList(
          { card_id: copyCardData?.card_id },
          new Paginate(0, 0)
        )
        .then((result) => {
          if (result.status_code === StatusCodes.OK && result.data) {
            const attachments = result?.data?.map((item) => ({
              ...item,
              card_id: createCardResult?.data?.id as string,
            }));

            // insert in bulk
            this.repository_context.card_attachment
              .createCardAttachmentInBulk(attachments)
              .then((result) =>
                console.log("insert attachment in bulk: %o", result)
              );
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
      let checkList = await this.repository_context.list.getList({ id: filter.list_id });
      if (checkList.status_code == StatusCodes.NOT_FOUND) {
        return new ResponseData({
          message: checkList.message,
          status_code: checkList.status_code,
        });
      }
    }

    let checkList = await this.repository_context.card.getCard(filter.toFilterCardDetail());
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
    console.log("CardController: MoveCard");
    try {
      // 1. Validate card ID
      if (!filter.id || !isValidUUID(filter.id)) {
        return new ResponseData({
          message: "Card ID is invalid or missing",
          status_code: StatusCodes.BAD_REQUEST,
        });
      }

      // 2. Get the current card information before move
      const card = await this.repository_context.card.getCard({ id: filter.id });
      if (card.status_code !== StatusCodes.OK) {
        return new ResponseData({
          message: card.message,
          status_code: card.status_code,
        });
      }

      // 3. Call the repository's moveCard function
      const moveResponse = await this.repository_context.card.moveCard({
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

      // comment - activity
      this.repository_context.card.addActivity(new CardActivity({
        sender_user_id: user_id,
        card_id: moveResponse.data?.id,
        activity_type: CardActivityType.Action,
        triggered_by: triggerdBy,
        action: new CardActivityAction({
          action: EnumUserActionEvent.CardMoved,
          old_value: {
            [EnumSelectionType.List]: filter.previous_list_id,
            [EnumSelectionType.Position]: filter.previous_position
          },
          new_value: {
            [EnumSelectionType.List]: filter.target_list_id,
            [EnumSelectionType.Position]: filter.target_position || filter?.target_position_top_or_bottom
          }
        })
      }));

      // 4. If moved between lists, add a card activity
      const sourceListId = card.data!.list_id;
      const targetListId = filter.target_list_id || sourceListId;

      // Do async procedures
      if (sourceListId !== targetListId) {
        // Update time tracking record of previous list
        const u = await this.repository_context.card_list_time_history.updateTimeTrackingRecord({
          card_id: filter.id,
          list_id: filter.previous_list_id,
          exited_at: new Date(),
        });

        // Insert time tracking record for moved card in new list
        this.repository_context.card_list_time_history.createCardTimeInList(
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
            card: moveResponse.data,
            list: new ListDetail({id: moveResponse?.data?.list_id}),
            _previous_data: {
              list: new ListDetail({id: card.data?.list_id}),
              card: card.data,
            },
          },
        };

        console.log("Trying to publish event: %s", event.eventId);
        this.event_publisher.publishUserAction(event); //general move

        // event.eventId = uuidv4();
        // event.type = EnumUserActionEvent.CardAddedTo;
        // console.log("Trying to publish event: %s", event.eventId);
        // this.event_publisher.publishUserAction(event); //added to

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
      let checkList = await this.repository_context.list.getList({ id: filter.list_id });
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

    let cards = await this.repository_context.card.getListCard(
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
      await this.repository_context.card_attachment.getCoverAttachmentList(cardIds);
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
        const result = await this.repository_context.card_board_time_history.getCardTimeInBoardList(
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
      const result = await this.repository_context.card_list_time_history.getCardTimeInListByCardList(
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
    let cards = await this.repository_context.card.getListCard(
      filter.toFilterCardDetail(),
      paginate
    );

    const cardIds = cards.data?.map((card) => card.id) || [];
    const attachmentCovers =
      await this.repository_context.card_attachment.getCoverAttachmentList(cardIds);
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

  // async AddActivity(
  //   data: CardActivity
  // ): Promise<ResponseData<CardActivity>> {
  //   if (!isValidUUID(data.card_id)) {
  //     return new ResponseData(
  //       {
  //         message: "'card_id' is not valid uuid",
  //         status_code: StatusCodes.BAD_REQUEST,
  //       }
  //     );
  //   }

  //   let newCard: CardActivity = new CardActivity(
  //     data
  //   );
  //   let result = await this.card_repo.addActivity(newCard);
  //   if (result.status_code != StatusCodes.OK) {
  //     return new ResponseData(
  //       {
  //         message: result.message,
  //         status_code: StatusCodes.INTERNAL_SERVER_ERROR,
  //       },
  //     );
  //   }

  //   return new ResponseData({
  //     status_code: result.status_code,
  //     message: result.message,
  //     data: result.data
  //   });
  // }

  async GetCardActivity(
    card_id: string,
    paginate: Paginate
  ): Promise<ResponseListData<Array<CardActivity>>> {
    if (!isValidUUID(card_id)) {
      return new ResponseListData(
        {
          message: "'card_id' is not valid uuid",
          status_code: StatusCodes.BAD_REQUEST,
        },
        paginate
      );
    }
    let cardCheck = await this.repository_context.card.getCard({ id: card_id });
    if (cardCheck.status_code != StatusCodes.OK) {
      return new ResponseListData(
        {
          message: cardCheck.message,
          status_code: StatusCodes.BAD_REQUEST,
        },
        paginate
      );
    }

    let cardsActivity = await this.repository_context.card.getCardActivities(
      card_id,
      paginate
    );
    return new ResponseListData(
      {
        message: "Card activity",
        status_code: StatusCodes.OK,
        data: cardsActivity.data,
      },
      cardsActivity.paginate
    );
  }

  async DeleteCard(
    filter: CardFilter,
    triggerdBy: EnumTriggeredBy
  ): Promise<ResponseData<null>> {
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
      let checkList = await this.repository_context.list.getList({ id: filter.list_id });
      if (checkList.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: checkList.message,
          status_code: StatusCodes.BAD_REQUEST,
        });
      }
    }
    const deleteResponse = await this.repository_context.card.deleteCard(filter);
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
      let checkList = await this.repository_context.list.getList({ id: filter.list_id });
      if (checkList.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: checkList.message,
          status_code: StatusCodes.BAD_REQUEST,
        });
      }
    }

    let selectedCard = await this.repository_context.card.getCard(
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

      let currentList = await this.repository_context.list.getList({
        id: selectedCard.data?.list_id!,
      });
      if (currentList.status_code != StatusCodes.OK) {
        return new ResponseData({
          message: "current list is not broken or deleted",
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
      }
      let targetList = await this.repository_context.list.getList({ id: data.list_id! });
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

    const updateResponse = await this.repository_context.card.updateCard(
      filter.toFilterCardDetail(),
      data.toCardDetailUpdate()
    );

    // Check for mentions in description and send WhatsApp notifications
    // Process mentions for both user and automation triggers, but log the source
    if (data.description && updateResponse === StatusCodes.NO_CONTENT) {
      try {
        // Extract mentioned user IDs from HTML content
        const mentionedUserIds = WhatsAppController.extractMentionedUserIds(
          data.description
        );

        if (mentionedUserIds.length > 0) {
          const triggerSource =
            triggerdBy === EnumTriggeredBy.User ? "user" : "automation";
          const timestamp = new Date().toISOString();

          // Create a unique key for deduplication based on card ID, description hash, and mentioned users
          const descriptionHash = Buffer.from(data.description)
            .toString("base64")
            .slice(0, 20);
          const dedupeKey = `${filter.id}-${descriptionHash}-${mentionedUserIds
            .sort()
            .join(",")}`;

          if (this.mentionProcessingCache.has(dedupeKey)) {
            console.log(
              `[${timestamp}] SKIPPING duplicate mention processing for card ${filter.id} (triggered by ${triggerSource})`
            );
          } else {
            // Add to cache and set a timeout to clear it (5 seconds should be enough)
            this.mentionProcessingCache.add(dedupeKey);
            setTimeout(() => {
              this.mentionProcessingCache.delete(dedupeKey);
            }, 5000);

            console.log(
              `[${timestamp}] Found mentions in card ${filter.id} (triggered by ${triggerSource}):`,
              mentionedUserIds
            );
            console.log(`[${timestamp}] Deduplication key: ${dedupeKey}`);

            // Send WhatsApp notifications to mentioned users
            const notificationResult =
              await this.whatsapp_controller.sendMessageFromMention(
                mentionedUserIds,
                filter.id!,
                data.description
              );

            if (notificationResult.status_code !== StatusCodes.OK) {
              console.warn(
                `Failed to send mention notifications (${triggerSource}):`,
                notificationResult.message
              );
            } else {
              console.log(
                `Mention notifications sent successfully (${triggerSource}):`,
                notificationResult.data
              );
            }
          }
        }
      } catch (error) {
        console.error("Error processing mention notifications:", error);
        // Don't fail the card update if mention notifications fail
      }
    }

    // Check if card name was changed and broadcast appropriate event
    if (data.name && data.name !== selectedCard.data?.name) {
      // Card was renamed - broadcast specific rename event
      broadcastToWebSocket(EnumUserActionEvent.CardRenamed, {
        card: {
          id: selectedCard.data?.id,
          name: data.name,
          list_id: selectedCard.data?.list_id,
        },
        listId: selectedCard.data?.list_id,
        renamedBy: user_id,
        previousName: selectedCard.data?.name,
      });

      // Publish event for automation chain if triggered by user
      if (this.event_publisher && triggerdBy === EnumTriggeredBy.User) {
        const event: UserActionEvent = {
          eventId: uuidv4(),
          type: EnumUserActionEvent.CardRenamed,
          workspace_id: "", // Will be filled by automation processor
          user_id: user_id,
          timestamp: new Date(),
          data: {
            card: new CardDetail({id: filter.id}),
            _previous_data: {
              card: selectedCard.data
            },
          },
        };
        console.log("Publishing card renamed event: %s", event.eventId);
        this.event_publisher.publishUserAction(event);
      }
    } else {
      // General card update
      broadcastToWebSocket(EnumUserActionEvent.CardUpdated, {
        card: data,
        listId: filter?.list_id || data?.list_id,
        udpatedBy: user_id,
      });
    }

    if (updateResponse == StatusCodes.NOT_FOUND) {
      return new ResponseData({
        message: "Card is not found",
        status_code: StatusCodes.NOT_FOUND,
      });
    }

    if (data.list_id && selectedCard.data?.list_id! != data.list_id!) {
      if (move_to_other_board) {
        let assignRes =
          await this.repository_context.custom_field.assignAllBoardCustomFieldToCard(
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
    let checkCard = await this.repository_context.card.getCard({ id: card_id });
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
    const updateResponse = await this.repository_context.card.updateCard(
      { id: card_id },
      new CardDetailUpdate({ is_complete: true, completed_at: new Date() })
    );

    // comment - activity
    this.repository_context.card.addActivity(new CardActivity({
      sender_user_id: user_id,
      card_id: card_id,
      activity_type: CardActivityType.Action,
      triggered_by: triggerdBy,
      action: new CardActivityAction({
        action: EnumUserActionEvent.CardMarkedCompleted,
        old_value: {
          [EnumSelectionType.Completion]:EnumUserActionEvent.CardMarkedIncompleted,
        },
        new_value: {
          [EnumSelectionType.Completion]:EnumUserActionEvent.CardMarkedCompleted,
        }
      })
    }));

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
    let checkCard = await this.repository_context.card.getCard({ id: card_id });
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
    const updateResponse = await this.repository_context.card.updateCard(
      { id: card_id },
      new CardDetailUpdate({ is_complete: false, completed_at: undefined })
    );

    // comment - activity
    this.repository_context.card.addActivity(new CardActivity({
      sender_user_id: user_id,
      card_id: card_id,
      activity_type: CardActivityType.Action,
      triggered_by: triggerdBy,
      action: new CardActivityAction({
        action: EnumUserActionEvent.CardMarkedCompleted,
        old_value: {
          [EnumSelectionType.Completion]:EnumUserActionEvent.CardMarkedCompleted,
        },
        new_value: {
          [EnumSelectionType.Completion]:EnumUserActionEvent.CardMarkedIncompleted,
        }
      })
    }));

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

    let checkCard = await this.repository_context.card.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      });
    }

    let res = await this.repository_context.card_list_time_history.getCardTimeInList(card_id);
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

    let checkCard = await this.repository_context.card.getCard({ id: card_id });
    if (checkCard.status_code != StatusCodes.OK) {
      return new ResponseData({
        message: checkCard.message,
        status_code: checkCard.status_code,
      });
    }

    let res = await this.repository_context.card_board_time_history.getCardTimeInBoard(
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

  async GetDashcardCount(
    dashcardId: string,
    workspaceId: string
  ): Promise<ResponseData<number>> {
    try {
      // Get the dashcard
      const dashcardResponse = await this.repository_context.card.getCard({ id: dashcardId });

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

      const count = await this.repository_context.card.countCardsWithFilters(
        dashConfig?.filters ?? [],
        workspaceId
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
    const result = await this.repository_context.card.copyCardWithMirror(
      card_id,
      target_list_id
    );

    // comment - activity
    this.repository_context.card.addActivity(new CardActivity({
      sender_user_id: user_id,
      card_id: card_id,
      activity_type: CardActivityType.Action,
      triggered_by: triggerdBy,
      action: new CardActivityAction({
        action: EnumUserActionEvent.CardMirrored,
        new_value: {
          card_id: result?.data?.id,
        }
      })
    }));
    return result;
  }

  async GetListDashcard(
    id: string,
    workspace_id: string
  ): Promise<ResponseData<ListDashcardDataResponse>> {
    try {
      const result = await this.repository_context.card.getListDashcard(id, workspace_id);
      return new ResponseData({
        message: "Dashcard list retrieved successfully",
        status_code: StatusCodes.OK,
        data: {
          dash_config: result.dashConfig,
          items: result.items,
        },
      });
    } catch (error) {
      console.error("Error in GetListDashcard:", error);
      return new ResponseData({
        message: "Internal server error",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        data: {
          dash_config: new DashCardConfig({
            background_color: "",
            filters: [],
          }),
          items: [],
        },
      });
    }
  }
}
