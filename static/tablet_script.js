function confirmTablet() {
    const tabletName = document.getElementById('tablet-name').value;
    const tabletMg = document.getElementById('tablet-mg').value;
    const tabletDuration = document.getElementById('tablet-duration').value;
    const tabletQuantity = document.getElementById('tablet-quantity').value;

    if (tabletName && tabletMg && tabletDuration && tabletQuantity) {
        const detailsTable = document.querySelector('#tablet-details tbody');
        const rowCount = detailsTable.rows.length + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rowCount}</td>
            <td>${tabletName}</td>
            <td>${tabletMg}</td>
            <td>${tabletDuration}</td>
            <td>${tabletQuantity}</td>
        `;
        detailsTable.appendChild(row);
        document.getElementById('tabletModal').style.display = 'none';
        document.getElementById('tabletForm').reset();
        document.getElementById('generateBtn').style.display = 'block';
        storeTabletDetails(); // Store tablet details in local storage
    } else {
        alert('Please fill in all fields');
    }
}






function generateQRCode() {
    storeTabletsInLocalStorage(); // Ensure data is stored before generating QR code

    setTimeout(() => {
        const storedTablets = JSON.parse(localStorage.getItem('tablets')) || [];

        if (storedTablets.length === 0) {
            console.error('No tablets found in local storage.');
            return;
        }

        let qrData = '';
        storedTablets.forEach((tablet, index) => {
            qrData += `S No: ${index + 1}\n`;
            qrData += `Tablet Name: ${tablet.name}\n`;
            qrData += `mg: ${tablet.mg}\n`;
            qrData += `Duration: ${tablet.duration} days\n`;
            qrData += `Quantity: ${tablet.quantity}\n\n`;
        });

        console.log('QR Code Data:', qrData);

        const existingQR = document.getElementById('qrcode');
        const existingButtons = document.getElementById('actionButtons');
        if (existingQR) existingQR.remove();
        if (existingButtons) existingButtons.remove();

        const container = document.createElement('div');
        container.id = 'qrContainer';
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.backgroundColor = '#ffffff';
        container.style.padding = '20px';
        container.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        container.style.zIndex = '1000';

        const qrElement = document.createElement('canvas');
        qrElement.id = 'qrcode';
        qrElement.style.display = 'block';
        container.appendChild(qrElement);

        QRCode.toCanvas(qrElement, qrData, function (error) {
            if (error) {
                console.error('QR Code Generation Error:', error);
            } else {
                console.log('QR code generated!');

                // Convert canvas to data URL
                const qrCodeImage = qrElement.toDataURL();

                // Send the QR code image to the server to save it
                saveQRCode(qrCodeImage);

                const actionButtons = document.createElement('div');
                actionButtons.id = 'actionButtons';
                actionButtons.style.marginTop = '20px';

                const sendButton = document.createElement('button');
                sendButton.textContent = 'Send to WhatsApp';
                sendButton.onclick = sendToWhatsApp;

                const printButton = document.createElement('button');
                printButton.textContent = 'Printout';
                printButton.onclick = printQRCode;

                const nextButton = document.createElement('button');
                nextButton.textContent = 'Next';
                nextButton.onclick = redirectToPatientDetails;

                actionButtons.appendChild(sendButton);
                actionButtons.appendChild(printButton);
                actionButtons.appendChild(nextButton);

                container.appendChild(actionButtons);
                document.body.appendChild(container);
            }
        });
    }, 1000); // 1-second delay
}

// Function to save the QR code image to the server
function saveQRCode() {
    const qrCodeData = '...'; // Your QR code data to be sent
    fetch('http://127.0.0.1:5001/save_qr_code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qr_code_data: qrCodeData })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('QR Code saved successfully:', data.message);
        } else {
            console.error('Error saving QR Code:', data.message);
        }
    })
    .catch(error => {
        console.error('Error saving QR Code:', error);
    });
}








function sendToWhatsApp() {
    const tablets = JSON.parse(localStorage.getItem('tablets')) || [];
    let message = 'Tablet Details:\n\n';

    tablets.forEach(tablet => {
        message += `S No: ${tablet.serial}\nTablet Name: ${tablet.name}\nmg: ${tablet.mg}\nDuration: ${tablet.duration} days\nQuantity: ${tablet.quantity}\n\n`;
    });

    // Encode the message for URL
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    // Open the URL in a new tab
    window.open(url, '_blank');
}

function printQRCode() {
    const qrElement = document.getElementById('qrcode');
    const printWindow = window.open('', '', 'height=500,width=800');

    // Get the image source
    const qrImage = document.getElementById('qrImage').src;

    printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
    // Include the image in the print window
    printWindow.document.write('<img src="' + qrImage + '" alt="QR Code" style="width:100%;">');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close(); // Close the print window after printing
}

// function nextPage() {
//     window.location.href = 'patient_details.html';
// }


function selectTablet(tabletName) {
    selectedTablet = tabletName;
    document.getElementById('tablet-name').value = tabletName;

    // Show modal in the center
    document.getElementById('tabletModal').style.display = 'flex'; // Use 'flex' to center content
}


function addTabletToLocalStorage(tablet) {
    const tablets = JSON.parse(localStorage.getItem('tablets')) || [];
    tablets.push(tablet);
    localStorage.setItem('tablets', JSON.stringify(tablets));
}


function storeTabletsInLocalStorage() {
    const tablets = [];
    const rows = document.querySelectorAll('#tablet-details tbody tr');

    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        tablets.push({
            serial: cells[0].innerText,
            name: cells[1].innerText,
            mg: cells[2].innerText,
            duration: cells[3].innerText,
            quantity: cells[4].innerText
        });
    });

    localStorage.setItem('tablets', JSON.stringify(tablets));
}

function redirectToPatientDetails() {
    window.location.href = '/';
}
