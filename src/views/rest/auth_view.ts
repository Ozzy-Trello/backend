import {AuthRestViewI} from "@/views/rest/interfaces";
import {Request, Response} from "express";


export default class AuthRestView implements AuthRestViewI {
    Login(req: Request, res: Response): void {
        res.json({ message: 'post login route router' });
    }

    RefreshToken(req: Request, res: Response): void {
        res.json({ message: 'patch token route router' });
    }

    Register(req: Request, res: Response): void {
        res.json({ message: 'post register route router' });
    }

}

