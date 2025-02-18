import { TokenDataI } from "@/utils/security_utils";

declare module "express" {
	export interface Request {
		auth?: TokenDataI
	}
}