import { Model } from "./base/Model";
import { TFormErrors, IAppState, IProduct, IOrder, TBasketProduct, TCategory } from "../types";

export class Product extends Model<IProduct> {
  id: string;
  title: string;
  description: string;
  image: string;
  category: TCategory;
  price: number | null;
  inBasket: boolean = false;
}

export class AppState extends Model<IAppState> {
  products: IProduct[];
  basket: TBasketProduct[] = [];
  preview: string | null;
  order: Partial<IOrder> = {};
  formErrors: TFormErrors | null = null;

  setProducts(items: IProduct[]): void {
    this.products = items.map(item => new Product(item, this.events));
    this.emitChanges('products: changed', { products: this.products });
  }

  setPreview(item: IProduct): void {
    this.preview = item.id;
    this.emitChanges('preview:changed', item);
  }

  getProductById(productId: string): IProduct {
    for (let i = 0; i < this.products.length; i++) {
      if (productId === this.products[i].id) {
        return this.products[i]
      }
    }
  }
 
  addProductInBasket(product: TBasketProduct): void {
    product.inBasket = true;
    this.basket.push(product);
    this.emitChanges('basket:changed', this.basket);
  }

  
  removeProductFromBasket(productId: string): void {
    const removeProduct = this.getProductById(productId);
    removeProduct.inBasket = false;
    this.basket = this.basket.filter(item => productId !== item.id);
    this.emitChanges('basket:changed');
  }

  clearBasket(): void {
    this.basket.forEach(item => {
      const removeProduct = this.getProductById(item.id)
      removeProduct.inBasket = false;
    })
    this.basket = [];
    this.emitChanges('basket:changed');
  }

  clearOrder(): void {
    this.order = {};
  }

  clearErrors(): void {
    this.formErrors = null;
  }

  getTotal(): number {
    return this.basket.reduce((sum, item) => {
      return sum = sum + item.price
    }, 0)
  }

  setOrderBasket(): void {
    this.order.items = this.basket.map(item => item.id);
    this.order.total = this.getTotal();
  }

  setOrderField<K extends keyof IOrder>(field: K, value: IOrder[K]): void {
    this.order[field] = value
    if (this.validateOrder()) {
      this.events.emit('order:ready', this.order);
    }
  }

  validateOrder(): boolean {
    const errors: typeof this.formErrors = {};
    if (!this.order.email) {
      errors.email = 'Необходимо указать email';
    }
    if (!this.order.phone) {
      errors.phone = 'Необходимо указать телефон';
    }
    if (!this.order.address) {
      errors.address = 'Необходимо указать адрес';
    }
    if (!this.order.payment) {
      errors.payment = 'Необходимо указать способ оплаты';
    }
    this.formErrors = errors;
    this.events.emit('formErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }
}