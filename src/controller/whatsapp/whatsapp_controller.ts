import { UserRepositoryI } from "@/repository/user/user_interfaces";
import { WhatsAppHttpService } from "@/services/whatsapp/whatsapp_http_service";
import { ResponseData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";

export interface WhatsAppControllerI {
  sendNotification(
    userId: string,
    message: string,
    data: any
  ): Promise<ResponseData<any>>;
}

export class WhatsAppController implements WhatsAppControllerI {
  private whatsappService: WhatsAppHttpService;
  private userRepo: UserRepositoryI;

  constructor(whatsappService: WhatsAppHttpService, userRepo: UserRepositoryI) {
    this.whatsappService = whatsappService;
    this.userRepo = userRepo;
    this.sendNotification = this.sendNotification.bind(this);
  }

  async sendNotification(
    userId: string,
    message: string,
    data: any
  ): Promise<ResponseData<any>> {
    try {
      if (!userId || !message) {
        return new ResponseData({
          message: "User ID and message are required",
          status_code: StatusCodes.BAD_REQUEST,
        });
      }

      // 1. Get user's phone number from the database
      const userResponse = await this.userRepo.getUser({ id: userId });

      if (userResponse.status_code !== StatusCodes.OK || !userResponse.data) {
        return new ResponseData({
          message: "Failed to fetch user details",
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        });
      }

      const phoneNumber = userResponse.data.phone;

      if (!phoneNumber) {
        return new ResponseData({
          message: "User does not have a phone number",
          status_code: StatusCodes.BAD_REQUEST,
        });
      }

      // 2. Format phone number if needed (add country code, remove spaces, etc.)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      if (!formattedPhone) {
        return new ResponseData({
          message: "Invalid phone number format",
          status_code: StatusCodes.BAD_REQUEST,
        });
      }

      const formatMessage = `${message}\nNama PO: ${data?.card?.name}`;

      // 3. Send WhatsApp message
      const sendResponse = await this.whatsappService.sendMessage({
        message: formatMessage,
        target: formattedPhone,
      });

      return new ResponseData({
        message: "WhatsApp notification sent successfully",
        status_code: StatusCodes.OK,
        data: sendResponse,
      });
    } catch (error) {
      console.error("Error sending WhatsApp notification:", error);
      return new ResponseData({
        message: "Failed to send WhatsApp notification",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  private formatPhoneNumber(phone: string): string | null {
    if (!phone) return null;

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, "");

    // If the number starts with '0', replace with country code (assuming Indonesia +62)
    if (digitsOnly.startsWith("0")) {
      return "62" + digitsOnly.substring(1);
    }

    // If it already has a country code, return as is
    return digitsOnly;
  }
}
