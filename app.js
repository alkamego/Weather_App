document.addEventListener('DOMContentLoaded', () => {
    const locationBtn = document.getElementById('btn-get-location');
    const locationStatus = document.getElementById('location-status');
    const weatherSection = document.getElementById('weather-section');
    const temperatureDisplay = document.getElementById('temperature');
    const conditionDisplay = document.getElementById('condition');

    // Event listener for the button to get the user's location
    locationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            locationStatus.textContent = 'Locating…';
            navigator.geolocation.getCurrentPosition(getWeatherData, handleLocationError);
        } else {
            locationStatus.textContent = 'Geolocation is not supported by your browser.';
        }
    });

    /**
     * Fetch weather data based on the user's location using a weather API
     * @param {Object} position - The position object containing coordinates
     */
    function getWeatherData(position) {
        const { latitude, longitude } = position.coords;
        const apiKey = 'YOUR_API_KEY'; // Add your OpenWeatherMap API key here
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        locationStatus.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;

        fetch(weatherApiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch weather data');
                }
                return response.json();
            })
            .then(data => {
                displayWeatherData(data);
            })
            .catch(error => {
                locationStatus.textContent = 'Unable to retrieve weather data at the moment.';
                console.error('Error fetching weather data:', error);
            });
    }

    /**
     * Display the weather information in the UI
     * @param {Object} data - The weather data retrieved from the API
     */
    function displayWeatherData(data) {
        const { temp } = data.main;
        const { description } = data.weather[0];

        weatherSection.classList.remove('hidden');
        temperatureDisplay.textContent = `${temp}°C`;
        conditionDisplay.textContent = capitalizeFirstLetter(description);
    }

    /**
     * Handle errors that occur during geolocation retrieval
     * @param {Object} error - The error object returned by the geolocation API
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

    /**
     * Capitalize the first letter of a string
     * @param {string} str - The string to capitalize
     * @return {string} - The capitalized string
     */
    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
});
