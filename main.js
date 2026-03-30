import { Dashboard } from './js/Dashboard.js';

const dashboardContainer = document.querySelector('#dashboard');
const emptyStateTemplate = document.querySelector('#empty-state-template');
const toolbarButtons = document.querySelectorAll('[data-widget]');

const dashboard = new Dashboard(dashboardContainer, emptyStateTemplate);
dashboard.render();

const handleAddWidget = (event) => {
  const { widget } = event.currentTarget.dataset;
  dashboard.addWidget(widget);
};

toolbarButtons.forEach((button) => {
  button.addEventListener('click', handleAddWidget);
});

// Стартовая конфигурация, чтобы дашборд не был пустым сразу после загрузки.
dashboard.addWidget('todo');
dashboard.addWidget('weather');
dashboard.addWidget('github');
dashboard.addWidget('quote');
