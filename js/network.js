// network.js
export class NetworkStatus {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());
        this.updateOnlineStatus();
    }

    updateOnlineStatus() {
        const banner = document.getElementById('offline-banner');
        if (!navigator.onLine) {
            banner.classList.remove('d-none');
        } else {
            banner.classList.add('d-none');
        }
    }
}