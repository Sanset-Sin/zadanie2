import { UIComponent } from './UIComponent.js';

export class GitHubWidget extends UIComponent {
  constructor(config) {
    super(config);
    this.username = 'octocat';
    this.state = {
      loading: false,
      error: '',
      data: null,
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
    input.placeholder = 'GitHub username';
    input.value = this.username;

    const button = document.createElement('button');
    button.className = 'button';
    button.type = 'submit';
    button.textContent = 'Загрузить';

    form.append(input, button);

    const status = document.createElement('div');
    status.className = 'widget-note';

    const card = document.createElement('div');
    card.className = 'api-card';

    const renderState = () => {
      if (this.state.loading) {
        status.textContent = 'Загружаю профиль...';
        card.innerHTML = '<p class="placeholder-card">Запрашиваю GitHub API.</p>';
        return;
      }

      if (this.state.error) {
        status.textContent = 'Ошибка загрузки';
        card.innerHTML = `<p class="error-text">${this.state.error}</p>`;
        return;
      }

      if (!this.state.data) {
        status.textContent = 'Нет данных';
        card.innerHTML = '<p class="placeholder-card">Введи username и загрузи профиль.</p>';
        return;
      }

      const { avatar_url, name, login, bio, public_repos, followers, following, html_url } =
        this.state.data;

      status.textContent = 'Источник: GitHub REST API';
      card.innerHTML = `
        <div class="profile-card">
          <img class="avatar" src="${avatar_url}" alt="Аватар пользователя ${login}" />
          <div class="profile-card__body">
            <h4>${name || login}</h4>
            <p class="muted">@${login}</p>
            <p>${bio || 'Биография не указана.'}</p>
            <div class="stats-grid">
              <div class="mini-stat"><span>Репозитории</span><strong>${public_repos}</strong></div>
              <div class="mini-stat"><span>Подписчики</span><strong>${followers}</strong></div>
              <div class="mini-stat"><span>Подписки</span><strong>${following}</strong></div>
            </div>
            <a class="text-link" href="${html_url}" target="_blank" rel="noreferrer">Открыть профиль</a>
          </div>
        </div>
      `;
    };

    const loadProfile = async (username) => {
      this.state.loading = true;
      this.state.error = '';
      renderState();

      try {
        const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);

        if (!response.ok) {
          throw new Error('Пользователь не найден или GitHub временно недоступен.');
        }

        const data = await response.json();

        this.username = username;
        this.state = {
          loading: false,
          error: '',
          data,
        };
      } catch (error) {
        this.state = {
          loading: false,
          error: error.message || 'Не удалось загрузить профиль GitHub.',
          data: null,
        };
      }

      renderState();
    };

    const onSubmit = (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) {
        input.focus();
        return;
      }
      loadProfile(value);
    };

    this.addManagedListener(form, 'submit', onSubmit);

    root.append(form, status, card);
    renderState();
    loadProfile(this.username);

    return root;
  }
}
