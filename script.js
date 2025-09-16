class QRCodeScanner {
    constructor() {
        this.html5QrCode = null;
        this.isScanning = false;
        this.currentCameraId = null;
        this.availableCameras = [];
        this.currentCameraIndex = 0;
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
        this.cameraControlsElement = document.getElementById('camera-controls');
        this.switchCameraButton = document.getElementById('switch-camera');
    }
    
    bindEvents() {
        this.scanAgainButton.addEventListener('click', () => {
            this.resetScanner();
        });
        
        this.switchCameraButton.addEventListener('click', () => {
            this.switchCamera();
        });
    }
    
    async startScanner() {
        try {
            this.html5QrCode = new Html5Qrcode("reader");
            
            // Get camera devices
            this.availableCameras = await Html5Qrcode.getCameras();
            
            if (this.availableCameras && this.availableCameras.length) {
                // Prefer back camera for mobile devices (set as default)
                this.currentCameraIndex = this.getPreferredCameraIndex();
                this.currentCameraId = this.availableCameras[this.currentCameraIndex].id;
                
                await this.html5QrCode.start(
                    this.currentCameraId,
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
                
                // Show camera controls if multiple cameras are available
                if (this.availableCameras.length > 1) {
                    this.showCameraControls();
                }
            } else {
                this.showError('No cameras found on this device.');
            }
        } catch (err) {
            console.error('Error starting scanner:', err);
            this.showError(`Error starting camera: ${err.message || err}`);
        }
    }
    
    getPreferredCameraIndex() {
        // Try to find back camera first (better for QR scanning)
        const backCameraIndex = this.availableCameras.findIndex(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
        );
        
        return backCameraIndex !== -1 ? backCameraIndex : 0;
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
    
    async switchCamera() {
        if (!this.availableCameras || this.availableCameras.length <= 1) {
            return; // No cameras to switch to
        }
        
        try {
            // Stop current scanner
            await this.stopScanner();
            
            // Switch to next camera
            this.currentCameraIndex = (this.currentCameraIndex + 1) % this.availableCameras.length;
            this.currentCameraId = this.availableCameras[this.currentCameraIndex].id;
            
            // Start scanner with new camera
            await this.html5QrCode.start(
                this.currentCameraId,
                this.config,
                (decodedText, decodedResult) => {
                    this.onScanSuccess(decodedText, decodedResult);
                },
                (errorMessage) => {
                    console.log(`Scan failed: ${errorMessage}`);
                }
            );
            
            this.isScanning = true;
            console.log(`Switched to camera: ${this.availableCameras[this.currentCameraIndex].label}`);
        } catch (err) {
            console.error('Error switching camera:', err);
            this.showError(`Error switching camera: ${err.message || err}`);
        }
    }
    
    showCameraControls() {
        this.cameraControlsElement.classList.remove('hidden');
        // Position controls relative to the reader element
        this.readerElement.style.position = 'relative';
    }
    
    hideCameraControls() {
        this.cameraControlsElement.classList.add('hidden');
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
        this.hideCameraControls();
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
        
        // Restart scanning with the same camera
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