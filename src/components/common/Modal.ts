import { View } from "../base/View";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";

interface IModal{
  content: HTMLElement;
}

export class Modal extends View<IModal> {
  protected _closeButton: HTMLButtonElement;
  protected _content: HTMLElement;
  protected _handleEscClose: (this: IModal, ev: KeyboardEvent) => void;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
    this._content = ensureElement<HTMLElement>('.modal__content', container);
    
    this._handleEscClose = this.closeByEsc.bind(this);
    this._closeButton.addEventListener('click', this.close.bind(this));
    this.container.addEventListener('click', this.close.bind(this));
    this._content.addEventListener('click', (event) => event.stopPropagation());
  }

  set content(value: HTMLElement) {
    this._content.replaceChildren(value);
  }

  open() {
    this.container.classList.add('modal_active');
    document.addEventListener('keydown', this._handleEscClose);
    this.events.emit('modal:open');
  }

  close() {
    this.container.classList.remove('modal_active');
    this.content = null;
    document.removeEventListener('keydown', this._handleEscClose);
    this.events.emit('modal:close');
  }

  closeByEsc(evt: KeyboardEvent){
    if (evt.key === 'Escape') {
      this.close()
    }
  }

  render(data: IModal): HTMLElement {
    super.render(data);
    this.open();
    return this.container;
  }
}