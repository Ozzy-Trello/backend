import type { CardRepositoryI } from "@/repository/card/card_interfaces";
import type { UserRepositoryI } from "@/repository/user/user_interfaces";
import type { WhatsAppHttpService } from "@/services/whatsapp/whatsapp_http_service";
import { ResponseData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import type { CustomFieldRepositoryI } from "@/repository/custom_field/custom_field_interfaces";

export interface WhatsAppControllerI {
  sendNotification(
    userId: string,
    message: string,
    data: any,
    customFields?: any[],
    userFieldId?: string
  ): Promise<ResponseData<any>>;
  
  sendMessageFromMention(
    mentionedUserIds: string[],
    cardId: string,
    message: string
  ): Promise<ResponseData<any>>;
}

interface NotificationData {
  card?: { id: string };
  workspace_id?: string;
}

interface CustomFieldValue {
  value_option?: any;
  value_string?: string;
  value_number?: number;
  value_checkbox?: boolean;
  value_user_id?: string;
  value_date?: string;
}

export class WhatsAppController implements WhatsAppControllerI {
  constructor(
    private whatsappService: WhatsAppHttpService,
    private userRepo: UserRepositoryI,
    private cardRepo: CardRepositoryI,
    private customFieldRepo: CustomFieldRepositoryI
  ) {
    this.sendNotification = this.sendNotification.bind(this);
    this.sendMessageFromMention = this.sendMessageFromMention.bind(this);
  }

  async sendNotification(
    userId: string,
    message: string,
    data: NotificationData,
    customFields?: any[],
    userFieldId?: string
  ): Promise<ResponseData<any>> {
    try {
      // Validate input
      // const validationError = this.validateInput(userId, message);
      // console.log(validationError, "validationError");
      // if (validationError) return validationError;
      console.log("pass here");

      console.log(customFields, "<< ini isi customfields");

      let userInField = await this.customFieldRepo.getCardCustomField(
        data?.workspace_id!,
        data?.card?.id!,
        userFieldId!
      );

      if (userInField?.status_code !== StatusCodes.OK) {
        return new ResponseData({
          message: "Failed to fetch user details",
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
      }

      // Get user phone number
      const phoneResult = await this.getUserPhoneNumber(
        userId ?? userInField.data?.value_user_id
      );
      if (!phoneResult.success) return phoneResult.error!;

      // Get card details
      const cardResult = await this.getCardDetails(data?.card?.id);
      if (!cardResult.success) return cardResult.error!;

      // Build message
      const formattedMessage = await this.buildMessage(
        message,
        cardResult.data!,
        data,
        customFields
      );

      // Send WhatsApp message
      const sendResponse = await this.whatsappService.sendMessage({
        message: formattedMessage,
        target: phoneResult.data!,
      });

      return new ResponseData({
        message: "WhatsApp notification sent successfully",
        status_code: StatusCodes.OK,
        data: null,
      });
    } catch (error) {
      console.error("Error sending WhatsApp notification:", error);
      return new ResponseData({
        message: "Failed to send WhatsApp notification",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async sendMessageFromMention(
    mentionedUserIds: string[],
    cardId: string,
    message: string
  ): Promise<ResponseData<any>> {
    try {
      // Validate input
      if (!mentionedUserIds?.length || !cardId || !message) {
        return new ResponseData({
          message: "Mentioned user IDs, card ID, and message are required",
          status_code: StatusCodes.BAD_REQUEST,
        });
      }

      // Get card details
      const cardResult = await this.getCardDetails(cardId);
      if (!cardResult.success) return cardResult.error!;

      // Clean the message by removing HTML tags and mention spans
      const cleanMessage = this.cleanMentionMessage(message);

      // Send notifications to all mentioned users
      const notificationPromises = mentionedUserIds.map(async (userId) => {
        try {
          // Get user phone number
          const phoneResult = await this.getUserPhoneNumber(userId);
          if (!phoneResult.success) {
            console.warn(`Failed to get phone number for user ${userId}`);
            return { success: false, userId, error: phoneResult.error };
          }

          // Build mention notification message
          const formattedMessage = `Nama anda disebut di PO: "${cardResult.data!.name}"\n\n${cleanMessage}`;

          // Send WhatsApp message
          await this.whatsappService.sendMessage({
            message: formattedMessage,
            target: phoneResult.data!,
          });

          return { success: true, userId };
        } catch (error) {
          console.error(`Error sending mention notification to user ${userId}:`, error);
          return { success: false, userId, error };
        }
      });

      // Wait for all notifications to complete
      const results = await Promise.allSettled(notificationPromises);
      
      // Count successful and failed notifications
      const successful = results.filter(
        (result) => result.status === 'fulfilled' && result.value.success
      ).length;
      
      const failed = results.length - successful;

      return new ResponseData({
        message: `WhatsApp mention notifications sent. Success: ${successful}, Failed: ${failed}`,
        status_code: StatusCodes.OK,
        data: {
          total: mentionedUserIds.length,
          successful,
          failed,
        },
      });
    } catch (error) {
      console.error("Error sending WhatsApp message from mention:", error);
      return new ResponseData({
        message: "Failed to send WhatsApp message from mention",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  private validateInput(
    userId: string,
    message: string
  ): ResponseData<any> | null {
    if (!userId || !message) {
      return new ResponseData({
        message: "User ID and message are required",
        status_code: StatusCodes.BAD_REQUEST,
      });
    }
    return null;
  }

  private async getUserPhoneNumber(userId: string): Promise<{
    success: boolean;
    data?: string;
    error?: ResponseData<any>;
  }> {
    const userResponse = await this.userRepo.getUser({ id: userId });

    if (userResponse.status_code !== StatusCodes.OK || !userResponse.data) {
      return {
        success: false,
        error: new ResponseData({
          message: "Failed to fetch user details",
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        }),
      };
    }

    const phoneNumber = userResponse.data.phone;
    if (!phoneNumber) {
      return {
        success: false,
        error: new ResponseData({
          message: "User does not have a phone number",
          status_code: StatusCodes.BAD_REQUEST,
        }),
      };
    }

    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      return {
        success: false,
        error: new ResponseData({
          message: "Invalid phone number format",
          status_code: StatusCodes.BAD_REQUEST,
        }),
      };
    }

    return { success: true, data: formattedPhone };
  }

  private async getCardDetails(cardId?: string): Promise<{
    success: boolean;
    data?: any;
    error?: ResponseData<any>;
  }> {
    if (!cardId) {
      return {
        success: false,
        error: new ResponseData({
          message: "Card ID is required",
          status_code: StatusCodes.BAD_REQUEST,
        }),
      };
    }

    const cardResponse = await this.cardRepo.getCard({ id: cardId });

    if (cardResponse.status_code !== StatusCodes.OK || !cardResponse.data) {
      return {
        success: false,
        error: new ResponseData({
          message: "Failed to fetch card details",
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        }),
      };
    }

    return { success: true, data: cardResponse.data };
  }

  private async buildMessage(
    baseMessage: string,
    cardData: any,
    data: NotificationData,
    customFields?: any[]
  ): Promise<string> {
    let message = `${baseMessage}\nNama PO: ${cardData.name}`;

    if (this.shouldIncludeCustomFields(customFields, data)) {
      const customFieldsText = await this.buildCustomFieldsText(
        customFields!,
        data.workspace_id!,
        data.card!.id
      );
      message += customFieldsText;
    }

    return message;
  }

  private shouldIncludeCustomFields(
    customFields?: any[],
    data?: NotificationData
  ): boolean {
    return !!(customFields?.length && data?.card?.id);
  }

  private async buildCustomFieldsText(
    customFields: any[],
    workspaceId: string,
    cardId: string
  ): Promise<string> {
    if (!customFields?.length) return "";

    let customFieldsText = "\n\nInformasi Tambahan:\n\n";
    console.log("building cusotfield");
    const processedFields = await Promise.all(
      customFields.map((fieldId) =>
        this.processCustomField(fieldId, workspaceId, cardId)
      )
    );

    // Filter out any null/undefined results and join with newlines
    customFieldsText += processedFields.filter(Boolean).join("\n");

    return customFieldsText;
  }

  private async processCustomField(
    fieldId: string,
    workspaceId: string,
    cardId: string
  ): Promise<string | null> {
    try {
      const [fieldValueResponse, fieldDefResponse] = await Promise.all([
        this.customFieldRepo.getCardCustomField(workspaceId, cardId, fieldId),
        this.customFieldRepo.getCustomFieldById(fieldId),
      ]);

      // Always include the field definition if it exists, even if there's no value
      if (
        fieldDefResponse?.status_code === StatusCodes.OK &&
        fieldDefResponse.data
      ) {
        const fieldDef = fieldDefResponse.data;
        let displayValue = "N/A"; // Default value if no value is found

        // Only try to get the value if we have a valid response
        if (
          fieldValueResponse?.status_code === StatusCodes.OK &&
          fieldValueResponse.data
        ) {
          const value = fieldValueResponse.data as CustomFieldValue;
          displayValue = await this.formatCustomFieldValue(value, fieldDef);
        }

        return `- ${fieldDef.name}: ${displayValue}`;
      }

      return null;
    } catch (error) {
      console.error(`Error processing field ${fieldId}:`, error);
      return null;
    }
  }

  private async formatCustomFieldValue(
    value: CustomFieldValue,
    fieldDef: any
  ): Promise<string> {
    if (!value) return "N/A";

    if (
      fieldDef?.source === "user" ||
      fieldDef?.type?.toLowerCase() === "user"
    ) {
      return value.value_user_id
        ? await this.formatUserValue(value.value_user_id)
        : "N/A";
    }

    // Handle other field types
    if (fieldDef?.type) {
      switch (fieldDef.type.toLowerCase()) {
        case "dropdown":
        case "select":
          return value.value_option !== undefined
            ? this.formatOptionValue(value.value_option, fieldDef.options)
            : "N/A";

        case "checkbox":
          return value.value_checkbox !== undefined
            ? value.value_checkbox
              ? "Yes"
              : "No"
            : "N/A";

        case "number":
          return value.value_number !== undefined
            ? value.value_number.toString()
            : "N/A";

        case "date":
        case "datetime":
          return value.value_date
            ? new Date(value.value_date).toLocaleString()
            : "N/A";

        case "text":
        default:
          if (value.value_string !== undefined) {
            return value.value_string || "N/A";
          }
          if (value.value_option !== undefined) {
            return this.formatOptionValue(value.value_option, fieldDef.options);
          }
          return "N/A";
      }
    }

    // Fallback for when field type is not available
    return "N/A";
  }

  private formatOptionValue(optionId: any, options?: any[]): string {
    if (optionId === null || optionId === undefined) return "N/A";
    if (!options || !Array.isArray(options)) return String(optionId);

    // Try to find by id first, then by value
    const selectedOption = options.find(
      (opt) => opt.id === optionId || opt.value === optionId
    );

    return selectedOption?.name || selectedOption?.label || String(optionId);
  }

  private async formatUserValue(userId: string): Promise<string> {
    try {
      const userResponse = await this.userRepo.getUser({ id: userId });

      if (userResponse.status_code === StatusCodes.OK && userResponse.data) {
        return userResponse.data.username || `User (${userId})`;
      }

      return `User ID: ${userId}`;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return `User ID: ${userId}`;
    }
  }

  private formatPhoneNumber(phone: string): string | null {
    if (!phone) return null;

    const digitsOnly = phone.replace(/\D/g, "");

    // Replace leading '0' with Indonesian country code
    if (digitsOnly.startsWith("0")) {
      return "62" + digitsOnly.substring(1);
    }

    return digitsOnly;
  }

  private cleanMentionMessage(message: string): string {
    // Remove HTML tags but preserve the text content
    let cleanMessage = message.replace(/<[^>]*>/g, "");
    
    // Remove any extra whitespace and special characters
    cleanMessage = cleanMessage.replace(/[\u200B-\u200D\uFEFF]/g, ""); // Remove zero-width characters
    cleanMessage = cleanMessage.replace(/\s+/g, " ").trim(); // Normalize whitespace
    
    return cleanMessage;
  }

  static extractMentionedUserIds(htmlContent: string): string[] {
    const mentionedUserIds: string[] = [];
    
    // Regex to match mention spans with data-id attribute
    const mentionRegex = /<span[^>]*class="mention"[^>]*data-id="([^"]*)"[^>]*>/g;
    
    let match;
    while ((match = mentionRegex.exec(htmlContent)) !== null) {
      const userId = match[1];
      if (userId && !mentionedUserIds.includes(userId)) {
        mentionedUserIds.push(userId);
      }
    }
    
    return mentionedUserIds;
  }
}
