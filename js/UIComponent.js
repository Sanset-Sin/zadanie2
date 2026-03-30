export class UIComponent {
  constructor({ title, id, onRemove }) {
    if (new.target === UIComponent) {
      throw new Error('UIComponent — абстрактный класс и не должен создаваться напрямую.');
    }

    this.title = title;
    this.id = id;
    this.onRemove = onRemove;
    this.element = null;
    this.contentElement = null;
    this.isMinimized = false;
    this._listeners = [];
  }

  render() {
    if (this.element) {
      return this.element;
    }

    const wrapper = document.createElement('article');
    wrapper.className = 'widget';
    wrapper.dataset.widgetId = this.id;

    const header = document.createElement('div');
    header.className = 'widget__header';

    const title = document.createElement('h3');
    title.className = 'widget__title';
    title.textContent = this.title;

    const actions = document.createElement('div');
    actions.className = 'widget__actions';

    const minimizeButton = document.createElement('button');
    minimizeButton.type = 'button';
    minimizeButton.className = 'icon-btn';
    minimizeButton.textContent = '—';
    minimizeButton.setAttribute('aria-label', 'Свернуть виджет');

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'icon-btn icon-btn--danger';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', 'Удалить виджет');

    actions.append(minimizeButton, closeButton);
    header.append(title, actions);

    const content = document.createElement('div');
    content.className = 'widget__content';

    wrapper.append(header, content);

    this.element = wrapper;
    this.contentElement = content;

    this.addManagedListener(minimizeButton, 'click', this.minimize);
    this.addManagedListener(closeButton, 'click', this.close);

    this.mountContent();

    return wrapper;
  }

  mountContent() {
    const content = this.createContent();
    if (content) {
      this.contentElement.append(content);
    }
  }

  createContent() {
    return document.createElement('div');
  }

  addManagedListener(element, eventName, handler) {
    element.addEventListener(eventName, handler);
    this._listeners.push({ element, eventName, handler });
  }

  minimize = () => {
    this.isMinimized = !this.isMinimized;
    this.element.classList.toggle('widget--minimized', this.isMinimized);
    this.contentElement.hidden = this.isMinimized;
  };

  close = () => {
    if (typeof this.onRemove === 'function') {
      this.onRemove(this.id);
    }
  };

  destroy() {
    this._listeners.forEach(({ element, eventName, handler }) => {
      element.removeEventListener(eventName, handler);
    });
    this._listeners = [];

    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.element = null;
    this.contentElement = null;
  }
}
