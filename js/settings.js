import { LocationService } from './location.js';

class Settings {
    constructor() {
        this.locationService = new LocationService(true);
        this.loadSettings();
        this.populateCitySelect();
        this.bindEvents();
    }

    populateCitySelect() {
        const citySelect = document.getElementById('defaultCity');
        if (!citySelect) return;

        citySelect.innerHTML = ''; // Clear existing options

        // Get cities from LocationService and add to select
        this.locationService.cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.name.toLowerCase();
            option.textContent = city.name;
            citySelect.appendChild(option);
        });
    }

    loadSettings() {
        // Get saved settings from localStorage
        const settings = JSON.parse(localStorage.getItem('weatherSettings')) || {
            defaultCity: 'Warsaw',
            tempUnit: 'celsius',
            theme: 'light'
        };

        const defaultCityElement = document.getElementById('defaultCity');
        const tempUnitElement = document.getElementById(settings.tempUnit);
        const themeElement = document.getElementById(settings.theme);

        // Add null checks
        if (defaultCityElement) {
            defaultCityElement.value = settings.defaultCity.toLowerCase();
        }
        if (tempUnitElement) {
            tempUnitElement.checked = true;
        }
        if (themeElement) {
            themeElement.checked = true;
        }

        // Apply theme
        this.applyTheme(settings.theme);
    }

    bindEvents() {
        const saveButton = document.getElementById('saveSettings');
        if (!saveButton) return;

        saveButton.addEventListener('click', () => {
            const selectedCity = document.getElementById('defaultCity');
            const settings = {
                defaultCity: selectedCity.value,
                tempUnit: document.querySelector('input[name="tempUnit"]:checked').value,
                theme: document.querySelector('input[name="theme"]:checked').value
            };

            // Save settings
            localStorage.setItem('weatherSettings', JSON.stringify(settings));
            
            // Apply theme
            this.applyTheme(settings.theme);

            // Show success message
            alert('Settings saved successfully!');
        });
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Settings();
});