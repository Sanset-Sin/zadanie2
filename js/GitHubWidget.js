import { UIComponent } from './UIComponent.js';

export class GitHubWidget extends UIComponent {
  constructor(config) {
    super(config);
<<<<<<< HEAD
    this.username = 'octocat';
    this.state = {
      loading: false,
      error: '',
      profile: null,
      activity: [],
      recentEvents: [],
      summary: {
        activeDays: 0,
        totalEvents: 0,
        busiestDay: 0,
      },
=======
    this.username = 'Sanset-Sin';
    this.state = {
      loading: false,
      error: '',
      data: null,
>>>>>>> f37c79b27c4006bd460f2ffe3c562d9a0d501b08
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

<<<<<<< HEAD
    const renderHeatmap = () => {
      if (!this.state.activity.length) {
        return '<p class="placeholder-card">Нет публичной активности за доступный период GitHub Events API.</p>';
      }

      const cells = this.state.activity
        .map(
          (day) => `
            <div class="heatmap-cell heatmap-cell--${this.getActivityLevel(day.count)}" title="${day.date}: ${day.count}"></div>
          `,
        )
        .join('');

      return `
        <div class="heatmap-wrapper">
          <div class="heatmap-grid">${cells}</div>
          <div class="heatmap-legend">
            <span>меньше</span>
            <div class="heatmap-cell heatmap-cell--0"></div>
            <div class="heatmap-cell heatmap-cell--1"></div>
            <div class="heatmap-cell heatmap-cell--2"></div>
            <div class="heatmap-cell heatmap-cell--3"></div>
            <div class="heatmap-cell heatmap-cell--4"></div>
            <span>больше</span>
          </div>
        </div>
      `;
    };

    const renderRecentEvents = () => {
      if (!this.state.recentEvents.length) {
        return '<p class="muted">Публичные события не найдены.</p>';
      }

      const items = this.state.recentEvents
        .map(
          (event) => `
            <li class="activity-item">
              <strong>${event.type}</strong>
              <span class="muted">${event.repo}</span>
              <span class="muted">${event.when}</span>
            </li>
          `,
        )
        .join('');

      return `<ul class="activity-list">${items}</ul>`;
    };

    const renderState = () => {
      if (this.state.loading) {
        status.textContent = 'Загружаю профиль и активность...';
=======
    const renderState = () => {
      if (this.state.loading) {
        status.textContent = 'Загружаю профиль...';
>>>>>>> f37c79b27c4006bd460f2ffe3c562d9a0d501b08
        card.innerHTML = '<p class="placeholder-card">Запрашиваю GitHub API.</p>';
        return;
      }

      if (this.state.error) {
        status.textContent = 'Ошибка загрузки';
        card.innerHTML = `<p class="error-text">${this.state.error}</p>`;
        return;
      }

<<<<<<< HEAD
      if (!this.state.profile) {
=======
      if (!this.state.data) {
>>>>>>> f37c79b27c4006bd460f2ffe3c562d9a0d501b08
        status.textContent = 'Нет данных';
        card.innerHTML = '<p class="placeholder-card">Введи username и загрузи профиль.</p>';
        return;
      }

      const { avatar_url, name, login, bio, public_repos, followers, following, html_url } =
<<<<<<< HEAD
        this.state.profile;

      status.textContent = 'Источник: GitHub REST API · профиль + публичные события';
=======
        this.state.data;

      status.textContent = 'Источник: GitHub REST API';
>>>>>>> f37c79b27c4006bd460f2ffe3c562d9a0d501b08
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
<<<<<<< HEAD
            <div class="stats-grid stats-grid--secondary">
              <div class="mini-stat"><span>Активные дни</span><strong>${this.state.summary.activeDays}</strong></div>
              <div class="mini-stat"><span>События</span><strong>${this.state.summary.totalEvents}</strong></div>
              <div class="mini-stat"><span>Пик / день</span><strong>${this.state.summary.busiestDay}</strong></div>
            </div>
            <a class="text-link" href="${html_url}" target="_blank" rel="noreferrer">Открыть профиль</a>
          </div>
        </div>
        <section class="stack stack--tight">
          <div>
            <h4 class="subheading">Активность за последние 30 дней</h4>
            <p class="muted">Тепловая карта строится по публичным событиям пользователя.</p>
          </div>
          ${renderHeatmap()}
        </section>
        <section class="stack stack--tight">
          <div>
            <h4 class="subheading">Последние действия</h4>
            <p class="muted">Push, pull request, issue и другие публичные события.</p>
          </div>
          ${renderRecentEvents()}
        </section>
      `;
    };

    const buildActivity = (events) => {
      const counts = new Map();
      const days = [];
      const now = new Date();

      for (let offset = 29; offset >= 0; offset -= 1) {
        const day = new Date(now);
        day.setDate(now.getDate() - offset);
        const key = day.toISOString().slice(0, 10);
        counts.set(key, 0);
        days.push(key);
      }

      events.forEach((event) => {
        const key = event.created_at?.slice(0, 10);
        if (counts.has(key)) {
          counts.set(key, counts.get(key) + 1);
        }
      });

      const activity = days.map((date) => ({ date, count: counts.get(date) }));
      const totalEvents = activity.reduce((sum, day) => sum + day.count, 0);
      const activeDays = activity.filter((day) => day.count > 0).length;
      const busiestDay = Math.max(...activity.map((day) => day.count), 0);

      return {
        activity,
        summary: {
          activeDays,
          totalEvents,
          busiestDay,
        },
      };
    };

    const normalizeEventType = (type) => {
      const labels = {
        PushEvent: 'Push',
        PullRequestEvent: 'Pull request',
        IssuesEvent: 'Issue',
        WatchEvent: 'Star',
        ForkEvent: 'Fork',
        CreateEvent: 'Create',
        DeleteEvent: 'Delete',
        ReleaseEvent: 'Release',
        PublicEvent: 'Public',
      };

      return labels[type] || type.replace('Event', '');
    };

=======
            <a class="text-link" href="${html_url}" target="_blank" rel="noreferrer">Открыть профиль</a>
          </div>
        </div>
      `;
    };

>>>>>>> f37c79b27c4006bd460f2ffe3c562d9a0d501b08
    const loadProfile = async (username) => {
      this.state.loading = true;
      this.state.error = '';
      renderState();

      try {
<<<<<<< HEAD
        const profileResponse = await fetch(
          `https://api.github.com/users/${encodeURIComponent(username)}`,
        );

        if (!profileResponse.ok) {
          throw new Error('Пользователь не найден или GitHub временно недоступен.');
        }

        const pages = [1, 2, 3];
        const eventRequests = pages.map((page) =>
          fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=100&page=${page}`,
          ).then((response) => (response.ok ? response.json() : [])),
        );

        const [profile, ...eventPages] = await Promise.all([
          profileResponse.json(),
          ...eventRequests,
        ]);

        const events = eventPages.flat().filter(Boolean);
        const { activity, summary } = buildActivity(events);
        const recentEvents = events.slice(0, 6).map((event) => ({
          type: normalizeEventType(event.type),
          repo: event.repo?.name || 'Без репозитория',
          when: new Date(event.created_at).toLocaleString('ru-RU'),
        }));
=======
        const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);

        if (!response.ok) {
          throw new Error('Пользователь не найден или GitHub временно недоступен.');
        }

        const data = await response.json();
>>>>>>> f37c79b27c4006bd460f2ffe3c562d9a0d501b08

        this.username = username;
        this.state = {
          loading: false,
          error: '',
<<<<<<< HEAD
          profile,
          activity,
          recentEvents,
          summary,
=======
          data,
>>>>>>> f37c79b27c4006bd460f2ffe3c562d9a0d501b08
        };
      } catch (error) {
        this.state = {
          loading: false,
<<<<<<< HEAD
          error: error.message || 'Не удалось загрузить данные GitHub.',
          profile: null,
          activity: [],
          recentEvents: [],
          summary: {
            activeDays: 0,
            totalEvents: 0,
            busiestDay: 0,
          },
=======
          error: error.message || 'Не удалось загрузить профиль GitHub.',
          data: null,
>>>>>>> f37c79b27c4006bd460f2ffe3c562d9a0d501b08
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
<<<<<<< HEAD

  getActivityLevel(count) {
    if (count === 0) {
      return 0;
    }

    if (count <= 1) {
      return 1;
    }

    if (count <= 3) {
      return 2;
    }

    if (count <= 6) {
      return 3;
    }

    return 4;
  }
=======
>>>>>>> f37c79b27c4006bd460f2ffe3c562d9a0d501b08
}
