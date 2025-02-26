import { View } from "./base/View";
import { TCategory } from "../types";
import { ensureElement, bem, formatNumber } from "../utils/utils";

interface ICardActions {
  onClick: (event: MouseEvent) => void;
}

export interface ICard {
  id: string;
  title: string;
  image?: string;
  category?: string;
  price: number;
}

export class Card<T = ICard> extends View<T> {
  static allCategory: Record<TCategory, string> = {
    'софт-скил': 'soft',
    'хард-скил': 'hard',
    'кнопка': 'button',
    'дополнительное': 'additional',
    'другое': 'other',
  };
  protected _title: HTMLElement;
  protected _category?: HTMLSpanElement;
  protected _image?: HTMLImageElement;
  protected _price: HTMLSpanElement;

  constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
    this._category = container.querySelector(`.${blockName}__category`);
    this._image = container.querySelector(`.${blockName}__image`);
    this._price = ensureElement<HTMLSpanElement>(`.${blockName}__price`, container);

    if (actions?.onClick) {
      this.container.addEventListener('click', actions?.onClick)
    }
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }

  get id(): string {
    return this.container.dataset.id || '';
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  get title(): string {
    return this._title.textContent || '';
  }

  set image(value: string) {
    this.setImage(this._image, value, this.title)
  }

  set category(value: TCategory) {
    this._category.classList.add(bem('card', 'category', Card.allCategory[value]).name)
    this.setText(this._category, value);
  }

  set price(value: number) {
    if (value === null) {
      this.setText(this._price, 'Бесценно');
    } else {
      this.setText(this._price, `${formatNumber(value)} синапсов`);
    }
  }

  get price(): number {
    const price = parseInt(this._price.textContent);
    if (isNaN(price)) {
      return null
    }
    return price;
  }
}

type TCardPreview = {
  description: string;
  inBasket: boolean;
}

export class CardPreview extends Card<TCardPreview & ICard> {
  protected _description: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super('card', container)
    this._description = ensureElement<HTMLParagraphElement>('.card__text', container);
    this._button = ensureElement<HTMLButtonElement>('.card__button', container);
    
    if (actions?.onClick) {
      this._button.addEventListener('click', actions?.onClick)
    }
  }

  set description(value: string) {
    this.setText(this._description, value)
  }

  set inBasket(value: boolean) {
    if (value) {
      this.setText(this._button, 'Убрать из корзины')
    } else {
      this.setText(this._button, 'В корзину')
    }
  }

  set price(value: number) {
    super.price = value;
    if (value === null) {
      this.disabledButton();
    }
  }

  disabledButton() {
    this.setDisabled(this._button, true);
    this.setText(this._button, 'Бесценно');
  }
  
}

type TCardBasket = {
  index: number;
  title: string;
  price: number;
}

export class CardBasket extends Card<TCardBasket> {
  protected _index: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super('card', container);

    this._index = ensureElement<HTMLElement>('.basket__item-index', container);
    this._button = ensureElement<HTMLButtonElement>('.card__button', container);

    if (actions?.onClick) {
    this._button.addEventListener('click', actions?.onClick);
    }
  }

  set index(value:number) {
    this.setText(this._index, value);
  }
}