import { Request, Response } from 'express';


export interface AccountRestViewI {
    GetAccount(req: Request, res: Response): void;
    GetAccountList(req: Request, res: Response): void;
    UpdateAccount(req: Request, res: Response): void;
    DeleteAccount(req: Request, res: Response): void;
}

export interface AuthRestViewI {
    Login(req: Request, res: Response): void;
    Register(req: Request, res: Response): void;
    RefreshToken(req: Request, res: Response): void;
}

export interface WorkspaceRestViewI {
    GetWorkspace(req: Request, res: Response): void;
    GetWorkspaceList(req: Request, res: Response): void;
    UpdateWorkspace(req: Request, res: Response): void;
    DeleteWorkspace(req: Request, res: Response): void;
}

