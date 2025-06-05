import {
  AccurateRepositoryI,
  AccurateAuthToken,
  ItemCategory,
  ItemCategoryDetail,
  AccurateApiResponse,
  Item,
} from "./accurate_interfaces";
import db from "../../database";
import axios from "axios";
import { AdjustmentType } from "./enum";
import { AccurateHttpService } from "@/services/accurate/accurate_http_service";

export class AccurateRepository implements AccurateRepositoryI {
  private baseUrl: string;
  private zeusUrl: string;
  private accurateDBId: number;

  constructor() {
    this.baseUrl = "https://account.accurate.id/api/";
    this.zeusUrl = "https://zeus.accurate.id/accurate/api/";
    // this.accurateDBId = 574622; prod
    this.accurateDBId = 1825671;
  }

  async openDb(id: number, token: string): Promise<string> {
    const response = await axios.get(this.baseUrl + "open-db.do", {
      params: { id },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.session;
  }

  async addToken(token: string, expiry_date: Date): Promise<any> {
    const findToken = await db
      .selectFrom("accurate_auth")
      .where("token", "=", token)
      .executeTakeFirst();

    if (findToken) {
      return "Token hasn't expired";
    }

    const db_session = await this.openDb(this.accurateDBId, token);
    const insertDb = await db
      .insertInto("accurate_auth")
      .values({ token, db_session, expiry_date })
      .execute();
    return insertDb;
  }

  async getLatestToken(): Promise<AccurateAuthToken | null> {
    const result = await db
      .selectFrom("accurate_auth")
      .orderBy("expiry_date", "desc")
      .limit(1)
      .selectAll()
      .executeTakeFirst();
    return result ? (result as AccurateAuthToken) : null;
  }

  async getItemCategoryList(): Promise<ItemCategory[]> {
    const latest = await this.getLatestToken();
    if (!latest || !latest.token || !latest.db_session) {
      throw new Error("No AccurateAuth token/session found in DB");
    }
    const url = this.zeusUrl + "item-category/list.do";
    const body = {
      session: latest.db_session,
      fields: "name,id,parent,no",
    };
    const headers = {
      Authorization: `Bearer ${latest.token}`,
      "Content-Type": "application/json",
    };
    const response = await AccurateHttpService.request<any[]>({
      url,
      method: "POST",
      body,
      headers,
    });
    const filteredList: ItemCategory[] = response.data.d;
    const result: { [key: string]: ItemCategory } = {};
    filteredList.forEach((item: ItemCategory) => {
      if (!item.parent || !item.parent.name || item.name === item.parent.name) {
        result[item.name] = {
          id: item.id,
          name: item.name,
          no: item.no,
          children: [],
        };
      }
    });
    filteredList.forEach((item: ItemCategory) => {
      if (item.parent && item.parent.name && result[item.parent.name]) {
        if (item.name !== item.parent.name) {
          result[item.parent.name].children!.push({
            id: item.id,
            name: item.name,
            no: item.no,
            parent: { name: item.parent.name },
          });
        }
      }
    });
    return Object.values(result);
  }

  async getItemCategoryDetail(id: number): Promise<ItemCategoryDetail> {
    const latest = await this.getLatestToken();
    if (!latest || !latest.token || !latest.db_session) {
      throw new Error("No AccurateAuth token/session found in DB");
    }
    const url = this.zeusUrl + "item-category/detail.do";
    const body = {
      session: latest.db_session,
      id,
    };
    const headers = {
      Authorization: `Bearer ${latest.token}`,
      "Content-Type": "application/json",
    };
    const response = await AccurateHttpService.request<any>({
      url,
      method: "POST",
      body,
      headers,
    });
    return response.data.d;
  }

  async getItemDetail(productId: number) {
    const latest = await this.getLatestToken();
    if (!latest || !latest.token || !latest.db_session) {
      throw new Error("No AccurateAuth token/session found in DB");
    }
    const url = this.zeusUrl + "item/detail.do";
    const body = {
      session: latest.db_session,
      id: productId,
    };
    const headers = {
      Authorization: `Bearer ${latest.token}`,
      "Content-Type": "application/json",
    };
    const response = await AccurateHttpService.request<any>({
      url,
      method: "POST",
      body,
      headers,
    });
    const result = {
      id: response.data.d.id,
      name: response.data.d.name,
    };
    return result;
  }

  async getGlaccountList(): Promise<any> {
    const latest = await this.getLatestToken();
    if (!latest || !latest.token || !latest.db_session) {
      throw new Error("No AccurateAuth token/session found in DB");
    }

    const res = await AccurateHttpService.request<any[]>({
      url: this.zeusUrl + "glaccount/list.do",
      method: "POST",
      body: {
        session: latest.db_session,
        fields: "name,id,no",
        filter: {
          keywords: {
            op: "CONTAIN",
            val: [
              "HPP Bahan HEMCA Stok",
              "HPP Bahan Reject",
              "Beban Penyesuaian Produk",
              "Beban Penyesuaian Bahan",
              "Persediaan Produk Reject",
              "HPP Kain Keras",
              "HPP Kancing",
              "HPP Label",
              "Beban Perlengkapan",
              "HPP Benang",
              "HPP Hang Tag",
              "HPP Plastik OPP",
              "Beban Penyesuaian Aksesoris",
            ],
          },
        },
      },
      headers: {
        Authorization: `Bearer ${latest.token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }

  async saveItemAdjustment({
    adjustmentAccountNo,
    description,
    detailItem,
    transDate,
  }: {
    adjustmentAccountNo: string;
    description: string;
    detailItem: Array<{
      itemAdjustmentType: AdjustmentType;
      quantity: number;
      itemNo: string;
      itemUnitName: string;
    }>;
    transDate: string;
  }): Promise<AccurateApiResponse<string[]>> {
    const latest = await this.getLatestToken();
    if (!latest || !latest.token) {
      throw new Error("No AccurateAuth token/session found in DB");
    }
    return AccurateHttpService.request<string[]>({
      url: this.zeusUrl + "item-adjustment/save.do",
      method: "POST",
      body: {
        adjustmentAccountNo,
        session: latest.db_session,
        description,
        detailItem,
        transDate,
      },
      headers: {
        Authorization: `Bearer ${latest.token}`,
        "Content-Type": "application/json",
      },
    });
  }

  async getItemList(search?: string): Promise<Item[]> {
    const latest = await this.getLatestToken();
    if (!latest || !latest.token) {
      throw new Error("No AccurateAuth token/session found in DB");
    }

    const defaultValues = [
      "Aksesoris Produk",
      "Hangtag",
      "Kancing",
      "Label Size",
      "Plastik OPP",
      "Resleting",
      "Bahan / Kain",
      "Kain Cotton",
      "Kain Lacost",
      "Kain Lacoste",
      "Komponen Produksi",
      "Benang",
      "Kain Keras",
      "Krah & Manset",
      "Perlengkapan Produksi",
      "Rib",
    ];

    const searchValues = search && search.length > 0 ? [search] : defaultValues;

    const response = await AccurateHttpService.request<any>({
      url: this.zeusUrl + "item/list.do",
      method: "POST",
      body: {
        session: latest.db_session,
        fields: "name,id,parent,no,itemCategory,itemUnit",
        sp: {
          pageSize: 500,
        },
        filter: {
          leafOnly: true,
          keywords: {
            op: "CONTAIN",
            val: searchValues,
          },
        },
      },
      headers: {
        Authorization: `Bearer ${latest.token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.d;
  }
}
