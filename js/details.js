import { WeatherService } from './weather.js';

class DetailsPage {
    constructor() {
        this.weatherService = new WeatherService();
        this.settings = this.loadSettings();
        this.init();
    }

    async init() {
        try {
            // Get location from localStorage
            const savedLocation = JSON.parse(localStorage.getItem('weatherLocation'));
            
            if (!savedLocation) {
                throw new Error('Location information not found!');
            }

            const weatherData = await this.weatherService.getWeather(
                savedLocation.lat,
                savedLocation.lon
            );
            
            const forecastData = await this.weatherService.getForecast(
                savedLocation.lat,
                savedLocation.lon
            );
            
            this.updateUI(weatherData, forecastData);
        } catch (error) {
            console.error('Error:', error);
            // Redirect to home page on error
            window.location.href = 'index.html';
        }
    }

    loadSettings() {
        return JSON.parse(localStorage.getItem('weatherSettings')) || {
            defaultCity: 'warsaw',
            tempUnit: 'celsius',
            theme: 'light'
        };
    }

    convertTemperature(temp) {
        if (this.settings.tempUnit === 'fahrenheit') {
            return Math.round((temp * 9/5) + 32) + '°F';
        }
        return Math.round(temp) + '°C';
    }

    updateUI(weather, forecast) {
        // City and temperature
        if (this.settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        document.querySelector('.city-name').textContent = weather.name;
        document.querySelector('.current-temp').textContent = 
            this.convertTemperature(weather.main.temp);

        document.querySelector('.feels-like').textContent = 
            this.convertTemperature(weather.main.feels_like);
        document.querySelector('.wind-speed').textContent = 
            `${Math.round(weather.wind.speed)} km/h`;
        document.querySelector('.humidity').textContent = 
            `${weather.main.humidity}%`;
        document.querySelector('.pressure').textContent = 
            `${weather.main.pressure} hPa`;

        // Sun information
        const sunriseTime = new Date(weather.sys.sunrise * 1000)
            .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const sunsetTime = new Date(weather.sys.sunset * 1000)
            .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        document.querySelector('.sunrise-time').textContent = sunriseTime;
        document.querySelector('.sunset-time').textContent = sunsetTime;

        // Hourly forecast
        this.updateHourlyForecast(forecast);
    }

    updateHourlyForecast(forecast) {
        const container = document.querySelector('.hourly-forecast-container');
        const hourlyHTML = forecast.list.slice(0, 8).map(item => `
            <div class="text-center mx-3">
                <div>${new Date(item.dt * 1000).toLocaleTimeString('en-US', 
                    { hour: '2-digit', minute: '2-digit' })}</div>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" 
                    alt="${item.weather[0].description}">
                <div>${this.convertTemperature(item.main.temp)}</div>
            </div>
        `).join('');
        
        container.innerHTML = hourlyHTML;
    }
}

new DetailsPage();