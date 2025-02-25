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
export interface IProduct {
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
export type TBasketProduct = Pick<IProduct, '_title' | '_price' | '_id'>;
```

Данные о заказе, получаемые из формы модального окна с адресом и формой оплаты

```
export type TOrderInfo = Pick<IOrder, 'payment' | 'address'>;
```

Данные о пользователе, получаемые из формы модального окна с email и телефоном

```
export type TUserInfo = Pick<IOrder, 'email' | 'phone'>;
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
- `formErrors: FormErrors` - хранит объект с сообщениями о недостающих данных для оформления заказа

Методы:
- `setProducts(items: IProduct[]): void` - устанавливает полe products после загрузки из api и инициирует событие изменения данных
- `setPreview(item: LotItem): void` -  устанавливает значение в поле `preview` и инициирует событие изменения данных
- `getPreviewProduct(productId: string): IProduct` - возвращает объект с данными по переданному в аргументы id
- `addProductInBasket(product: IProduct): void` - добавляет один товар в массив и вызывает событие изменения массива.
- `removeProductFromBasket(product: IProduct): void` - удаляет товар из массива. Вызывает событие изменения массива.
- `clearBasket(): void` - очищает корзину
- `getTotal(): number` - возращает сумму всех товаров в корзине
- `setOrderField(field: keyof IOrderForm, value: string): void` - устанавливает данные в поле `order`
- `validateOrder(): boolean` - проверяет наличие всех данных поля `order`, необходимых для заказа


### Слой представления - View
Классы представления отвечают за отображения на данных на странице.\

#### Класс View
Абстрактный класс. Хранит базовые поля и методы, необходимые для отрисовки компонентов на странице.

Конструктор:
- `protected constructor(protected readonly container: HTMLElement, protected events: IEvents)` - принимает DOM-элемент контейнер

Поля:
- `protected readonly container: HTMLElement` - DOM-элемент контейнер и экземпляр брокера событий для инициации событий

Методы:
- `protected setText(element: HTMLElement, value: unknown): void` - установить текстовое содержимое
- `setDisabled(element: HTMLElement, state: boolean): void` - сменить статус блокировки
- `protected setImage(element: HTMLImageElement, src: string, alt?: string): void` - установить изображение с алтернативным текстом
- `render(data?: Partial<T>): HTMLElement` - возвращает заполненный данными корневой DOM-элемент


#### Класс ModalView
Реализует модальное окно. Класс наследуется от абстрактного класса View.\

Конструктор наследуется от абстрактного класса View.\ 

Поля:
- `container: HTMLElement` - элемент модального окна
- `protected _content: HTMLElement` - контент, выводящийся в модальном окне
- `protected_closeButton: HTMLButtonElement` - кнопка закрытия модального окна
- `events: IEvents` - брокер событий

Методы:
- `set content(value: HTMLElement)` - присваивает контен модальному окну
- `open(): void` - управляет отображением модального окна - показывает на странице
- `close(): void` - управляет отображением модального окна - скрывает со страницы
- `render(data: IModalData): HTMLElement` - наследует и расширяет метод родительского класса. Возвращает заполненный данными корневой DOM-элемент


#### Класс BasketView 
Отвечает за отображение корзины с товарами в модальном окне.  Класс наследуется от абстрактного класса View.\

Конструктор наследуется от абстрактного класса View.\ 

Поля:
- `container: HTMLElement` - элемент корзины
- `protected _items: HTMLElement[]` - массив товаров, для отображения в корзине
- `protected _list: HTMLElement` - элемент, отвещающий за вывод в корзину списка выюранных товаров
- `protected _total: HTMLElement` - элемент, отображающий общую стоимость выбранных товаров
- `protected _button: HTMLElement` - кнопка оформления корзины

Методы: 
- `set itemsList(items: HTMLElement[])` - заполняет список товаров элементами
- `set total(total: number)` - устанавливает контент в элемент `_total`
- `isEmpty(): boolean` - проверяют наличие товаров в корзине


#### Класс Form
Предназначен для реализаци форм для вывода в модальном окне. Класс наследуется от абстрактного класса View.\

Конструктор наследуется от абстрактного класса View.\ 

Поля:
- `container: HTMLFormElement` - элемент формы
- `protected _submit: HTMLButtonElement` - кнопка подтверждения формы
- `protected _errors: HTMLElement` - элемент для отображения ошибок формы.


Методы:
- `set valid(value: boolean)` - меняет блокировку кнопки подтверждения
- `getInputValues(): Record<string, string`> - возвращает объект с данными из полей формы 
- `set error(data: (value: string): void` - выводит текст ошибки
- `resetForm(): void `- очищает поля ввода формы
- `onInputChange(field: keyof T, value: string)` - инициирует событие изменения инпутов

#### Класс FormOrder
Необходим для реализации контента модального окна с данными о оплате и адресе доставки заказа. Является дочерним от класса Form.\

Конструктор наследуется от абстрактного класса View.\ 

Поля класса:
- `container: HTMLFormElement` - элемент формы
- `protected _submit: HTMLButtonElement` - кнопка подтверждения формы
- `protected _errors: HTMLElement` - элемент для отображения ошибок формы.
- `protected buttonOnline: HTMLButtonElement;` - кнопка выбора оплаты "онлайн"
- `protected buttonСash: HTMLButtonElement` - кнопка выбора оплаты "при получении"
- `protected inputAddress: HTMLInputElement` - поле для ввода адреса

Методы:
- `setSelected(name: string): void` - изменяте выбранную пользователем кнопку
- `toggleClass(element: HTMLElement, className: string, force?: boolean): void` - переключает класс
- `resetSelested(name: string): void` - убирает выделение с кнопки

#### Класс Success
Отвечает за вывод информации о успешном оформлении заказа в модальном окне. 
Класс наследуется от абстрактного класса View.\

Конструктор наследуется от абстрактного класса View.\ 

Поля:
- `container: HTMLElement` - DOM-элемент
- `protected _button: HTMLButtonElement` - кнопка завершения
- `protected _totalMessage: HTMLElement` - сообщение о списании суммы

Методы:

- `set totalMessage(text:string)` - устанавливает тект сообщения о списании стоимости товаров


#### Класс Сard
Отвечает за отображение информации о товаре карточках на главной странице, в модальном окне с подробной информацией о товаре и пункте списка в корзине. Класс наследуется от абстрактного класса View.\

Конструктор наследуется от абстрактного класса View.\ 

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

Конструктор наследуется от абстрактного класса View.\ 

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


#### Класс CardBasket 
Является дочерним от класса Card. Отвечает за отображение товара в списке товаров в корзине.

Конструктор наследуется от абстрактного класса View.\ 

В поля класса добавляется кнопка удаления товара из корзины и номер товара в корзине:
- `deleteButton: HTMLButtonElement` - кнопка удаление из корзину
- `index: HTMLElement`- номер товара в корзине

Методы:
- `setIndex` - устанавливает номер товара в корзине


### Слой комуникации

#### Класс AppApi 
Наследуется от базового класса Api.\

Конструктор наследуется от базового класса Api.\

Поля наследуется от базового класса Api.\

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
- `products: changed` - изменеие каталога товаров
- `basket: changed` - изменения списка товаров в корзине

*События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)*
- `card:select` - выбор карточки для отображения в модальном окне
- `card:open` - открытие модального окна просмотра информации о товаре
- `card:add` - добавление товара в корзину
- `card:delete` - удаление товара из корзины
- `basket:open` - открытие модального окна с корзиной 
- `basket:close` - закрытие модального окна с корзиной 
- `basket:submit` - закрытие модального окна с корзиной прии нажатии кнопки "Оформить"
- `orderInfo:open` - открытие модального окна c информацией  о заказе
- `cash:selected` - выбран способ оплаты при получении
- `online:selected` - выбран способ оплаты онлайн
- `orderInfo:input` - изменение данных в форме информации о заказе
- `orderInfo:submit` - закрытие модального окна c информацией  о пользователе при нажатии на кнопку "Далее"
открытие модального окна c информацией  о заказе
- `orderInfo:validation` - событие, сообщающее о необходимости валидации формы модального окна информации о заказе
- `userInfo:input` - изменение данных адреса в форме информации о пользователе
- `userInfo:submit` - закрытие модального окна c информацией о пользователе при нажатии на кнопку "Далее"
- `userInfo:validation` - событие, сообщающее о необходимости валидации формы модального окна информации о пользователе
- `orderSubmit:open` - открытие окна успешного оформление заказа 
- `orderSubmit:submit` - закрытие модального  успешного формление заказа  при нажатии на кнопку "За новыми покупками"
- `modal:close` - закрытие модального окна, нажатием на крестик, 'Ecs' или кликом на оверлей


I


