if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    // They're using a mobile device
    mobileDevicePopup = document.getElementById('mobile-device-popup');
    mobileDevicePopup.classList.remove('popup-hidden');
    mobileDevicePopup.innerHTML = '<div id="mobile-device-message">This game requires the use of a mouse or trackpad. If you continue on a touch screen device, it may not work properly.</div><div class="popup-button" id="popup-mobile-device-button" onclick="closeMobileDevicePopup()">Continue Anyway</div>';
    mainCanvas.classList.remove('canvas-active');
    drawingCanvas.canvasActive = false;
}

function closeMobileDevicePopup() {
    document.getElementById('mobile-device-popup').classList.add('popup-hidden');
    mainCanvas.classList.add('canvas-active');
    drawingCanvas.canvasActive = true;
}