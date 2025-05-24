export enum CardType {
  Regular = 'regular',
  Dashcard = 'dashcard',
}

export interface Label {
  id: string;
  name: string;
  value?: string;
  value_type: 'color' | 'user' | 'custom_field';
  created_at?: Date;
  updated_at?: Date;
}