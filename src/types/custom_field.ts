export enum SourceType {
  User = 'user',
  Product = 'product'
}

export interface TriggerValue {
  target_list_id?: string;
  message_telegram?: string;
  label_card_id?: string;
}
