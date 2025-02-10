import { WorkspaceRestViewI } from "@/views/rest/interfaces";
import {Request, Response} from "express";



export default class WorkspaceRestView implements WorkspaceRestViewI {
    async GetWorkspace(req: Request, res: Response): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async GetWorkspaceList(req: Request, res: Response): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async UpdateWorkspace(req: Request, res: Response): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async DeleteWorkspace(req: Request, res: Response): Promise<void> {
        throw new Error("Method not implemented.");
    }
}