import { CardMemberRepository } from "@/repository/card/card_member_repository";
import { CardRepository } from "@/repository/card/card_repository";
import { UserRepository } from "@/repository/user/user_repository";
import { validate as isValidUUID } from "uuid";
import { StatusCodes } from "http-status-codes";
import { broadcastToWebSocket } from "@/server";

export class CardMemberController {
  private repo: CardMemberRepository;
  private cardRepo: CardRepository;
  private userRepo: UserRepository;
  constructor(
    repo: CardMemberRepository,
    cardRepo: CardRepository,
    userRepo: UserRepository
  ) {
    this.repo = repo;
    this.cardRepo = cardRepo;
    this.userRepo = userRepo;
  }

  async getMembers(card_id: string) {
    if (!isValidUUID(card_id)) {
      return {
        status_code: StatusCodes.BAD_REQUEST,
        message: "card_id is not valid uuid",
        members: [],
      };
    }
    const cardRes = await this.cardRepo.getCard({ id: card_id });
    if (cardRes.status_code !== StatusCodes.OK) {
      return {
        status_code: StatusCodes.NOT_FOUND,
        message: "Card not found",
        members: [],
      };
    }
    const data = await this.repo.getMembersByCard(card_id);
    return { status_code: StatusCodes.OK, data };
  }

  async addMembers(card_id: string, user_ids: string[]) {
    if (!isValidUUID(card_id)) {
      return {
        status_code: StatusCodes.BAD_REQUEST,
        message: "card_id is not valid uuid",
        members: [],
      };
    }
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return {
        status_code: StatusCodes.BAD_REQUEST,
        message: "user_ids[] is required",
        members: [],
      };
    }
    const cardRes = await this.cardRepo.getCard({ id: card_id });
    if (cardRes.status_code !== StatusCodes.OK) {
      return {
        status_code: StatusCodes.NOT_FOUND,
        message: "Card not found",
        members: [],
      };
    }
    // Cek user exist
    const invalidUserIds: string[] = [];
    for (const user_id of user_ids) {
      if (!isValidUUID(user_id)) {
        invalidUserIds.push(user_id);
        continue;
      }
      const userRes = await this.userRepo.getUser({ id: user_id });
      if (userRes.status_code !== StatusCodes.OK) {
        invalidUserIds.push(user_id);
      }
    }
    if (invalidUserIds.length > 0) {
      return {
        status_code: StatusCodes.BAD_REQUEST,
        message: `User(s) not found: ${invalidUserIds.join(", ")}`,
        members: [],
      };
    }
    // Cek duplikasi member
    const alreadyMemberIds = await this.repo.getExistingMemberIds(
      card_id,
      user_ids
    );
    if (alreadyMemberIds.length > 0) {
      const existingMembers = await this.repo.getMembersByCard(card_id);
      return {
        status_code: StatusCodes.BAD_REQUEST,
        message: `User(s) already member: ${alreadyMemberIds.join(", ")}`,
        members: existingMembers,
      };
    }
    const members = await this.repo.addMembersToCard(card_id, user_ids);

    // notify clients
    broadcastToWebSocket("card_member:updated", { cardId: card_id, members });

    return { status_code: StatusCodes.OK, message: "Members added", members };
  }

  async removeMember(card_id: string, user_id: string) {
    if (!isValidUUID(card_id) || !isValidUUID(user_id)) {
      return {
        status_code: StatusCodes.BAD_REQUEST,
        message: "card_id or user_id is not valid uuid",
      };
    }
    const cardRes = await this.cardRepo.getCard({ id: card_id });
    if (cardRes.status_code !== StatusCodes.OK) {
      return { status_code: StatusCodes.NOT_FOUND, message: "Card not found" };
    }
    const userRes = await this.userRepo.getUser({ id: user_id });
    if (userRes.status_code !== StatusCodes.OK) {
      return { status_code: StatusCodes.NOT_FOUND, message: "User not found" };
    }
    const isMember = await this.repo.isMember(card_id, user_id);
    if (!isMember) {
      return {
        status_code: StatusCodes.BAD_REQUEST,
        message: "User is not a member of this card",
      };
    }
    await this.repo.removeMemberFromCard(card_id, user_id);

    const members = await this.repo.getMembersByCard(card_id);
    broadcastToWebSocket("card_member:updated", { cardId: card_id, members });

    return { status_code: StatusCodes.OK, message: "Member removed" };
  }
}
