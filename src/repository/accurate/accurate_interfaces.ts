export interface AccurateRepositoryI {
  openDb(id: number, token: string): Promise<string>;
  addToken(token: string, expiry_date: Date): Promise<any>;
  getLatestToken(): Promise<AccurateAuthToken | null>;
  getItemCategoryList(): Promise<ItemCategory[]>;
  getItemCategoryDetail(id: number): Promise<ItemCategoryDetail>;
  getGlaccountList(): Promise<any>;
  getItemList(): Promise<Item[]>;
}

export interface AccurateAuthToken {
  token: string;
  db_session: string;
  expiry_date: Date;
}

export interface ItemCategory {
  id: number;
  name: string;
  parent?: { name: string };
  no: string;
  children?: ItemCategory[];
}

export interface ItemCategoryDetail {
  id: number;
  name: string;
  parent?: { name: string };
  satuan?: string;
  [key: string]: any;
}

export interface Item {
  id: number;
  name: string;
  parent?: { name: string };
  no: string;
  [key: string]: any;
}

export interface ItemAdjustmentDetail {
  itemAdjustmentType: string;
  quantity: number;
  itemNo: string;
}

export interface SaveItemAdjustmentBody {
  adjustmentAccountNo: string;
  description: string;
  detailItem: ItemAdjustmentDetail[];
  transDate: string;
}

export interface AccurateApiResponse<T = any> {
  data: {
    s: boolean;
    d: T;
  };
  message: string;
}
