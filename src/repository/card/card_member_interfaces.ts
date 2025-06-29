export interface CardMemberRepositoryI {
  getMembersByCard(
    card_id: string
  ): Promise<Array<{ id: string; username: string; email: string }>>;
  addMembersToCard(
    card_id: string,
    user_ids: string[]
  ): Promise<Array<{ id: string; username: string; email: string }>>;
  removeMemberFromCard(card_id: string, user_id: string): Promise<void>;
  isCardExist(card_id: string): Promise<boolean>;
  isUserExist(user_id: string): Promise<boolean>;
  isMember(card_id: string, user_id: string): Promise<boolean>;
  getExistingMemberIds(card_id: string, user_ids: string[]): Promise<string[]>;
  removeAllMemberFromCard(card_id: string): Promise<number>;
}
