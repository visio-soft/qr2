# QR Code Scanner

Real-time QR code scanner application designed for mobile Chrome browsers with live camera streaming and continuous QR detection.

## Features

- 📱 **Mobile-first design** - Optimized for mobile Chrome browsers
- 📷 **Live camera streaming** - Real-time camera feed for QR detection
- ⚡ **Instant detection** - Automatically stops scanning when QR code is detected
- 🔄 **Continuous scanning** - Option to scan again after detection
- 🎯 **Auto camera selection** - Prefers back camera for better QR scanning
- 📱 **PWA support** - Can be installed as a web app on mobile devices
- 🎨 **Responsive design** - Works on various screen sizes

## Technology

This application uses the [html5-qrcode](https://github.com/mebjas/html5-qrcode) library for QR code detection and camera handling.

## Usage

1. Open the application in a mobile Chrome browser
2. Grant camera permissions when prompted
3. Point the camera at a QR code
4. The scanner will automatically detect and display the QR code content
5. Scanning stops automatically after detection
6. Use the "Scan Again" button to continue scanning

## Local Development

### Using Python (recommended)
```bash
python3 server.py
```
Then visit `http://localhost:8000`

### Using Node.js
```bash
npx http-server -c-1
```

### Using any other web server
Serve the files from the repository root directory.

## Important Notes

- **HTTPS Required**: Camera access requires HTTPS in production
- **Mobile Chrome**: Optimized for mobile Chrome browsers
- **Permissions**: Camera permissions are required for functionality
- **Back Camera**: Automatically selects back camera when available for better QR scanning

## Browser Compatibility

- ✅ Chrome (mobile and desktop)
- ✅ Firefox (mobile and desktop)
- ✅ Safari (mobile and desktop)
- ✅ Edge (mobile and desktop)

## File Structure

```
├── index.html          # Main application HTML
├── styles.css          # CSS styles for mobile-responsive design
├── script.js           # JavaScript application logic
├── manifest.json       # PWA manifest for mobile installation
├── server.py          # Simple development server
└── README.md          # This file
```