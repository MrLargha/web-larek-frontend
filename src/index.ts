import './scss/styles.scss';

import { AppApi } from './components/AppApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/Events';
import { AppState } from './components/AppState';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';
import { Card, CardPreview, CardBasket } from './components/Card';
import { Basket } from './components/common/Basket';
import { ensureElement, cloneTemplate } from './utils/utils';
import { IProduct, IOrderInfoForm, IContactForm, TFormErrors, IOrder } from './types';
import { OrderInfoForm } from './components/OrderInfoForm';
import { ContactsForm } from './components/ContactsForm';
import { Success } from './components/Success';

const events = new EventEmitter();
const api = new AppApi(CDN_URL, API_URL);

// Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderInfoTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const orderInfo = new OrderInfoForm(cloneTemplate(orderInfoTemplate), events);
const contacts = new ContactsForm(cloneTemplate(contactsTemplate), events);

//Обработка событий

// Изменились элементы галлереи
events.on('products: changed', () => {
	page.gallery = appData.products.map((item) => {
		const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
			id: item.id,
		});
	});
});

// Выбрана карточка для промотра
events.on('card:select', (item: IProduct) => {
	appData.setPreview(item);
});

//Показываем карточку, ывбранную для просмотра
events.on('preview:changed', (item: IProduct) => {
	const card = new CardPreview(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			if (!item.inBasket) {
				events.emit('card:add', item);
			} else {
				events.emit('card:remove', item);
			}
		},
	});

	events.on('card:add', () => {
		card.inBasket = true;
	});

	events.on('card:remove', () => {
		card.inBasket = false;
	});

	modal.render({
		content: card.render({
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
			id: item.id,
			description: item.description,
			inBasket: item.inBasket,
		}),
	});
});

//Добавляем товар в корзину
events.on('card:add', (item: IProduct) => {
	appData.addProductInBasket(item);
});

// Удаляем товар из корзины
events.on('card:remove', (item: IProduct) => {
	appData.removeProductFromBasket(item.id);
});

//Показываем измененную корзину
events.on('basket:changed', () => {
	page.counter = appData.basket.length;
	basket.items = appData.basket.map((item, index) => {
		const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('card:remove', item);
			},
		});
		return card.render({
			index: index + 1,
			title: item.title,
			price: item.price,
		});
	});

	basket.render({
		total: appData.getTotal(),
	});
});

//Открыть корзину
events.on('basket:open', () => {
	basket.items = appData.basket.map((item, index) => {
		const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('card:remove', item);
			},
		});
		return card.render({
			index: index + 1,
			title: item.title,
			price: item.price,
		});
	});

	modal.render({
		content: basket.render({
			total: appData.getTotal(),
		}),
	});
});

// Подтверждаем корзину и добавляем товары в заказ
events.on('basket:submit', () => {
	appData.setOrderBasket();
	events.emit('orderInfo:open');
});

// Открыть форму с информацией о заказе
events.on('orderInfo:open', () => {
	const payment = appData.order.payment ? appData.order.payment : null;
	const address = appData.order.address ? appData.order.address : '';

	const valid = appData.formErrors
		? !appData.formErrors.payment && !appData.formErrors.address
		: false;

	modal.render({
		content: orderInfo.render({
			payment,
			address,
			valid,
			errors: [],
		}),
	});
});

// Изменилось состояние формы информации о заказе
events.on(/^order\..*:change/, (data: { field: keyof IOrderInfoForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Изменилось состояние формы информации о контактах пользователя
events.on(/^contacts\..*:change/,(data: { field: keyof IContactForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Изменилось состояние валидации форм информации о заказе и контактах пользователя
events.on('formErrors:change', (errors: Partial<TFormErrors>) => {
	const { payment, address, email, phone } = errors;
	orderInfo.valid = !payment && !address;
	contacts.valid = !email && !phone;
	orderInfo.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
	contacts.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
	console.log(appData.formErrors);
});

events.on('order:submit', () => {
	const email = appData.order.email ? appData.order.email : '';
	const phone = appData.order.phone ? appData.order.phone : '';

	const valid = appData.formErrors
    ? !appData.formErrors.email && !appData.formErrors.phone 
    : false;

	modal.render({
		content: contacts.render({
			email,
			phone,
			valid,
			errors: [],
		}),
	});
});

//Отправляем заказ на сервера после подтверждения контактов
events.on('contacts:submit', () => {
	api
		.postOrder(appData.order as IOrder)
		.then((result) => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
				},
			});

			events.emit('order:success');

			modal.render({
				content: success.render({
					total: result.total,
				}),
			});
		})
		.catch((err) => {
			console.error(err);
		});
});

// Очищаем корзину, данные о заказе и все поля после успешного оформления заказа
events.on('order:success', () => {
	appData.clearBasket();
	appData.clearOrder();
  appData.clearErrors();
	orderInfo.resetForm();
	contacts.resetForm();
});

// Блокировка прокрутки страницы при открытии модального окна
events.on('modal:open', () => {
	page.locked = true;
});

// Разблокировка прокрутки
events.on('modal:close', () => {
	page.locked = false;
});

//Загружаем список товаров с сервера
api
	.getProductsList()
	.then((data) => {
		appData.setProducts(data);
	})
	.catch((err) => {
		console.error(err);
	});
