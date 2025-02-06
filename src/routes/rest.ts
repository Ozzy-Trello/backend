import { Router } from "express";
import AccountRestView from "@/views/rest/account_view";

export default function (): Router {
    const root_router = Router()
    const account_rest_view = new AccountRestView()

    const router_account = Router()
    {
        router_account.get("/", account_rest_view.GetAccount)
    }

    root_router.use("/account", router_account)

    return root_router
}