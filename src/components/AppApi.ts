import { Api, ApiListResponse } from "./base/Api";
import { IProduct, IOrder, TOrderResult } from "../types";

interface IAppApi {
  cdn: string;
  getProductsList(): Promise<IProduct[]>;
  getProduct(id: string): Promise<IProduct>;
  postOrder(order: IOrder): Promise<TOrderResult>;
}

export class AppApi extends Api implements IAppApi {
  readonly cdn: string;

  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  getProductsList(): Promise<IProduct[]> {
    return this.get('/product/')
      .then((data: ApiListResponse<IProduct>) => {
        return data.items.map((item) => {
          return {
            ...item,
            image: this.cdn + item.image
          }
        })
      })
  }

  getProduct(id: string): Promise<IProduct> {
    return this.get(`/product/${id}`)
     .then((item: IProduct) => {
        return {
          ...item,
          image: this.cdn + item.image
        }
     }) 
  }

  postOrder(order: IOrder): Promise<TOrderResult> {
    return this.post(`/order`, order)
      .then((orderResult: TOrderResult) => orderResult)
  }
}
