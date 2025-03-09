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
import { RoleRepository } from "@/repository/role_access/role_repository";
import { AccessControlController } from "@/controller/access_control/access_control_controller";
import AccessControlRestView from "@/views/rest/access_control_view";
import { ListRepository } from "@/repository/list/list_repository";
import { ListController } from "@/controller/list/list_controller";
import ListRestView from "@/views/rest/list_view";

export default function (): Router {
    const root_router = Router();

    const user_repo = new UserRepository();
    const role_repo = new RoleRepository();
    const workspace_repo = new WorkspaceRepository();
    const board_repo = new BoardRepository();
    const list_repo = new ListRepository();

    const account_controller = new AccountController(user_repo);
    const access_control_controller = new AccessControlController(role_repo);
    const auth_controller = new AuthController(user_repo, workspace_repo, role_repo);
    const workspace_controller = new WorkspaceController(workspace_repo, role_repo, user_repo);
    const board_controller = new BoardController(board_repo, workspace_repo);
    const list_controller = new ListController(list_repo, board_repo);

    const account_rest_view = new AccountRestView(account_controller);
    const access_control_rest_view = new AccessControlRestView(access_control_controller);
    const auth_rest_view = new AuthRestView(auth_controller);
    const workspace_rest_view = new WorkspaceRestView(workspace_controller);
    const board_rest_view = new BoardRestView(board_controller);
    const list_rest_view = new ListRestView(list_controller);

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

    const router_access_control = Router();
    {
        router_access_control.post("/", restJwt, access_control_rest_view.CreateAccessControl);
        router_access_control.get("/", restJwt, access_control_rest_view.GetAccessControlList);
        router_access_control.get("/:id", restJwt, access_control_rest_view.GetAccessControl);
        router_access_control.put("/:id", restJwt, access_control_rest_view.UpdateAccessControl);
        router_access_control.delete("/:id", restJwt, access_control_rest_view.DeleteAccessControl);
    }

    const router_list_control = Router();
    {
        router_list_control.post("/", restJwt, list_rest_view.CreateList);
        router_list_control.get("/", restJwt, list_rest_view.GetListList);
        router_list_control.get("/:id", restJwt, list_rest_view.GetList);
        router_list_control.put("/:id", restJwt, list_rest_view.UpdateList);
        router_list_control.delete("/:id", restJwt, list_rest_view.DeleteList);
    }

    root_router.use("/auth", router_auth)
    root_router.use("/account", router_account)
    root_router.use("/workspace", router_workspace)
    root_router.use("/board", router_board)
    root_router.use("/access-control", router_access_control)
    root_router.use("/list", router_list_control)
    return root_router
}