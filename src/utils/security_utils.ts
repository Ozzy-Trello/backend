import jwt, {JwtPayload} from "jsonwebtoken";
import type {StringValue} from "ms";

export interface TokenDataI {
	user_id: string
	iat: number
	exp: number
}

export function GenerateToken(payload: object, key: string, opt?:  { expiresIn? : StringValue | number }) : string {
	return jwt.sign(payload, key, {
		expiresIn: opt?.expiresIn,
	})
}

export function ExtractToken(token: string, key: string): TokenDataI {
	const payload_result : JwtPayload | string = jwt.verify(token, key);
	const result: TokenDataI = (payload_result as TokenDataI)
	return {
		user_id: (result as TokenDataI).user_id,
		exp: result.exp,
		iat: result.iat,
	}
}

export interface PermissionStructure {
  board: { create: boolean; read: boolean; update: boolean; delete: boolean };
  list: { create: boolean; read: boolean; update: boolean; delete: boolean };
  card: { create: boolean; read: boolean; update: boolean; delete: boolean };
}