import { z } from "zod";

const phoneRegex = /^[+]?[0-9]{10,15}$/;

export const loginValidator = z.object({
	identity: z.union([
		z.string().email(),
		z.string().regex(phoneRegex, "Invalid phone number"),
	]),
	password: z.string(),
});
