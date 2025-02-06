import { WorkspaceRestViewI } from "@/views/rest/interfaces";
import {Request, Response} from "express";



export default class WorkspaceRestView implements WorkspaceRestViewI {
    GetWorkspace(req: Request, res: Response): void {
        throw new Error("Method not implemented.");
    }

    GetWorkspaceList(req: Request, res: Response): void {
        throw new Error("Method not implemented.");
    }

    UpdateWorkspace(req: Request, res: Response): void {
        throw new Error("Method not implemented.");
    }

    DeleteWorkspace(req: Request, res: Response): void {
        throw new Error("Method not implemented.");
    }
}

