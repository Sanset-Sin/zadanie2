import { ToDoWidget } from './ToDoWidget.js';
import { WeatherWidget } from './WeatherWidget.js';
import { GitHubWidget } from './GitHubWidget.js';
import { ServiceStatusWidget } from './ServiceStatusWidget.js';

export class Dashboard {
  constructor(container, emptyStateTemplate) {
    this.container = container;
    this.emptyStateTemplate = emptyStateTemplate;
    this.widgets = [];
    this.widgetCounters = {
      todo: 0,
      weather: 0,
      github: 0,
      service: 0,
    };
  }

  addWidget(widgetType) {
    const widget = this.createWidget(widgetType);
    if (!widget) {
      return null;
    }

    this.widgets.push(widget);
    this.render();
    return widget;
  }

  removeWidget(widgetId) {
    const widgetIndex = this.widgets.findIndex((widget) => widget.id === widgetId);
    if (widgetIndex === -1) {
      return;
    }

    const [widget] = this.widgets.splice(widgetIndex, 1);
    widget.destroy();
    this.render();
  }

  createWidget(widgetType) {
    const normalizedType = widgetType.toLowerCase();
    const number = (this.widgetCounters[normalizedType] ?? 0) + 1;
    this.widgetCounters[normalizedType] = number;

    const baseConfig = {
      id: `${normalizedType}-${number}`,
      onRemove: (widgetId) => this.removeWidget(widgetId),
    };

    switch (normalizedType) {
      case 'todo':
        return new ToDoWidget({ ...baseConfig, title: `ToDo Widget #${number}` });
      case 'weather':
        return new WeatherWidget({ ...baseConfig, title: `Weather Widget #${number}` });
      case 'github':
        return new GitHubWidget({ ...baseConfig, title: `GitHub Widget #${number}` });
      case 'service':
        return new ServiceStatusWidget({ ...baseConfig, title: `Service Monitor #${number}` });
      default:
        console.warn(`Неизвестный тип виджета: ${widgetType}`);
        return null;
    }
  }

  render() {
    this.container.innerHTML = '';

    if (this.widgets.length === 0) {
      const emptyState = this.emptyStateTemplate.content.firstElementChild.cloneNode(true);
      this.container.append(emptyState);
      return;
    }

    this.widgets.forEach((widget) => {
      this.container.append(widget.render());
    });
  }
}
