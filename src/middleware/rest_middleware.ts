import { NextFunction, Request, Response } from 'express';
import { Config } from "@/config";
import { ExtractToken } from "@/utils/security_utils";

export const restJwt = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '');

		if (!token) {
			throw new Error();
		}

		req.auth = ExtractToken(token, Config.REST_SECRET_KEY);

		next();
	} catch (err) {
		res.status(401).json({
			"message": "please authentication"
		});
	}
};
