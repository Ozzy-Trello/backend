import { AccountRestViewI } from "@/views/rest/interfaces";
import {Request, Response} from "express";



export default class AccountRestView implements AccountRestViewI {
    GetAccount(req: Request, res: Response): void {
        res.json({ message: 'get account route router' });
    }

    GetAccountList(req: Request, res: Response): void {
        res.json({ message: 'get account list route router' });
    }

    UpdateAccount(req: Request, res: Response): void {
        res.json({ message: 'update account route router' });
    }

    DeleteAccount(req: Request, res: Response): void {
        res.json({ message: 'delete account route router' });
    }
}

