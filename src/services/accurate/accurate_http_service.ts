import axios, { Method, AxiosRequestConfig } from "axios";

export interface AccurateApiResponse<T = any> {
  data: {
    s: boolean;
    d: T;
  };
  message: string;
}

export interface AccurateHttpOptions {
  url: string;
  method: Method;
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export class AccurateHttpService {
  static async request<T>({
    url,
    method,
    body,
    headers = {},
    params,
  }: AccurateHttpOptions): Promise<AccurateApiResponse<T>> {
    const config: AxiosRequestConfig = {
      url,
      method,
      headers,
      params,
      data: body,
      validateStatus: () => true,
    };
    try {
      const response: AccurateApiResponse<T> = await axios(config);
      if (!response.data.s) {
        throw new Error(`Accurate API error: ${response.data.d}`);
      }
      return response;
    } catch (error: any) {
      console.error(error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Unknown Accurate API error"
      );
    }
  }
}
