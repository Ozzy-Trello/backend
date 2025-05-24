import { z } from "zod";

const phoneRegex = /^[+]?[0-9]{10,15}$/;

export const updateValidator = z.object({
	phone: z.string().regex(phoneRegex, "invalid phone number"),
	email: z.string().email(),
	password: z.string(),
});
