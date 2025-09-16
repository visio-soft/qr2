class QRCodeScanner {
    constructor() {
        this.html5QrCode = null;
        this.isScanning = false;
        this.config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };
        
        this.initializeElements();
        this.bindEvents();
        this.startScanner();
    }
    
    initializeElements() {
        this.readerElement = document.getElementById('reader');
        this.resultElement = document.getElementById('result');
        this.qrResultElement = document.getElementById('qr-result');
        this.scanAgainButton = document.getElementById('scan-again');
        this.errorMessageElement = document.getElementById('error-message');
    }
    
    bindEvents() {
        this.scanAgainButton.addEventListener('click', () => {
            this.resetScanner();
        });
    }
    
    async startScanner() {
        try {
            this.html5QrCode = new Html5Qrcode("reader");
            
            // Get camera devices
            const devices = await Html5Qrcode.getCameras();
            
            if (devices && devices.length) {
                // Prefer back camera for mobile devices
                const cameraId = this.getPreferredCamera(devices);
                
                await this.html5QrCode.start(
                    cameraId,
                    this.config,
                    (decodedText, decodedResult) => {
                        this.onScanSuccess(decodedText, decodedResult);
                    },
                    (errorMessage) => {
                        // Optional: handle scan failures
                        console.log(`Scan failed: ${errorMessage}`);
                    }
                );
                
                this.isScanning = true;
                this.hideError();
            } else {
                this.showError('No cameras found on this device.');
            }
        } catch (err) {
            console.error('Error starting scanner:', err);
            this.showError(`Error starting camera: ${err.message || err}`);
        }
    }
    
    getPreferredCamera(devices) {
        // Try to find back camera first (better for QR scanning)
        const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
        );
        
        return backCamera ? backCamera.id : devices[0].id;
    }
    
    async onScanSuccess(decodedText, decodedResult) {
        console.log('QR Code detected:', decodedText);
        
        // Stop scanning immediately when QR is detected
        await this.stopScanner();
        
        // Show the result
        this.displayResult(decodedText);
    }
    
    async stopScanner() {
        if (this.html5QrCode && this.isScanning) {
            try {
                await this.html5QrCode.stop();
                this.isScanning = false;
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
    }
    
    displayResult(text) {
        this.qrResultElement.textContent = text;
        this.resultElement.classList.remove('hidden');
        this.readerElement.style.display = 'none';
    }
    
    async resetScanner() {
        // Hide result and show scanner again
        this.resultElement.classList.add('hidden');
        this.readerElement.style.display = 'block';
        this.hideError();
        
        // Clear the scanner and restart
        if (this.html5QrCode) {
            try {
                await this.html5QrCode.clear();
            } catch (err) {
                console.error('Error clearing scanner:', err);
            }
        }
        
        // Restart scanning
        await this.startScanner();
    }
    
    showError(message) {
        this.errorMessageElement.textContent = message;
        this.errorMessageElement.classList.remove('hidden');
    }
    
    hideError() {
        this.errorMessageElement.classList.add('hidden');
    }
    
    // Cleanup method
    async destroy() {
        await this.stopScanner();
        if (this.html5QrCode) {
            await this.html5QrCode.clear();
        }
    }
}

// Initialize the scanner when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a supported browser
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        document.getElementById('error-message').textContent = 
            'Camera access is not supported on this browser. Please use a modern browser like Chrome.';
        document.getElementById('error-message').classList.remove('hidden');
        return;
    }
    
    // Only create scanner instance if Html5Qrcode is available
    if (typeof Html5Qrcode !== 'undefined') {
        console.log('Using Html5Qrcode library');
        window.qrScanner = new QRCodeScanner();
        window.scannerInitialized = true; // Flag to prevent fallback initialization
    } else {
        console.log('Html5Qrcode not available, fallback scanner will be initialized');
        window.scannerInitialized = false; // Let fallback scanner initialize
    }
});

// Handle page visibility changes to manage camera resources
document.addEventListener('visibilitychange', async () => {
    if (window.qrScanner) {
        if (document.hidden) {
            // Page is hidden, stop scanner to save resources
            await window.qrScanner.stopScanner();
        } else if (!window.qrScanner.isScanning && !window.qrScanner.resultElement.classList.contains('hidden') === false) {
            // Page is visible and no result is shown, restart scanner
            await window.qrScanner.startScanner();
        }
    }
});

// Handle beforeunload to cleanup resources
window.addEventListener('beforeunload', async () => {
    if (window.qrScanner) {
        await window.qrScanner.destroy();
    }
});