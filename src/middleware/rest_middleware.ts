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


// const errorHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
// 	(req: Request, res: Response, next: NextFunction) =>
// 		fn(req, res, next).catch(next);

// export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
// 	console.error(err); // Bisa diganti dengan logger seperti Winston/Pino
//
// 	if (err instanceof AppError) {
// 		return res.status(err.statusCode).json({ message: err.message });
// 	}
//
// 	return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
// 		message: ReasonPhrases.INTERNAL_SERVER_ERROR,
// 	});
// };