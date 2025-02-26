export interface IProductStatus {
  inBasket: boolean;
}

export interface IProductItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: TCategory;
  price: number | null
}

export interface IOrderInfoForm {
  payment: 'cash' | 'card' | null;
  address: string;
}

export interface IContactForm {
  email: string;
  phone: string;
}

export type TOrderForm =  IOrderInfoForm & IContactForm

export interface IOrder extends TOrderForm {
  total: number;
  items: string[];
}

export interface IAppState {
  products: IProduct[];
  basket: string[];
  preview: string | null;
  order: IOrder;
}

export type IProduct = IProductItem & IProductStatus

export type TCategory = 'софт-скил' | 'хард-скил' | 'кнопка' | 'дополнительное' | 'другое';

export type TBasketProduct = Pick<IProduct, 'title' | 'price' | 'id' | 'inBasket'>;

export type TFormErrors = Partial<Record<keyof IOrder, string>>;

export type TOrderResult = {
  id: string;
  total: number;
}



