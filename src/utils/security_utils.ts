import jwt from "jsonwebtoken";

export function GenerateToken(payload: object, key: string) : string {
	return jwt.sign(payload, key)
}
