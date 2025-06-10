import axios from "axios";
import { z } from "zod";

// Define the request body schema
const WhatsAppMessageSchema = z.object({
  target: z.string(),
  message: z.string(),
  url: z.string().optional(),
  filename: z.string().optional(),
  schedule: z.number().optional(),
  delay: z.string().optional(),
  countryCode: z.string().optional(),
  location: z.string().optional(),
});

export type WhatsAppMessage = z.infer<typeof WhatsAppMessageSchema>;

// Define the response schema
const WhatsAppResponseSchema = z.object({
  status: z.boolean(),
  detail: z.string().optional(),
  reason: z.string().optional(),
  id: z.array(z.string()).optional(),
  process: z.string().optional(),
  requestid: z.number().optional(),
  target: z.array(z.string()).optional(),
});

export type WhatsAppResponse = z.infer<typeof WhatsAppResponseSchema>;

export class WhatsAppHttpService {
  private readonly baseUrl =
    process.env.WHATSAPP_API_URL || "https://api.fonnte.com";
  private readonly token =
    process.env.WHATSAPP_API_TOKEN || "PKbDumKdpyCMviAesrJQ";

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await axios.request<T>({
        method,
        url: `${this.baseUrl}${path}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token,
        },
        data,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `WhatsApp API error: ${error.response?.data?.reason || error.message}`
        );
      }
      throw error;
    }
  }

  async sendMessage(messageData: WhatsAppMessage): Promise<WhatsAppResponse> {
    // Validate input
    console.log("sending message to whatsapp");
    WhatsAppMessageSchema.parse(messageData);

    const response = await this.request<WhatsAppResponse>(
      "POST",
      "/send",
      messageData
    );

    // Validate response
    WhatsAppResponseSchema.parse(response);

    if (!response.status) {
      console.error(`WhatsApp API error: ${response}`);
      throw new Error(`WhatsApp API error: ${response.reason}`);
    } else {
      console.log("message sent successfully");
    }

    return response;
  }
}
