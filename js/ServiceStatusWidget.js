import { UIComponent } from './UIComponent.js';

export class ServiceStatusWidget extends UIComponent {
  constructor(config) {
    super(config);
    this.serviceName = 'Telegram';
    this.state = {
      points: this.generateSeries(this.serviceName),
    };
  }

  createContent() {
    const root = document.createElement('div');
    root.className = 'stack';

    const form = document.createElement('form');
    form.className = 'inline-form';

    const input = document.createElement('input');
    input.className = 'input';
    input.type = 'text';
    input.placeholder = 'Название сервиса';
    input.value = this.serviceName;

    const button = document.createElement('button');
    button.className = 'button';
    button.type = 'submit';
    button.textContent = 'Обновить';

    form.append(input, button);

    const note = document.createElement('div');
    note.className = 'widget-note';

    const card = document.createElement('div');
    card.className = 'api-card';

    const renderState = () => {
      const points = this.state.points;
      const peak = Math.max(...points.map((point) => point.errors), 1);
      const avgLatency = Math.round(
        points.reduce((sum, point) => sum + point.latency, 0) / points.length,
      );
      const errorSum = points.reduce((sum, point) => sum + point.errors, 0);
      const availability = Math.max(95, 100 - errorSum / 8).toFixed(1);

      note.textContent = 'Демо-виджет аналитики: визуализирует нагрузку и ошибки сервиса по временным точкам.';
      card.innerHTML = `
        <div class="service-head">
          <div>
            <h4>${this.serviceName}</h4>
            <p class="muted">Последние 12 часов мониторинга</p>
          </div>
          <span class="service-badge">Стабильность ${availability}%</span>
        </div>
        <div class="stats-grid stats-grid--activity">
          <div class="mini-stat"><span>Средняя задержка</span><strong>${avgLatency} ms</strong></div>
          <div class="mini-stat"><span>Всего ошибок</span><strong>${errorSum}</strong></div>
          <div class="mini-stat"><span>Пиковый час</span><strong>${peak}</strong></div>
        </div>
        <div class="chart-block">
          <div class="chart-block__head">
            <strong>Ошибки по часам</strong>
            <span>чем выше колонка, тем хуже</span>
          </div>
          <div class="bar-chart">
            ${points
              .map(
                (point) => `
                  <div class="bar-chart__item" title="${point.label}: ${point.errors} ошибок, ${point.latency} ms">
                    <div class="bar-chart__bar-wrap">
                      <div class="bar-chart__bar" style="height: ${Math.max(
                        8,
                        Math.round((point.errors / peak) * 100),
                      )}%"></div>
                    </div>
                    <span>${point.shortLabel}</span>
                  </div>
                `,
              )
              .join('')}
          </div>
        </div>
      `;
    };

    const onSubmit = (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) {
        input.focus();
        return;
      }

      this.serviceName = value;
      this.state.points = this.generateSeries(value);
      renderState();
    };

    this.addManagedListener(form, 'submit', onSubmit);

    root.append(form, note, card);
    renderState();

    return root;
  }

  generateSeries(seedText) {
    const now = new Date();
    const normalizedSeed = Array.from(seedText.toLowerCase()).reduce(
      (sum, char) => sum + char.charCodeAt(0),
      0,
    );

    return Array.from({ length: 12 }, (_, index) => {
      const hourDate = new Date(now);
      hourDate.setHours(now.getHours() - (11 - index), 0, 0, 0);
      const noise = (normalizedSeed + index * 17) % 9;
      const wave = Math.abs(Math.sin((index + normalizedSeed) / 2));
      const errors = Math.max(0, Math.round(wave * 8 + noise / 2 - 1));
      const latency = 120 + errors * 18 + ((normalizedSeed + index * 13) % 40);

      return {
        label: hourDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        shortLabel: hourDate.toLocaleTimeString('ru-RU', { hour: '2-digit' }),
        errors,
        latency,
      };
    });
  }
}
