// CheckInSafe App - Main JavaScript

class CheckInSafe {
    constructor() {
        this.activeCheckIn = null;
        this.history = [];
        this.monitorInterval = null;
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateUI();
        this.startMonitoring();
    }

    setupEventListeners() {
        document.getElementById('checkInForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createCheckIn();
        });

        document.getElementById('safeButton').addEventListener('click', () => {
            this.markAsSafe();
        });

        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });
    }

    createCheckIn() {
        const location = document.getElementById('location').value.trim();
        const timeInput = document.getElementById('expectedTime').value;

        if (!location || !timeInput) return;

        const now = new Date();
        const [hours, minutes] = timeInput.split(':');
        const expectedTime = new Date();
        expectedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // If time is in the past, set it for tomorrow
        if (expectedTime <= now) {
            expectedTime.setDate(expectedTime.getDate() + 1);
        }

        this.activeCheckIn = {
            id: Date.now(),
            location: location,
            expectedTime: expectedTime.toISOString(),
            checkedIn: false,
            checkedInTime: null,
            alertTriggered: false
        };

        this.saveToStorage();
        this.updateUI();
        
        // Reset form
        document.getElementById('checkInForm').reset();
    }

    markAsSafe() {
        if (!this.activeCheckIn) return;

        this.activeCheckIn.checkedIn = true;
        this.activeCheckIn.checkedInTime = new Date().toISOString();

        // Move to history
        this.history.unshift(this.activeCheckIn);
        this.activeCheckIn = null;

        this.saveToStorage();
        this.updateUI();
        this.hideAlert();
    }

    startMonitoring() {
        // Check every 10 seconds
        this.monitorInterval = setInterval(() => {
            this.checkForAlerts();
        }, 10000);

        // Also check immediately
        this.checkForAlerts();
    }

    checkForAlerts() {
        if (!this.activeCheckIn || this.activeCheckIn.alertTriggered) return;

        const now = new Date();
        const expectedTime = new Date(this.activeCheckIn.expectedTime);

        if (now >= expectedTime && !this.activeCheckIn.checkedIn) {
            this.triggerAlert();
        }
    }

    triggerAlert() {
        if (!this.activeCheckIn) return;

        this.activeCheckIn.alertTriggered = true;
        this.saveToStorage();

        const alertBanner = document.getElementById('alertBanner');
        const alertMessage = document.getElementById('alertMessage');
        
        alertMessage.textContent = `Alert! You haven't checked in for "${this.activeCheckIn.location}". Please confirm your safety.`;
        alertBanner.style.display = 'flex';

        // Play alert sound (simulated with console)
        console.log('🚨 ALERT: Check-in time exceeded!');
    }

    hideAlert() {
        document.getElementById('alertBanner').style.display = 'none';
    }

    updateUI() {
        this.updateStatusCard();
        this.updateSafeButton();
        this.updateHistory();
    }

    updateStatusCard() {
        const statusContent = document.getElementById('statusContent');

        if (this.activeCheckIn) {
            const expectedTime = new Date(this.activeCheckIn.expectedTime);
            const timeString = expectedTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            statusContent.innerHTML = `
                <div class="status-active">
                    <strong>📍 ${this.activeCheckIn.location}</strong>
                    <div>Expected arrival: ${timeString}</div>
                    ${this.activeCheckIn.alertTriggered ? '<div style="color: #ff6b6b; margin-top: 5px;">⚠️ Alert triggered!</div>' : ''}
                </div>
            `;
        } else {
            statusContent.innerHTML = '<p class="status-idle">No active check-in</p>';
        }
    }

    updateSafeButton() {
        const container = document.getElementById('safeButtonContainer');
        container.style.display = this.activeCheckIn ? 'block' : 'none';
    }

    updateHistory() {
        const historyList = document.getElementById('historyList');

        if (this.history.length === 0) {
            historyList.innerHTML = '<p class="empty-state">No check-ins yet</p>';
            return;
        }

        historyList.innerHTML = this.history.map(item => {
            const expectedTime = new Date(item.expectedTime);
            const checkedInTime = item.checkedInTime ? new Date(item.checkedInTime) : null;
            
            const status = item.checkedIn ? 'completed' : 'missed';
            const statusText = item.checkedIn 
                ? `✓ Checked in at ${checkedInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                : '✗ Missed check-in';

            return `
                <div class="history-item ${status}">
                    <div class="history-item-location">${item.location}</div>
                    <div class="history-item-time">Expected: ${expectedTime.toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })}</div>
                    <div class="history-item-status ${status}">${statusText}</div>
                </div>
            `;
        }).join('');
    }

    saveToStorage() {
        localStorage.setItem('checkInSafe_active', JSON.stringify(this.activeCheckIn));
        localStorage.setItem('checkInSafe_history', JSON.stringify(this.history));
    }

    loadFromStorage() {
        const active = localStorage.getItem('checkInSafe_active');
        const history = localStorage.getItem('checkInSafe_history');

        if (active) {
            this.activeCheckIn = JSON.parse(active);
        }

        if (history) {
            this.history = JSON.parse(history);
        }
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all check-in history?')) {
            this.history = [];
            this.saveToStorage();
            this.updateUI();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CheckInSafe();
});
