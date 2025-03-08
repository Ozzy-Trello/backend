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

export function isPermissionStructure(obj:any) {
  const expectedKeys = ["board", "list", "card"];
  const expectedStructure = { create: false, read: true, update: false, delete: false };

  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return false;
  }

  return expectedKeys.every((key) => 
    obj.hasOwnProperty(key) &&
    typeof obj[key] === "object" &&
    !Array.isArray(obj[key]) &&
    Object.keys(obj[key]).length === 4 &&
    ["create", "read", "update", "delete"].every(
      (perm) => obj[key].hasOwnProperty(perm) && typeof obj[key][perm] === "boolean"
    )
  );
}