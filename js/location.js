export class LocationService {
    constructor(isSettingsPage = false) {
        this.defaultLocation = {
            lat: 52.2297,
            lon: 21.0122,
            name: "Warsaw"
        };
        this.currentLocation = this.defaultLocation;
        this.cities = [
            { name: "Warsaw", coords: "52.2297,21.0122" },
            { name: "Kraków", coords: "50.0647,19.9450" },
            { name: "Łódź", coords: "51.7592,19.4560" },
            { name: "Wrocław", coords: "51.1079,17.0385" },
            { name: "Poznań", coords: "52.4064,16.9252" },
            { name: "Gdańsk", coords: "54.3520,18.6466" },
            { name: "Szczecin", coords: "53.4289,14.5530" },
            { name: "Bydgoszcz", coords: "53.1235,18.0084" },
            { name: "Lublin", coords: "51.2465,22.5684" },
            { name: "Katowice", coords: "50.2599,19.0216" },
            { name: "Białystok", coords: "53.1325,23.1688" },
            { name: "Gdynia", coords: "54.5189,18.5305" },
            { name: "Częstochowa", coords: "50.8118,19.1203" },
            { name: "Radom", coords: "51.4027,21.1471" },
            { name: "Toruń", coords: "53.0138,18.5984" },
            { name: "Rzeszów", coords: "50.0412,21.9991" },
            { name: "Sosnowiec", coords: "50.2863,19.1041" },
            { name: "Kielce", coords: "50.8661,20.6286" },
            { name: "Gliwice", coords: "50.2945,18.6714" },
            { name: "Zabrze", coords: "50.3249,18.7857" }
        ];
        if (!isSettingsPage) {
            this.initializeCitySearch();
        }
        
        // Initialize city search when modal is shown
        // document.getElementById('cityModal').addEventListener('shown.bs.modal', () => {
        //     this.initializeCitySearch();
        // });
    }

    getCities() {
        return this.cities;
    }

    initializeCitySearch() {
        const searchInput = document.getElementById('citySearch');
        
        // Show all cities on initial load
        this.renderCityList('');

        // Listen for search input
        searchInput.addEventListener('input', (e) => {
            this.renderCityList(e.target.value);
        });

        // Clear input
        searchInput.value = '';
    }

    renderCityList(searchTerm) {
        const cityList = document.getElementById('cityList');
        const filteredCities = this.cities.filter(city => 
            city.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        cityList.innerHTML = filteredCities.map(city => `
            <div class="city-item" data-coords="${city.coords}" data-name="${city.name}">
                <i class="fas fa-map-marker-alt me-2"></i>
                ${city.name}
            </div>
        `).join('');

        cityList.querySelectorAll('.city-item').forEach(item => {
            item.addEventListener('click', () => {
                const coords = item.dataset.coords;
                const cityName = item.dataset.name;
                const [lat, lon] = coords.split(',');
                
                const newLocation = {
                    lat: parseFloat(lat),
                    lon: parseFloat(lon),
                    name: cityName
                };

                window.dispatchEvent(new CustomEvent('locationSelected', {
                    detail: newLocation
                }));

                bootstrap.Modal.getInstance(document.getElementById('cityModal')).hide();
            });
        });
    }

    async getCurrentPosition() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(this.defaultLocation);
                return;
            }

            resolve(this.defaultLocation);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLocation = {
                        coords: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        }
                    };
                    window.dispatchEvent(new CustomEvent('locationUpdated', {
                        detail: this.currentLocation
                    }));
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                }
            );
        });
    }

    setSelectedCity(coords) {
        const [lat, lon] = coords.split(',');
        return {
            coords: {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon)
            }
        };
    }
}