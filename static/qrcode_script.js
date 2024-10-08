// Retrieve and display the QR code data from localStorage
document.addEventListener('DOMContentLoaded', function() {
    const qrData = localStorage.getItem('qrData');
    if (qrData) {
        const qrElement = document.getElementById('qrcode');
        new QRCode(qrElement, {
            text: qrData,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
});

function sendToWhatsApp() {
    const qrElement = document.getElementById('qrcode').querySelector('img');
    if (qrElement) {
        const qrData = qrElement.src;
        const message = encodeURIComponent(`Here is the QR Code: ${qrData}`);
        window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
    }
}

function printQRCode() {
    const qrElement = document.getElementById('qrcode').querySelector('img');
    if (qrElement) {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
        printWindow.document.write(`<img src="${qrElement.src}" style="width:100%"/>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }
}

function goToNextPage() {
    window.location.href = 'patient_details.html';
}
