import { Request, Response } from 'express';


export interface AccountRestViewI {
    GetMyAccount(req: Request, res: Response): Promise<void>;
    GetAccountList(req: Request, res: Response): Promise<void>;
    UpdateAccount(req: Request, res: Response): Promise<void>;
    UpdateMyAccount(req: Request, res: Response): Promise<void>;
    DeleteAccount(req: Request, res: Response):Promise <void>;
}

export interface AuthRestViewI {
    Login(req: Request, res: Response): Promise<void>;
    Register(req: Request, res: Response): Promise<void>;
    RefreshToken(req: Request, res: Response): Promise<void>;
}

export interface AccessControlRestViewI {
    CreateAccessControl(req: Request, res: Response): Promise<void>;
    GetAccessControl(req: Request, res: Response): Promise<void>;
    UpdateAccessControl(req: Request, res: Response): Promise<void>;
    DeleteAccessControl(req: Request, res: Response): Promise<void>;
}

export interface WorkspaceRestViewI {
    GetWorkspace(req: Request, res: Response): Promise<void>;
    CreateWorkspace(req: Request, res: Response): Promise<void>;
    GetWorkspaceList(req: Request, res: Response): Promise<void>;
    GetDefaultWorkspace(req: Request, res: Response): Promise<void>;
    UpdateWorkspace(req: Request, res: Response): Promise<void>;
    UpdateDefaultWorkspace(req: Request, res: Response): Promise<void>;
    DeleteWorkspace(req: Request, res: Response): Promise<void>;
}

export interface BoardRestViewI {
    CreateBoard(req: Request, res: Response): Promise<void>;
    GetBoard(req: Request, res: Response): Promise<void>;
    GetListBoard(req: Request, res: Response): Promise<void>
    UpdateBoard(req: Request, res: Response): Promise<void>;
    DeleteBoard(req: Request, res: Response): Promise<void>;
}

export interface ListRestViewI {
    CreateList(req: Request, res: Response): Promise<void>;
    GetList(req: Request, res: Response): Promise<void>;
    GetListList(req: Request, res: Response): Promise<void>
    UpdateList(req: Request, res: Response): Promise<void>;
    DeleteList(req: Request, res: Response): Promise<void>;
    MoveList(req: Request, res: Response): Promise<void>;
}

export interface CardRestViewI {
    CreateCard(req: Request, res: Response): Promise<void>;
    GetCard(req: Request, res: Response): Promise<void>;
    GetListCard(req: Request, res: Response): Promise<void>;
    SearchCard(req: Request, res: Response): Promise<void>;
    MoveCard(req: Request, res: Response): Promise<void>;
    ArchiveCard(req: Request, res: Response): Promise<void>;
    UnArchiveCard(req: Request, res: Response): Promise<void>;
    UpdateCard(req: Request, res: Response): Promise<void>;
    DeleteCard(req: Request, res: Response): Promise<void>;
    AddCustomField(req: Request, res: Response): Promise<void>;
    UpdateCustomField(req: Request, res: Response): Promise<void>;
    RemoveCustomField(req: Request, res: Response): Promise<void>;
    GetCustomField(req: Request, res: Response): Promise<void>;
    GetCardActivity(req: Request, res: Response): Promise<void>;
    GetCardTimeInList(req: Request, res: Response): Promise<void>;
    GetCardTimeInBoard(req: Request, res: Response): Promise<void>;
    GetDashcardCount(req: Request, res: Response): Promise<void>;
}

export interface CustomFieldRestViewI {
    CreateCustomField(req: Request, res: Response): Promise<void>;
    GetCustomField(req: Request, res: Response): Promise<void>;
    GetListCustomField(req: Request, res: Response): Promise<void>
    UpdateCustomField(req: Request, res: Response): Promise<void>;
    DeleteCustomField(req: Request, res: Response): Promise<void>;
}

export interface TriggerRestViewI {
    CreateTrigger(req: Request, res: Response): Promise<void>;
    GetTrigger(req: Request, res: Response): Promise<void>;
    GetListTrigger(req: Request, res: Response): Promise<void>
    UpdateTrigger(req: Request, res: Response): Promise<void>;
    DeleteTrigger(req: Request, res: Response): Promise<void>;
}

export interface FileViewI {
    UploadFile(req: Request, res: Response): Promise<void>;
    GetFiles(req: Request, res: Response): Promise<void>;
    GetFile(req: Request, res: Response): Promise<void>;
    DeleteFile(req: Request, res: Response): Promise<void>;
}

export interface LabelRestViewI {
    CreateLabel(req: Request, res: Response): Promise<void>;
    GetLabel(req: Request, res: Response): Promise<void>;
    GetLabels(req: Request, res: Response): Promise<void>;
    UpdateLabel(req: Request, res: Response): Promise<void>;
    DeleteLabel(req: Request, res: Response): Promise<void>;
}