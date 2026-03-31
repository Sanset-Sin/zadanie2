import { UIComponent } from './UIComponent.js';

export class WeatherWidget extends UIComponent {
  constructor(config) {
    super(config);
    this.city = 'Berlin';
    this.state = {
      loading: false,
      error: '',
      place: '',
      temperature: null,
      windspeed: null,
      weatherCode: null,
      updatedAt: '',
      advice: '',
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
    input.placeholder = 'Введите город';
    input.value = this.city;

    const button = document.createElement('button');
    button.className = 'button';
    button.type = 'submit';
    button.textContent = 'Найти';

    form.append(input, button);

    const status = document.createElement('div');
    status.className = 'widget-note';

    const card = document.createElement('div');
    card.className = 'api-card';

    const renderState = () => {
      if (this.state.loading) {
        status.textContent = 'Загружаю погоду...';
        card.innerHTML = '<p class="placeholder-card">Запрашиваю данные Open-Meteo.</p>';
        return;
      }

      if (this.state.error) {
        status.textContent = 'Ошибка загрузки';
        card.innerHTML = `<p class="error-text">${this.state.error}</p>`;
        return;
      }

      if (this.state.temperature === null) {
        status.textContent = 'Нет данных';
        card.innerHTML = '<p class="placeholder-card">Введи город, и я покажу текущую погоду.</p>';
        return;
      }

      status.textContent = `Источник: Open-Meteo · Обновлено: ${this.state.updatedAt}`;
      card.innerHTML = `
        <div class="stat-row">
          <span class="stat-label">Локация</span>
          <strong>${this.state.place}</strong>
        </div>
        <div class="stat-row">
          <span class="stat-label">Температура</span>
          <strong>${this.state.temperature}°C</strong>
        </div>
        <div class="stat-row">
          <span class="stat-label">Ветер</span>
          <strong>${this.state.windspeed} км/ч</strong>
        </div>
        <div class="stat-row">
          <span class="stat-label">Состояние</span>
          <strong>${this.getWeatherDescription(this.state.weatherCode)}</strong>
        </div>
        <div class="advice-box">
          <span class="advice-box__label">Рекомендация</span>
          <strong>${this.state.advice}</strong>
        </div>
      `;
    };

    const loadWeather = async (city) => {
      this.state.loading = true;
      this.state.error = '';
      renderState();

      try {
        const geoResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`,
        );
        const geoData = await geoResponse.json();
        const location = geoData?.results?.[0];

        if (!location) {
          throw new Error('Город не найден. Попробуй написать название точнее.');
        }

        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`,
        );
        const weatherData = await weatherResponse.json();
        const current = weatherData?.current;

        if (!current) {
          throw new Error('Сервис не вернул текущую погоду.');
        }

        this.city = city;
        this.state = {
          loading: false,
          error: '',
          place: `${location.name}${location.country ? `, ${location.country}` : ''}`,
          temperature: current.temperature_2m,
          windspeed: current.wind_speed_10m,
          weatherCode: current.weather_code,
          updatedAt: new Date(current.time).toLocaleString('ru-RU'),
          advice: this.getWeatherAdvice(current.temperature_2m, current.wind_speed_10m, current.weather_code),
        };
      } catch (error) {
        this.state.loading = false;
        this.state.error = error.message || 'Не удалось загрузить данные о погоде.';
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
      loadWeather(value);
    };

    this.addManagedListener(form, 'submit', onSubmit);

    root.append(form, status, card);
    renderState();
    loadWeather(this.city);

    return root;
  }

  getWeatherDescription(code) {
    const map = {
      0: 'Ясно',
      1: 'Преимущественно ясно',
      2: 'Переменная облачность',
      3: 'Пасмурно',
      45: 'Туман',
      48: 'Изморозь',
      51: 'Слабая морось',
      53: 'Морось',
      55: 'Сильная морось',
      61: 'Слабый дождь',
      63: 'Дождь',
      65: 'Сильный дождь',
      71: 'Слабый снег',
      73: 'Снег',
      75: 'Сильный снег',
      80: 'Ливень',
      95: 'Гроза',
    };

    return map[code] || 'Неизвестно';
  }

  getWeatherAdvice(temperature, windspeed, weatherCode) {
    if (weatherCode >= 61 || weatherCode === 80 || weatherCode === 95) {
      return 'Похоже на осадки: лучше взять зонт и не планировать долгую прогулку без необходимости.';
    }

    if (temperature <= 0) {
      return 'На улице холодно. Тёплая куртка и быстрые перебежки между делами сегодня будут кстати.';
    }

    if (temperature >= 25) {
      return 'Тепло. Можно вынести часть дел на улицу или прогуляться после работы.';
    }

    if (windspeed >= 25) {
      return 'Ветер заметный. Для длительной прогулки лучше выбрать закрытую одежду и не брать лёгкие вещи.';
    }

    return 'Погода спокойная. Нормальный день, чтобы закрыть дела и выбраться на короткую прогулку.';
  }
}
