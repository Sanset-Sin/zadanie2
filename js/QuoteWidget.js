import { UIComponent } from './UIComponent.js';

export class QuoteWidget extends UIComponent {
  constructor(config) {
    super(config);
    this.quotes = [
      'Сначала сделай удобно, потом красиво, потом уже героически оптимизируй.',
      'Маленькие шаги каждый день бьют идеальный план, который так и не стартовал.',
      'Чистая архитектура не шумит, она просто работает.',
      'Хороший интерфейс не объясняет себя — он не заставляет страдать.',
      'Код без структуры мстит не сразу, но очень охотно.',
      'Дисциплина — это когда результат важнее минутного настроения.',
    ];
    this.currentQuote = this.getRandomQuote();
  }

  createContent() {
    const root = document.createElement('div');
    root.className = 'stack';

    const quote = document.createElement('blockquote');
    quote.className = 'quote-box';
    quote.textContent = this.currentQuote;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button';
    button.textContent = 'Обновить цитату';

    const updateQuote = () => {
      this.currentQuote = this.getRandomQuote(this.currentQuote);
      quote.textContent = this.currentQuote;
    };

    this.addManagedListener(button, 'click', updateQuote);

    root.append(quote, button);
    return root;
  }

  getRandomQuote(excludeQuote = '') {
    const availableQuotes = this.quotes.filter((quote) => quote !== excludeQuote);
    return availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
  }
}
