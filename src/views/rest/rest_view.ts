import { AuthRestViewI } from "@/views/rest/interfaces";
import {Request, Response} from "express";


export default class AuthRestView implements AuthRestViewI {
    Login(req: Request, res: Response): void {
    }

    RefreshToken(req: Request, res: Response): void {
    }

    Register(req: Request, res: Response): void {
    }

}

