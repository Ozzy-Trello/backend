import { Router } from "express";
import AccountRestView from "@/views/rest/account_view";
import AuthRestView from "@/views/rest/auth_view";
import {UserRepository} from "@/repository/user/user_repository";
import {AuthController} from "@/controller/auth/auth_controller";
import {restJwt} from "@/middleware/rest_middleware";
import {AccountController} from "@/controller/account/account_controller";
import { WorkspaceController } from "@/controller/workspace/workspace_controller";
import { WorkspaceRepository } from "@/repository/workspace/workspace_repository";
import WorkspaceRestView from "@/views/rest/workspace_view";
import { BoardRepository } from "@/repository/board/board_repository";
import { BoardController } from "@/controller/boards/board_controller";
import BoardRestView from "@/views/rest/board_view";

export default function (): Router {
    const root_router = Router();

    const user_repo = new UserRepository();
    const workspace_repo = new WorkspaceRepository();
    const board_repo = new BoardRepository();

    const account_controller = new AccountController(user_repo);
    const auth_controller = new AuthController(user_repo);
    const workspace_controller = new WorkspaceController(workspace_repo);
    const board_controller = new BoardController(board_repo, workspace_repo);

    const account_rest_view = new AccountRestView(account_controller);
    const auth_rest_view = new AuthRestView(auth_controller);
    const workspace_rest_view = new WorkspaceRestView(workspace_controller);
    const board_rest_view = new BoardRestView(board_controller);

    const router_account = Router();
    {
        router_account.get("/", restJwt, account_rest_view.GetMyAccount);
        router_account.put("/", restJwt, account_rest_view.UpdateMyAccount);
        router_account.get("/list", restJwt, account_rest_view.GetAccountList);
    }

    const router_auth = Router();
    {
        router_auth.post('/login', auth_rest_view.Login);
        router_auth.post('/register', auth_rest_view.Register);
        router_auth.post('/refresh-token', auth_rest_view.RefreshToken);
    }

    const router_workspace = Router();
    {
        router_workspace.post("/", restJwt, workspace_rest_view.CreateWorkspace);
        router_workspace.get("/", restJwt, workspace_rest_view.GetWorkspaceList);
        router_workspace.get("/default", restJwt, workspace_rest_view.GetDefaultWorkspace);
        router_workspace.put("/default", restJwt, workspace_rest_view.UpdateDefaultWorkspace);
        router_workspace.get("/:id", restJwt, workspace_rest_view.GetWorkspace);
        router_workspace.put("/:id", restJwt, workspace_rest_view.UpdateWorkspace);
        router_workspace.delete("/:id", restJwt, workspace_rest_view.DeleteWorkspace);
    }

    const router_board = Router();
    {
        router_board.post("/", restJwt, board_rest_view.CreateBoard);
        router_board.get("/", restJwt, board_rest_view.GetBoardList);
        router_board.get("/:id", restJwt, board_rest_view.GetBoard);
        router_board.put("/:id", restJwt, board_rest_view.UpdateBoard);
        router_board.delete("/:id", restJwt, board_rest_view.DeleteBoard);
    }

    root_router.use("/auth", router_auth)
    root_router.use("/account", router_account)
    root_router.use("/workspace", router_workspace)
    root_router.use("/board", router_board)
    return root_router
}