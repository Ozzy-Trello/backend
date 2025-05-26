export interface CardMemberControllerI {
  getMembers(card_id: string): Promise<{ status_code: number, message?: string, members?: any[] }>;
  addMembers(card_id: string, user_ids: string[]): Promise<{ status_code: number, message?: string, members?: any[] }>;
  removeMember(card_id: string, user_id: string): Promise<{ status_code: number, message?: string }>;
} 