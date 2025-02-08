import {AuthRestViewI} from "@/views/rest/interfaces";
import {Request, Response} from "express";
import {AuthControllerI, LoginSuccessResponse} from "@/controller/auth/auth_interfaces";
import {RestError} from "@/errors/rest_error";
import {} from "http-status-codes/build/es/utils";
import {StatusCodes, ReasonPhrases} from "http-status-codes";
import Rest from "@/routes/rest";


export default class AuthRestView implements AuthRestViewI {
    private controller: AuthControllerI
    constructor(c: AuthControllerI) {
        this.controller = c;
    }

    async Login(req: Request, res: Response): Promise<void> {
        try {
            const login_credential: LoginSuccessResponse = await this.controller.Login({identity: "aaa", password: "aaaaaa"})
            res.json(login_credential)
        } catch (e)  {
            if (e instanceof RestError) {
                res.json({"aaa": "aaaa"});
            }
        } finally {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({"message": ReasonPhrases.INTERNAL_SERVER_ERROR})
        }
    }

    async RefreshToken(req: Request, res: Response): Promise<void> {
        res.json({ message: 'patch token route router' });
    }

    async Register(req: Request, res: Response): Promise<void> {
        res.json({ message: 'post register route router' });
    }
}