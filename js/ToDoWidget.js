import { UIComponent } from './UIComponent.js';

export class ToDoWidget extends UIComponent {
  constructor(config) {
    super(config);
    this.tasks = [];
  }

  createContent() {
    const root = document.createElement('div');
    root.className = 'todo-widget';

    const form = document.createElement('form');
    form.className = 'inline-form';

    const input = document.createElement('input');
    input.className = 'input';
    input.type = 'text';
    input.placeholder = 'Новая задача';
    input.maxLength = 120;

    const submitButton = document.createElement('button');
    submitButton.className = 'button';
    submitButton.type = 'submit';
    submitButton.textContent = 'Добавить';

    form.append(input, submitButton);

    const stats = document.createElement('div');
    stats.className = 'widget-note';

    const list = document.createElement('ul');
    list.className = 'todo-list';

    const updateStats = () => {
      const done = this.tasks.filter((task) => task.completed).length;
      stats.textContent = `Всего: ${this.tasks.length} · Выполнено: ${done}`;
    };

    const renderTasks = () => {
      list.innerHTML = '';

      if (this.tasks.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'placeholder-card';
        empty.textContent = 'Список пока пуст.';
        list.append(empty);
        return;
      }

      this.tasks.forEach((task) => {
        const item = document.createElement('li');
        item.className = `todo-item ${task.completed ? 'todo-item--done' : ''}`;
        item.dataset.taskId = task.id;

        const left = document.createElement('div');
        left.className = 'todo-item__left';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'todo-toggle';

        const text = document.createElement('span');
        text.textContent = task.text;

        left.append(checkbox, text);

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'ghost-btn ghost-btn--danger todo-remove';
        removeButton.textContent = 'Удалить';

        item.append(left, removeButton);
        list.append(item);
      });
    };

    const onSubmit = (event) => {
      event.preventDefault();
      const value = input.value.trim();

      if (!value) {
        input.focus();
        return;
      }

      this.addTask(value);
      input.value = '';
      renderTasks();
      updateStats();
      input.focus();
    };

    const onListClick = (event) => {
      const removeButton = event.target.closest('.todo-remove');
      if (!removeButton) {
        return;
      }

      const item = removeButton.closest('[data-task-id]');
      if (!item) {
        return;
      }

      this.removeTask(item.dataset.taskId);
      renderTasks();
      updateStats();
    };

    const onListChange = (event) => {
      const toggle = event.target.closest('.todo-toggle');
      if (!toggle) {
        return;
      }

      const item = toggle.closest('[data-task-id]');
      if (!item) {
        return;
      }

      this.toggleTask(item.dataset.taskId);
      renderTasks();
      updateStats();
    };

    this.addManagedListener(form, 'submit', onSubmit);
    this.addManagedListener(list, 'click', onListClick);
    this.addManagedListener(list, 'change', onListChange);

    root.append(form, stats, list);

    updateStats();
    renderTasks();

    return root;
  }

  addTask(text) {
    this.tasks.unshift({
      id: crypto.randomUUID(),
      text,
      completed: false,
    });
  }

  removeTask(taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
  }

  toggleTask(taskId) {
    this.tasks = this.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );
  }
}
