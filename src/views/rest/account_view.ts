import { AccountRestViewI } from "@/views/rest/interfaces";
import {Request, Response} from "express";



export default class AccountRestView implements AccountRestViewI {
    async GetAccount(req: Request, res: Response): Promise<void> {
        res.json({ message: 'get account route router' });
    }

    async GetAccountList(req: Request, res: Response): Promise<void> {
        res.json({ message: 'get account list route router' });
    }

    async UpdateAccount(req: Request, res: Response): Promise<void> {
        res.json({ message: 'update account route router' });
    }

    async DeleteAccount(req: Request, res: Response): Promise<void> {
        res.json({ message: 'delete account route router' });
    }
}
