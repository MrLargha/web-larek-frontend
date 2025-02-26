# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src\scss\styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении

Продукт 

```
export interface IProductStatus {
  inBasket: boolean;
}
```

```
export interface IProductItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'софт-скил' | 'хард-скил' | 'кнопка' | 'дополнительное' | 'другое';
  price: number | null
}
```

Заказ

```
export interface IOrder {
  payment: 'cash' | 'card';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}
```

Интерфейс для хранение состояния приложения

```
export interface IAppState {
  catalog: IProduct[];
  basket: string[];
  preview: string | null;
  order: IOrder | null;
}
```


Данные продукта, используемые в корзине

```
export type TBasketProduct = Pick<IProduct, '_title' | '_price' | '_id' | 'inBasket'>;
```

Данные о заказе, получаемые из формы модального окна с адресом и формой оплаты

```
export interface IOrderInfoForm {
  payment: 'cash' | 'card' | null;
  address: string;
}
```

Данные о пользователе, получаемые из формы модального окна с email и телефоном

```
export interface IContactForm {
  email: string;
  phone: string;
}
```

Тип для данных формирующих обишки при проверке полей оформения заказа

```
export type FormErrors = Partial<Record<keyof IOrder, string>>;
```


Данные, возвращаемые сервером при успешном оформлении заказа

```
export type TOrderResult = {
  id: string;
  total: number;
}
```


## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP: 
- слой представления, отвечает за отображение данных на странице - View
- слой данных, отвечает за хранение и изменение данных - Model
- презентер, отвечает за связь представления и данных - Presenter

### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов.\

Конструктор:
- `constructor(baseUrl: string, options: RequestInit = {})` - принимает базовый URL и глобальные опции для всех запросов(опционально)

Поля:
- `readonly baseUrl: string` - базовый адрес сервера
- `protected options: RequestInit` - опциональный объект с заголовками запросов

Методы:
- `protected handleResponse(response: Response): Promise<object>` - обрабатывает ответ с сервера
- `get(uri: string)` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post(uri: string, data: object, method: ApiPostMethods = 'POST')` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.\

Поля:
- `_events: Map<EventName, Set<Subscriber>>` - хранит коллекцию событий. Ключи значений реализуют тип `type EventName = string | RegExp`, ф значения - `type Subscriber = Function`

Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on<T extends object>(eventName: EventName, callback: (event: T) => void)` - установить обработчик на событие
- `emit<T extends object>(eventName: string, data?: T)` - инициировать событие с данными
- `trigger<T extends object>(eventName: string, context?: Partial<T>)` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие

Также в классе есть следующие методы:
- `off(eventName: EventName, callback: Subscriber)` - снять обработчик с события
- `onAll(callback: (event: EmitterEvent) => void)` - cлушать все события
- `offAll()` - cбросить все обработчики

### Слой данных - Model

#### Класс Model
Абстрактный класс хранит общие поля и методы для классов слоя данных.\

Конструктор:
- `constructor(data: Partial<T>, protected events: IEvents)` - принимает объект с данными и экземпляр класса `EventEmitter` для инициации событий при изменении данных

Поля:
- копия свойств объекта с данными, переданного в конструктор
- `events: IEvents` - экземпляр класса `EventEmitter`

Методы:
- `emitChanges(event: string, payload?: object)` - метод сообщает всем, что модель поменялась

#### Класс AppState
Класс отвечает за состояние данных приложения. Класс наследуется от абстрактного класса Model.\

Конструктор наследуется от абстрактного класса Model.\

Поля:
- `products: IProduct[]` - массив объектов товаров
- `basket: TBasketProduct[]` - массив объектов данных о товарах, добавленные пользователем в корзину
- `order: IOrder | null` - объект данных с информацией о заказе
- `preview: string | null` - хранит id элемента, выбранного для просмотра в модальном окне
- `formErrors: FormErrors | null` - хранит объект с сообщениями о недостающих данных для оформления заказа

Методы:
- `setProducts(items: IProduct[]): void` - устанавливает полe products после загрузки из api и инициирует событие изменения данных
- `setPreview(item: IPtoduct): void` -  устанавливает значение в поле `preview` и инициирует событие изменения данных
- `getProductById(productId: string): IProduct` - принимает в аргументы ID продукта и возращает товара
- `addProductInBasket(product: IProduct): void` - добавляет один товар в массив и вызывает событие изменения массива.
- `removeProductFromBasket(product: IProduct): void` - удаляет товар из массива. Вызывает событие изменения массива.
- `clearBasket(): void` - очищает корзину
- `clearOrder(): void ` - очищает данные о заказе
- `clearErrors(): void` - очищает сообщения о ошибках форм
- `getTotal(): number` - возращает сумму всех товаров в корзине
- `setOrderBasket()` - устанавливает данные о заказанных товарах и сумме покупок в `order`
- `setOrderField(field: keyof IOrderForm, value: string): void` - устанавливает данные в поле `order`
- `validateOrder(): boolean` - проверяет наличие всех данных поля `order`, необходимых для заказа


### Слой представления - View
Классы представления отвечают за отображения на данных на странице.\

#### Класс View
Абстрактный класс. Хранит базовые поля и методы, необходимые для отрисовки компонентов на странице.

Конструктор:
- `protected constructor(protected readonly container: HTMLElement` - принимает DOM-элемент контейнер

Поля:
- `protected readonly container: HTMLElement` - DOM-элемент контейнер и экземпляр брокера событий для инициации событий

Методы:
- `protected setText(element: HTMLElement, value: unknown): void` - установить текстовое содержимое
- `protected setImage(element: HTMLImageElement, src: string, alt?: string): void` - установить изображение с алтернативным текстом
- `setDisabled(element: HTMLElement, state: boolean): void` - сменить статус блокировки
- `render(data?: Partial<T>): HTMLElement` - возвращает заполненный данными корневой DOM-элемент


#### Класс Modal
Реализует модальное окно. Класс наследуется от абстрактного класса View.\


- `constructor(container: HTMLElement, protected events: IEvents)` - конструктор наследуется от абстрактного класса View, а также принимает экземпляр класса EventEmmiter

Поля:
- `container: HTMLElement` - элемент модального окна
- `protected _content: HTMLElement` - контент, выводящийся в модальном окне
- `protected_closeButton: HTMLButtonElement` - кнопка закрытия модального окна
- `events: IEvents` - брокер событий

Методы:
- `set content(value: HTMLElement)` - присваивает контен модальному окну
- `open(): void` - управляет отображением модального окна - показывает на странице
- `close(): void` - управляет отображением модального окна - скрывает со страницы
- `closeByEsc(evt: KeyboardEvent)` - отвечает за закрытие модального окна нажатием на клавишу `Esc`
- `render(data: IModalData): HTMLElement` - наследует и расширяет метод родительского класса. Возвращает заполненный данными корневой DOM-элемент


#### Класс Basket
Отвечает за отображение корзины с товарами в модальном окне. Класс наследуется от абстрактного класса View.\

- `constructor(container: HTMLElement, protected events: IEvents)` - конструктор наследуется от абстрактного класса View, а также принимает экземпляр класса EventEmmiter 

Поля:
- `container: HTMLElement` - элемент корзины
- `protected _items: HTMLElement[]` - массив товаров, для отображения в корзине
- `protected _list: HTMLElement` - элемент, отвещающий за вывод в корзину списка выюранных товаров
- `protected _total: HTMLElement` - элемент, отображающий общую стоимость выбранных товаров
- `protected _button: HTMLElement` - кнопка оформления корзины

Методы: 
- `set itemsList(items: HTMLElement[])` - заполняет список товаров элементами
- `set total(total: number)` - устанавливает контент в элемент `_total`


#### Класс Form
Предназначен для реализаци форм для вывода в модальном окне. Класс наследуется от абстрактного класса View.\

- `constructor(container: HTMLElement, protected events: IEvents)` - конструктор наследуется от абстрактного класса View, а также принимает экземпляр класса EventEmmiter

Поля:
- `container: HTMLFormElement` - элемент формы
- `protected _submit: HTMLButtonElement` - кнопка подтверждения формы
- `protected _errors: HTMLElement` - элемент для отображения ошибок формы.


Методы:
- `onInputChange(field: keyof T, value: string)` - инициирует событие изменения инпутов
- `set valid(value: boolean)` - меняет блокировку кнопки подтверждения
- `set error(data: (value: string): void` - выводит текст ошибки
- `resetForm(): void `- очищает поля ввода формы
- `render(state: Partial<T> & IFormState)` - наследует и расширяет родительский метод отрисовки элемента


#### Класс OrderInfoForm
Необходим для реализации контента модального окна с данными о оплате и адресе доставки заказа. Является дочерним от класса Form.\

Конструктор наследуется от абстрактного класса родительского класса Form.

Поля класса:
- `container: HTMLFormElement` - элемент формы
- `protected _submit: HTMLButtonElement` - кнопка подтверждения формы
- `protected _errors: HTMLElement` - элемент для отображения ошибок формы.
- `protected _paymentButtons: HTMLButtonElement[];` -  массив элементов кнопок выбора оплаты 


Методы:
- `set address(value: string)` - устанавливает значение в поле адреса
- `set payment(name: string)` - переключает выбранную пользователем кнопку выбора способа оплаты
- `resetForm(): void` - наследует родительский клас - очищает поля формы и убирает выделение с кнопки

#### Класс ContactsForm
Необходим для реализации контента модального окна с данными о контактах пользователя. Является дочерним от класса Form.\

Конструктор наследуется от абстрактного класса родительского класса Form.

Методы: 
- `set phone(value: string)` - устанавливает данные в инпут `phone`
- `set email(value: string)` - устанавливает данные в инпут `email`


#### Класс Success
Отвечает за вывод информации о успешном оформлении заказа в модальном окне. 
Класс наследуется от абстрактного класса View.\

- `constructor(container: HTMLElement, actions: ISuccessActions)` - rонструктор наследуется от абстрактного класса View, а также принимает вторым аргументом объект с обработчиком клика кнопки закрытия окна подтверждения успешного заказа.\ 

Поля:
- `container: HTMLElement` - DOM-элемент
- `protected _button: HTMLButtonElement` - кнопка завершения
- `protected _total: HTMLElement` - сообщение о списании суммы

Методы:

- `set total(text:string)` - устанавливает тект сообщения о списании стоимости товаров


#### Класс Сard
Отвечает за отображение информации о товаре карточках на главной странице, в модальном окне с подробной информацией о товаре и пункте списка в корзине. Класс наследуется от абстрактного класса View.\

- `constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions)` - конструктор наследуется от абстрактного класса View, а также принимает первым аргументом имя блолка и третьим, необязательным, - объект с обработчиком клика по карточке товара\ 

Поля:
- `container: HTMLElement` - элемент карточки товара
- `events: IEvents` - брокер событий
- `protected _id: string` - id товара
- `protected _title: HTMLElement` - заголовок 
- `protected _category: HTMLElement` - описание категории
- `protected _image: HTMLImageElement` - изображение
- `protected _price: HTMLSpanElement` - цена

Методы:
- `set id(value: string)` - устанавливает значение `_id`
- `get id(): string` - получает значение `_id`
- `set title(value: string)` - устанавливает контент в `_title`
- `get title(): string` - получает контент из`_title`
- `set price(value: string)` - устанавливает контент в `_price`
- `get price(): string` - получает контент из`_price`
- `set category(value: string)` - устанавливает контент в `_category`
- `set image(value: string)` - устанавливает значение `_image`

#### Класс CardPreview
Является дочерним от класса Card. Отвечает за отображение карточки товара в модальном окне.

- `constructor(container: HTMLElement, actions?: ICardActions)` - конструктор наследуется от родительского класса и принимает в аргументы опциональный аргумент - действие при клике на кнопку покупки товара.\ 

Поля:
- `container: HTMLElement` - элемент карточки товара
- `events: IEvents` - брокер событий
- `protected _id: string` - id товара
- `protected _title: HTMLElement` - заголовок 
- `protected _category: HTMLElement` - описание категории
- `protected _image: HTMLImageElement` - изображение
- `protected _price: HTMLSpanElement` - цена
- `protected _description: HTMLElement` - описание
- `protected _button: HTMLButtonElement` - кнопка добавления в корзину

Методы:
- `cheсkProduct(id: string): string` - проверяет цену товара и наличие его в корзине. В зависимости от этого - возращает строку, которая установится в контент кнопки
- `setButtonContent(content: string): void` - устанавливает контент для кнопки модального окна
- `set description(value: string | string[])` - устанавливает контент в `_description`
- `set inBasket(value: boolean)` - устанавливает значение поля кнопки
- `set price(value: number)` - устанавливает значение цены блокирует кнопку, если товар бесценнен
- `disabledButton()` - блокирует кнопку покупки бесценного товара


#### Класс CardBasket 
Является дочерним от класса Card. Отвечает за отображение товара в списке товаров в корзине.

- `constructor(container: HTMLElement, actions?: ICardActions)` - конструктор наследуется от родительского класса и принимает в аргументы опциональный аргумент - действие при клике на кнопку удаления товара из корзины.\ 

В поля класса добавляется кнопка удаления товара из корзины и номер товара в корзине:
- `_button: HTMLButtonElement` - кнопка удаление из корзину
- `index: HTMLElement`- номер товара в корзине

Методы:
- `setIndex` - устанавливает номер товара в корзине

#### Класс Page 
Отвечает за главную страницу сайтаю Наследуется от абстрактного класса View./

-`constructor(container: HTMLElement, events: IEvents)` - конструктор наследуется от абстрактного класса View, а также принимает экземпляр класса EventEmmiter

Поля:
- `protected _counter: HTMLElement` - счетчик товаров в корзине
- `protected _gallery: HTMLElement` - список товаров для покупки
- `protected _wrapper: HTMLElement` - контейнер-обертка страницы
- `protected _basket: HTMLElement` - кнопка перехода в корзину

Методы:
- `set counter(value: number)` - устанавливает контен счетчика
- `set gallery(items: HTMLElement[])` - устанавливает контен галереи
- `set locked(value: boolean)` -  отвечает за блокировку прокрутки страницы при открытии модального окна


### Слой комуникации

#### Класс AppApi 
Наследуется от базового класса Api.\

- `constructor(cdn: string, baseUrl: string, options?: RequestInit)` - конструктор наследуется от базового класса Api, а также принимает адрес для получения изображения товаров\

Поля наследуется от базового класса Api, а также включа.т поле:
- `readonly cdn: string` - адрес для получения изображения товаров

Методы:
- `getProductsList(): Promise<IProduct[]>` - получить массив со всеми товарами с сервера
- `getProduct(id: string): Promise<IProduct>` - получить информацию о товаре по id
- `postOrder(order: IOrder): Promise<TOrderResult>` - отправить данные о заказе на сервер для оформления

## Взаимодействие слоев
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

*Список всех событий, которые могут генерироваться в системе:*\

*События изменения данных (генерируются классами моделями данных)*
- `products:changed` - изменение каталога товаров
- `basket:changed` - изменения списка товаров в корзине
- `preview:changed` - изменеие элемента, выбранного для превью
- `order:ready` - заполнены все поля для оформления заказа
- `formErrors:change` - изменился объект, хранящий данные о ошибках

*События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)*

- `card:select` - выбор карточки для отображения в модальном окне
- `card:open` - открытие модального окна просмотра информации о товаре
- `card:add` - добавление товара в корзину
- `card:remove` - удаление товара из корзины
- `basket:open` - открытие модального окна с корзиной   
- `basket:submit` - закрытие модального окна с корзиной прии нажатии кнопки "Оформить"
- `orderInfo:open` - открытие модального окна c информацией  о заказе
- `/^order\..*:change/` - изменение данных в форме информации о заказе
- `/^contacts\..*:change/` -  изменение данных в форме контактов пользователя
- `order:submit` - закрытие модального окна c информацией  о пользователе при нажатии на кнопку "Далее"
открытие модального окна c информацией  о заказе
- `contacts:submit` - закрытие модального окна c информацией о пользователе при нажатии на кнопку "Далее"
- `order:success` - успешное офрмление заказа
- `modal:open` - открытие модального окна
- `modal:close` - закрытие модального окна, нажатием на крестик, 'Ecs' или кликом на оверлей


I


