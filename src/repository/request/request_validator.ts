import { CreateRequestDTO } from "./request_interfaces";

export function validateCreateRequest(data: any): {
  valid: boolean;
  message?: string;
} {
  if (!data.card_id || typeof data.card_id !== "number") {
    return { valid: false, message: "Invalid or missing card_id" };
  }
  if (!data.request_type || typeof data.request_type !== "string") {
    return { valid: false, message: "Invalid or missing request_type" };
  }
  if (!data.requested_item_id) {
    return { valid: false, message: "Invalid or missing requested_item_id" };
  }
  if (
    data.request_amount === undefined ||
    typeof data.request_amount !== "number"
  ) {
    return { valid: false, message: "Invalid or missing request_amount" };
  }
  return { valid: true };
}
