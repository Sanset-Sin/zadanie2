import { UIComponent } from './UIComponent.js';

export class GitHubWidget extends UIComponent {
  constructor(config) {
    super(config);
    this.username = 'octocat';
    this.state = {
      loading: false,
      error: '',
      profile: null,
      heatmap: [],
      activity: {
        totalDays: 84,
        activeDays: 0,
        last7Days: 0,
        last30Days: 0,
        maxCount: 0,
      },
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

    const renderHeatmap = () => {
      if (!this.state.heatmap.length) {
        return '<p class="placeholder-card">У этого пользователя пока нет публичной активности за выбранный период.</p>';
      }

      const cells = this.state.heatmap
        .map(
          (day) => `
            <div
              class="heatmap-cell heatmap-level-${day.level}"
              title="${day.label}: ${day.count} событий"
              aria-label="${day.label}: ${day.count} событий"
            ></div>`,
        )
        .join('');

      return `
        <div class="heatmap-card">
          <div class="heatmap-card__head">
            <strong>Активность по публичным событиям GitHub</strong>
            <span>последние 12 недель</span>
          </div>
          <div class="heatmap-grid">${cells}</div>
          <div class="heatmap-legend">
            <span>Меньше</span>
            <div class="heatmap-cell heatmap-level-0"></div>
            <div class="heatmap-cell heatmap-level-1"></div>
            <div class="heatmap-cell heatmap-level-2"></div>
            <div class="heatmap-cell heatmap-level-3"></div>
            <div class="heatmap-cell heatmap-level-4"></div>
            <span>Больше</span>
          </div>
        </div>
      `;
    };

    const renderState = () => {
      if (this.state.loading) {
        status.textContent = 'Загружаю профиль и публичную активность...';
        card.innerHTML = '<p class="placeholder-card">Запрашиваю GitHub API.</p>';
        return;
      }

      if (this.state.error) {
        status.textContent = 'Ошибка загрузки';
        card.innerHTML = `<p class="error-text">${this.state.error}</p>`;
        return;
      }

      if (!this.state.profile) {
        status.textContent = 'Нет данных';
        card.innerHTML = '<p class="placeholder-card">Введи username и загрузи профиль.</p>';
        return;
      }

      const {
        avatar_url,
        name,
        login,
        bio,
        public_repos,
        followers,
        following,
        html_url,
      } = this.state.profile;

      const { activeDays, last7Days, last30Days } = this.state.activity;

      status.textContent = 'Источник: GitHub REST API · профиль + публичные события';
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
            <div class="stats-grid stats-grid--activity">
              <div class="mini-stat"><span>Активных дней</span><strong>${activeDays}</strong></div>
              <div class="mini-stat"><span>Событий за 7 дней</span><strong>${last7Days}</strong></div>
              <div class="mini-stat"><span>Событий за 30 дней</span><strong>${last30Days}</strong></div>
            </div>
            ${renderHeatmap()}
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
        const [profileResponse, events] = await Promise.all([
          fetch(`https://api.github.com/users/${encodeURIComponent(username)}`),
          this.loadUserEvents(username),
        ]);

        if (!profileResponse.ok) {
          throw new Error('Пользователь не найден или GitHub временно недоступен.');
        }

        const profile = await profileResponse.json();
        const { heatmap, activity } = this.buildHeatmap(events);

        this.username = username;
        this.state = {
          loading: false,
          error: '',
          profile,
          heatmap,
          activity,
        };
      } catch (error) {
        this.state = {
          loading: false,
          error: error.message || 'Не удалось загрузить профиль GitHub.',
          profile: null,
          heatmap: [],
          activity: {
            totalDays: 84,
            activeDays: 0,
            last7Days: 0,
            last30Days: 0,
            maxCount: 0,
          },
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

  async loadUserEvents(username) {
    const pagesToLoad = [1, 2, 3];
    const requests = pagesToLoad.map((page) =>
      fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`,
      ),
    );

    const responses = await Promise.all(requests);
    const jsonResponses = await Promise.all(
      responses.map(async (response) => {
        if (!response.ok) {
          return [];
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }),
    );

    return jsonResponses.flat();
  }

  buildHeatmap(events) {
    const totalDays = 84;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const countsByDate = new Map();

    events.forEach((event) => {
      const date = new Date(event.created_at);
      date.setHours(0, 0, 0, 0);
      const diffInDays = Math.floor((today - date) / 86400000);

      if (diffInDays >= 0 && diffInDays < totalDays) {
        const key = date.toISOString().slice(0, 10);
        countsByDate.set(key, (countsByDate.get(key) || 0) + 1);
      }
    });

    const orderedDays = [];
    for (let offset = totalDays - 1; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const key = date.toISOString().slice(0, 10);
      const count = countsByDate.get(key) || 0;
      orderedDays.push({
        key,
        label: date.toLocaleDateString('ru-RU'),
        count,
      });
    }

    const maxCount = orderedDays.reduce((max, day) => Math.max(max, day.count), 0);
    const activeDays = orderedDays.filter((day) => day.count > 0).length;
    const last7Days = orderedDays.slice(-7).reduce((sum, day) => sum + day.count, 0);
    const last30Days = orderedDays.slice(-30).reduce((sum, day) => sum + day.count, 0);

    const heatmap = orderedDays.map((day) => ({
      ...day,
      level: this.getIntensityLevel(day.count, maxCount),
    }));

    return {
      heatmap,
      activity: {
        totalDays,
        activeDays,
        last7Days,
        last30Days,
        maxCount,
      },
    };
  }

  getIntensityLevel(count, maxCount) {
    if (!count || !maxCount) {
      return 0;
    }

    const ratio = count / maxCount;

    if (ratio >= 0.75) {
      return 4;
    }
    if (ratio >= 0.5) {
      return 3;
    }
    if (ratio >= 0.25) {
      return 2;
    }
    return 1;
  }
}
