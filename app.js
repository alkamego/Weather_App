// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    const locationBtn = document.getElementById('btn-get-location');
    const locationStatus = document.getElementById('location-status');
    const weatherSection = document.getElementById('weather-section');
    const temperatureDisplay = document.getElementById('temperature');
    const conditionDisplay = document.getElementById('condition');

    // Event Listener for the 'Get Location' button
    locationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            locationStatus.textContent = 'Locating…';
            navigator.geolocation.getCurrentPosition(fetchWeatherData, handleLocationError);
        } else {
            locationStatus.textContent = 'Geolocation is not supported by your browser.';
        }
    });

    /**
     * Fetch weather data based on the user's location
     * @param {Object} position - Geolocation position object
     */
    function fetchWeatherData(position) {
        const { latitude, longitude } = position.coords;
        const apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        locationStatus.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;

        fetch(weatherApiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch weather data');
                return response.json();
            })
            .then(data => {
                displayWeatherData(data);
            })
            .catch(error => {
                locationStatus.textContent = 'Unable to retrieve weather data at the moment.';
                console.error('Error:', error);
            });
    }

    /**
     * Display weather data in the UI
     * @param {Object} data - Weather data from API
     */
    function displayWeatherData(data) {
        const { temp } = data.main;
        const { description } = data.weather[0];

        weatherSection.classList.remove('hidden'); // Show weather section
        temperatureDisplay.textContent = `${temp}°C`;
        conditionDisplay.textContent = description.charAt(0).toUpperCase() + description.slice(1);
    }

    /**
     * Handle geolocation errors
     * @param {Object} error - Geolocation error object
     */
    function handleLocationError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                locationStatus.textContent = 'Location access denied by the user.';
                break;
            case error.POSITION_UNAVAILABLE:
                locationStatus.textContent = 'Location information is unavailable.';
                break;
            case error.TIMEOUT:
                locationStatus.textContent = 'The request to get your location timed out.';
                break;
            default:
                locationStatus.textContent = 'An unknown error occurred.';
                break;
        }
    }
});
