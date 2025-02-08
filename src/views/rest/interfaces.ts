import { Request, Response } from 'express';


export interface AccountRestViewI {
    GetAccount(req: Request, res: Response): Promise<void>;
    GetAccountList(req: Request, res: Response): Promise<void>;
    UpdateAccount(req: Request, res: Response): Promise<void>;
    DeleteAccount(req: Request, res: Response):Promise <void>;
}

export interface AuthRestViewI {
    Login(req: Request, res: Response): Promise<void>;
    Register(req: Request, res: Response): Promise<void>;
    RefreshToken(req: Request, res: Response): Promise<void>;
}

export interface WorkspaceRestViewI {
    GetWorkspace(req: Request, res: Response): Promise<void>;
    GetWorkspaceList(req: Request, res: Response): Promise<void>;
    UpdateWorkspace(req: Request, res: Response): Promise<void>;
    DeleteWorkspace(req: Request, res: Response): Promise<void>;
}

