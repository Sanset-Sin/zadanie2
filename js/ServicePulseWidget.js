import { UIComponent } from './UIComponent.js';

export class ServicePulseWidget extends UIComponent {
  constructor(config) {
    super(config);
    this.services = {
      telegram: {
        label: 'Telegram',
        points: [99, 98, 97, 96, 98, 95, 93, 94, 96, 97, 98, 99],
        incidents: 4,
      },
      github: {
        label: 'GitHub',
        points: [100, 100, 99, 100, 100, 99, 98, 99, 100, 100, 99, 100],
        incidents: 1,
      },
      openmeteo: {
        label: 'Open-Meteo',
        points: [100, 99, 99, 98, 98, 99, 100, 99, 98, 99, 99, 100],
        incidents: 2,
      },
    };
    this.selectedService = 'telegram';
  }

  createContent() {
    const root = document.createElement('div');
    root.className = 'stack';

    const form = document.createElement('form');
    form.className = 'inline-form';

    const select = document.createElement('select');
    select.className = 'input';

    Object.entries(this.services).forEach(([key, service]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = service.label;
      select.append(option);
    });

    select.value = this.selectedService;

    const status = document.createElement('div');
    status.className = 'widget-note';

    const card = document.createElement('div');
    card.className = 'api-card';

    const renderBars = (points) => {
      const labels = ['01', '03', '05', '07', '09', '11', '13', '15', '17', '19', '21', '23'];

      return points
        .map(
          (value, index) => `
            <div class="bar-chart__item" title="${labels[index]}:00 · ${value}%">
              <div class="bar-chart__bar-wrap">
                <div class="bar-chart__bar" style="height:${Math.max(value, 4)}%"></div>
              </div>
              <span>${labels[index]}</span>
            </div>
          `,
        )
        .join('');
    };

    const renderState = () => {
      const service = this.services[this.selectedService];
      const average = Math.round(
        service.points.reduce((sum, point) => sum + point, 0) / service.points.length,
      );
      const minimum = Math.min(...service.points);

      status.textContent = 'Демо-виджет мониторинга стабильности сервиса по часам';
      card.innerHTML = `
        <div class="stats-grid stats-grid--secondary">
          <div class="mini-stat"><span>Средняя доступность</span><strong>${average}%</strong></div>
          <div class="mini-stat"><span>Минимум</span><strong>${minimum}%</strong></div>
          <div class="mini-stat"><span>Инциденты</span><strong>${service.incidents}</strong></div>
        </div>
        <div class="tip-card">
          <span class="tip-card__label">Что показывает виджет</span>
          <strong>${service.label}: условная динамика стабильности сервиса за сутки.</strong>
        </div>
        <div class="bar-chart">
          ${renderBars(service.points)}
        </div>
      `;
    };

    const onChange = (event) => {
      this.selectedService = event.target.value;
      renderState();
    };

    this.addManagedListener(select, 'change', onChange);

    form.append(select);
    root.append(form, status, card);
    renderState();

    return root;
  }
}
