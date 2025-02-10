import jwt, {JwtPayload} from 'jsonwebtoken';
import {NextFunction, Request, Response} from 'express';
import {Config} from "@/config";

export interface CustomRequest extends Request {
	token: string | JwtPayload;
}

export const restJwt = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '');

		if (!token) {
			throw new Error();
		}

		(req as CustomRequest).token = jwt.verify(token, Config.REST_KEY);

		next();
	} catch (err) {
		res.status(401).send('Please authenticate');
	}
};
