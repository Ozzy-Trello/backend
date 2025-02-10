import { Router } from "express";
import AccountRestView from "@/views/rest/account_view";
import AuthRestView from "@/views/rest/auth_view";
import {UserRepository} from "@/repository/user/user_repository";
import {AuthController} from "@/controller/auth/auth_controller";

export default function (): Router {
    const root_router = Router();

    const user_repo = new UserRepository();
    const auth_controller = new AuthController(user_repo);

    const account_rest_view = new AccountRestView();
    const auth_rest_view = new AuthRestView(auth_controller);


    const router_account = Router();
    {
        router_account.get("/", account_rest_view.GetAccount);
    }

    const router_auth = Router();
    {
        router_auth.post('/login', auth_rest_view.Login);
        router_auth.post('/register', auth_rest_view.Register);
        router_auth.patch('/refresh-token', auth_rest_view.RefreshToken);
    }

    root_router.use("/account", router_account)
    root_router.use("/auth", router_auth)
    return root_router
}