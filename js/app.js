// app.js
import { WeatherService } from './weather.js';
import { NetworkStatus } from './network.js';
import { LocationService } from './location.js';

class App {
    constructor() {
        this.weatherService = new WeatherService();
        this.locationService = new LocationService();
        this.settings = this.loadSettings();
        this.deferredPrompt = null; // PWA prompt için
        this.init();
        this.setupEventListeners();
        this.initializeEventListeners();
        this.setupPWA();
    }

    // PWA Setup
    setupPWA() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prompt'u sakla
            this.deferredPrompt = e;
            
            // Install butonunu göster
            const installButton = document.createElement('button');
            installButton.id = 'install-btn';
            installButton.className = 'btn btn-outline-primary';
            installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
            
            // Butonu header'a ekle
            const header = document.querySelector('.d-flex.gap-2');
            if (header) {
                header.prepend(installButton);
                
                // Butona tıklanınca prompt'u göster
                installButton.addEventListener('click', async () => {
                    if (this.deferredPrompt) {
                        this.deferredPrompt.prompt();
                        const { outcome } = await this.deferredPrompt.userChoice;
                        console.log(`User response to the install prompt: ${outcome}`);
                        this.deferredPrompt = null;
                        installButton.remove(); // Butonu kaldır
                    }
                });
            }
        });

        window.addEventListener('appinstalled', (evt) => {
            console.log('Weather App was installed successfully');
            this.deferredPrompt = null;
            // Install butonu varsa kaldır
            const installButton = document.getElementById('install-btn');
            if (installButton) {
                installButton.remove();
            }
        });
    }

    showInstallButton() {
        const installButton = document.getElementById('install-btn');
        if (installButton) {
            installButton.classList.remove('d-none');
        }
    }

    hideInstallButton() {
        const installButton = document.getElementById('install-btn');
        if (installButton) {
            installButton.classList.add('d-none');
        }
    }

    setupEventListeners() {
        // When city is selected
        window.addEventListener('locationSelected', async (event) => {
            const location = event.detail;
            try {
                const weatherData = await this.weatherService.getWeather(
                    location.lat,
                    location.lon
                    );
                this.updateUI(weatherData);
            } catch (error) {
                console.error('Failed to fetch weather data:', error);
            }
        });

        // When location is updated
        window.addEventListener('locationUpdated', async (event) => {
            const location = event.detail;
            try {
                const weatherData = await this.weatherService.getWeather(
                    location.coords.latitude,
                    location.coords.longitude
                    );
                this.updateUI(weatherData);
            } catch (error) {
                console.error('Failed to fetch weather data:', error);
            }
        });
    }

    loadSettings() {
        const defaultSettings = {
            defaultCity: 'Warsaw',
            tempUnit: 'celsius',
            theme: 'light'
        };

        const savedSettings = JSON.parse(localStorage.getItem('weatherSettings'));
        return {...defaultSettings, ...savedSettings};
    }
    
    async init() {
        try {
            this.applyTheme();
            await this.loadWeatherData();

            let weatherData;
            
            if (this.settings.defaultCity) {
                weatherData = await this.weatherService.getWeatherByCity(this.settings.defaultCity);
            } else {
                const position = await this.getCurrentPosition();
                weatherData = await this.weatherService.getWeather(
                    position.coords.latitude,
                    position.coords.longitude
                    );
            }

            this.updateUI(weatherData);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    applyTheme() {
        if (this.settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    convertTemperature(temp) {
        if (this.settings.tempUnit === 'fahrenheit') {
            return Math.round((temp * 9/5) + 32) + '°F';
        }
        return Math.round(temp) + '°C';
    }

    initializeEventListeners() {
        document.getElementById('share-btn').addEventListener('click', () => this.shareWeather());
        
        window.addEventListener('locationSelected', async (e) => {
            console.log('New location selected:', e.detail);
            await this.loadWeatherData(e.detail);
        });

        window.addEventListener('locationUpdated', (e) => {
            this.loadWeatherData(e.detail);
        });

        document.getElementById('refresh-location').addEventListener('click', () => this.loadWeatherData());

        // PWA install button
        const installButton = document.getElementById('install-btn');
        if (installButton) {
            installButton.addEventListener('click', async () => {
                if (this.deferredPrompt) {
                    this.deferredPrompt.prompt();
                    const { outcome } = await this.deferredPrompt.userChoice;
                    console.log(`User response to the install prompt: ${outcome}`);
                    this.deferredPrompt = null;
                    this.hideInstallButton();
                }
            });
        }
    }

    async loadWeatherData(locationData = null) {
        try {
            let location = locationData || await this.locationService.getCurrentPosition();
            console.log('Using location:', location);

            let lat, lon;

            if (location.coords) {
                lat = location.coords.latitude;
                lon = location.coords.longitude;
            } else if (location.lat && location.lon) {
                lat = location.lat;
                lon = location.lon;
            } else {
                throw new Error('Invalid location format');
            }

            const weatherData = await this.weatherService.getWeather(lat, lon);
            const forecastData = await this.weatherService.getForecast(lat, lon);
            
            console.log('Forecast Data:', forecastData);

            this.updateUI(weatherData);
            this.updateForecastUI(forecastData);

        } catch (error) {
            console.error('Error loading weather data:', error);
        }
    }

    updateForecastUI(forecastData) {
        const container = document.getElementById('forecast-container');
        if (!container) {
            console.error('Forecast container not found!');
            return;
        }
        
        console.log('Container found, updating...');

        container.innerHTML = '';

        const dailyForecasts = this.groupForecastsByDay(forecastData.list);
        console.log('Daily forecasts:', dailyForecasts);

        dailyForecasts.forEach(day => {
            const card = `
            <div class="col">
            <div class="forecast-card">
            <h4>${new Date(day.dt * 1000).toLocaleDateString('en-US', {weekday: 'short'})}</h4>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather">
            <p class="temp">${this.convertTemperature(day.main.temp)}</p>
            <p class="desc">${day.weather[0].description}</p>
            </div>
            </div>
            `;
            container.innerHTML += card;
        });
    }

    groupForecastsByDay(forecastList) {
        const dailyForecasts = [];
        const days = {};

        forecastList.forEach(forecast => {
            const date = new Date(forecast.dt * 1000).toDateString();
            if (!days[date]) {
                days[date] = forecast;
                dailyForecasts.push(forecast);
            }
        });

        return dailyForecasts.slice(0, 5);
    }

    showError(message) {
        alert(message);
    }

    updateUI(weatherData) {
        const temp = this.convertTemperature(weatherData.main.temp);

        document.getElementById('temperature').textContent = temp;
        document.getElementById('weather-description').textContent = weatherData.weather[0].description;
        document.getElementById('humidity').textContent = `${weatherData.main.humidity}%`;
        document.getElementById('wind-speed').textContent = `${weatherData.wind.speed} km/h`;
        document.getElementById('pressure').textContent = `${weatherData.main.pressure} hPa`;

        const iconCode = weatherData.weather[0].icon;
        document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        document.getElementById('current-location').textContent = weatherData.name;

        document.getElementById('details-btn').addEventListener('click', () => {
            localStorage.setItem('weatherLocation', JSON.stringify({
                lat: weatherData.coord.lat,
                lon: weatherData.coord.lon,
                name: weatherData.name
            }));
        });
    }

    async shareWeather() {
        if (!navigator.share) {
            alert('Share feature is not supported by your browser.');
            return;
        }

        try {
            await navigator.share({
                title: 'Weather',
                text: `In ${document.getElementById('current-location').textContent}, it's ${document.getElementById('temperature').textContent} and ${document.getElementById('weather-description').textContent}`,
                url: window.location.href
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    }
}

// Initialize app
new App();

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('ServiceWorker registration successful');
        })
        .catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}