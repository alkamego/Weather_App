// weather.js
export class WeatherService {
    constructor() {
        this.API_KEY = 'c050a3443ba9182498e549250a8ed089';
        this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
    }
  
    async getWeather(lat, lon) {
        const response = await fetch(
            `${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric&lang=en`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        return response.json();
    }

    async getWeatherByCity(city) {
        const response = await fetch(
            `${this.BASE_URL}/weather?q=${city}&appid=${this.API_KEY}&units=metric&lang=en`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        return response.json();
    }

    async getForecast(lat, lon) {
        const response = await fetch(
            `${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric&lang=en`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        
        return response.json();
    }
}