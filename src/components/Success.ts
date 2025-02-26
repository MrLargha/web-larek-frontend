import { View } from "./base/View";
import { ensureElement, formatNumber } from "../utils/utils";

interface ISuccess {
  total: number;
}

interface ISuccessActions {
  onClick: () => void;
}

export class Success extends View<ISuccess> {
  protected _closeButton: HTMLElement;
  protected _total: HTMLElement;

  constructor(container: HTMLElement, actions: ISuccessActions) {
    super(container);

    this._closeButton = ensureElement<HTMLElement>('.order-success__close', this.container);
    this._total = ensureElement<HTMLElement>('.order-success__description', container);

    if (actions?.onClick) {
      this._closeButton.addEventListener('click', actions.onClick);
    }
  }

  set total(value: number) {
    this.setText(this._total, `Cписано ${formatNumber(value)} синапсов`)
  }
}