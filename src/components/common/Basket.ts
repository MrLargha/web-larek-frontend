import { View } from "../base/View";
import { IEvents } from "../base/Events";
import { ensureElement, createElement, formatNumber } from "../../utils/utils";

interface IBasket {
  items: HTMLElement[];
  total: number;
}

export class Basket extends View<IBasket> {
  protected _list: HTMLElement
  protected _total: HTMLElement
  protected _button: HTMLElement

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._list = ensureElement<HTMLElement>('.basket__list', this.container);
    this._total = this.container.querySelector('.basket__price');
    this._button = this.container.querySelector('.basket__button');

    if (this._button) {
      this._button.addEventListener('click', () => {
          events.emit('basket:submit');
      });
    }

    this.items = [];
  }

  set items(items: HTMLElement[]) {
    if (items.length) {
        this._list.replaceChildren(...items);
        this.setDisabled(this._button, false)
    } else {
        this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
            textContent: 'Корзина пуста'
        }));
        this.setDisabled(this._button, true)
    }
  }

  set total(total: number) {
    this.setText(this._total, formatNumber(total) + ' ' + 'синапсов');
}

}