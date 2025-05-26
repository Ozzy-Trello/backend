import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CardMemberControllerI } from '@/controller/card/card_member_interfaces';
import { CardMemberRestViewI } from './interfaces';

export class CardMemberRestView implements CardMemberRestViewI{
  private controller: CardMemberControllerI;
  constructor(controller: CardMemberControllerI) {
    this.controller = controller;
    this.getMembers = this.getMembers.bind(this);
    this.addMembers = this.addMembers.bind(this);
    this.removeMember = this.removeMember.bind(this);
  }

  async getMembers(req: Request, res: Response) {
    const cardId = req.params.id;
    if (!cardId) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'card_id is required' });
      return;
    }
    const members = await this.controller.getMembers(cardId);
    res.status(StatusCodes.OK).json({ members });
  }

  async addMembers(req: Request, res: Response) {
    const cardId = req.params.id;
    const user_ids = req.body.user_ids;
    if (!cardId || !Array.isArray(user_ids) || user_ids.length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'card_id and user_ids[] are required' });
      return;
    }
    const members = await this.controller.addMembers(cardId, user_ids);
    res.status(StatusCodes.OK).json({ message: 'Members added', members });
  }

  async removeMember(req: Request, res: Response) {
    const cardId = req.params.id;
    const userId = req.params.user_id;
    if (!cardId || !userId) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'card_id and user_id are required' });
      return;
    }
    await this.controller.removeMember(cardId, userId);
    res.status(StatusCodes.OK).json({ message: 'Member removed' });
  }
} 