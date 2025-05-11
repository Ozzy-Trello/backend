export interface IAccurateRepository {
  addToken(token: string, expiry_date: Date): Promise<any>;
  getLatestToken(): Promise<any>;
  getItemCategoryList(): Promise<any>;
  getItemCategoryDetail(id: number): Promise<any>;
  getItemDetail(id: number): Promise<any>;
  getGlaccountList(): Promise<any>;
  getItemList(): Promise<any>;
  saveItemAdjustment(body: import("../../repository/accurate/accurate_interfaces").SaveItemAdjustmentBody): Promise<any>;
}
