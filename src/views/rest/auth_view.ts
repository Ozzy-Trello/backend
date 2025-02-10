import {AuthRestViewI} from "@/views/rest/interfaces";
import {Request, Response} from "express";
import {AuthControllerI, LoginResponse} from "@/controller/auth/auth_interfaces";
import {StatusCodes, ReasonPhrases} from "http-status-codes";
import {ResponseData} from "@/utils/response_utils";


export default class AuthRestView implements AuthRestViewI {
    private controller: AuthControllerI
    constructor(c: AuthControllerI) {
        this.controller = c;
        this.Login = this.Login.bind(this);
    }

    async Login(req: Request, res: Response): Promise<void> {
        // try {
            const login_credential: ResponseData<LoginResponse> = await this.controller.Login({
                identity: req.body.identity,
                password: req.body.password
            })
            if (login_credential.message) {
                res.status(login_credential.status_code).json({
                    "message": login_credential.message,
                })
                return
            }
            res.status(login_credential.status_code).json(login_credential.data)
            return
        // } catch {
        //     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({"message": ReasonPhrases.INTERNAL_SERVER_ERROR})
        // }
    }

    async RefreshToken(req: Request, res: Response): Promise<void> {
        res.json({ message: 'patch token route router' });
    }

    async Register(req: Request, res: Response): Promise<void> {
        res.json({ message: 'post register route router' });
    }
}