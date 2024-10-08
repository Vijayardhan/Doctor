from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_pymongo import PyMongo
import os
import qrcode  # Importing the qrcode library

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/Dispenser'
mongo = PyMongo(app)

# Create a folder for saving QR codes if it doesn't exist
folder_name = "qrcimages"
if not os.path.exists(folder_name):
    os.makedirs(folder_name)

# Route for patient details page
@app.route('/')
def index():
    return render_template('patient_details.html')

# Route to search for patient in the database
@app.route('/search_patient', methods=['GET', 'POST'])
def search_patient():
    if request.method == 'POST':
        patient_id = request.form['patient_id']
        patient = mongo.db.Patient_details.find_one({'patient_id': patient_id})

        if patient:
            return render_template('patient_details.html', patient=patient)
        else:
            return render_template('patient_details.html', error='Patient ID does not exist.')

    return render_template('patient_details.html')

# Route for tablet selection page
@app.route('/tablet')
def tablet():
    return render_template('tablet.html')

# Route to handle tablet data confirmation from the client-side
@app.route('/confirm_tablet', methods=['POST'])
def confirm_tablet():
    tablet_name = request.json.get('tablet_name')
    tablet_mg = request.json.get('tablet_mg')
    tablet_duration = request.json.get('tablet_duration')
    tablet_quantity = request.json.get('tablet_quantity')
    
    mongo.db.Tablet_Details.insert_one({
        'tablet_name': tablet_name,
        'tablet_mg': tablet_mg,
        'tablet_duration': tablet_duration,
        'tablet_quantity': tablet_quantity
    })
    
    return jsonify({'success': True, 'message': 'Tablet confirmed successfully!'})

# Route to handle saving the QR code data
@app.route('/save_qr_code', methods=['POST'])
def save_qr_code():
    qr_code_data = request.json.get('qr_code_data')

    # You can process the QR code data here as needed
    # For example, you might want to save it to the database or handle it in another way.

    return jsonify({'success': True, 'message': 'QR code data saved successfully!'})

# Route to display QR code and options
@app.route('/qrcode')
def qrcode_page():
    qr_data = session.get('qr_data', 'No data available')
    return render_template('qrcode_page.html', qr_data=qr_data)

# Route to handle QR code generation data
@app.route('/generate_qr', methods=['POST'])
def generate_qr():
    qr_data = request.json.get('qr_data')

    # Store QR code data in session
    session['qr_data'] = qr_data

    # Determine the next index for the QR code
    existing_files = os.listdir(folder_name)
    existing_qr_codes = [f for f in existing_files if f.startswith("qrc") and f.endswith(".jpg")]

    # Extract indices and determine the next index
    indices = [int(f[3:-4]) for f in existing_qr_codes]  # Extract index numbers from filenames
    next_index = max(indices, default=0) + 1  # Increment to get the next index

    # Generate the QR code
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L,
                       box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)

    # Create an image from the QR Code instance
    img = qr.make_image(fill_color="black", back_color="white")

    # Save the image
    file_name = f"qrc{next_index}.jpg"
    img_path = os.path.join(folder_name, file_name)
    img.save(img_path)

    print(f"QR code saved as: {img_path}")  # Debugging line

    return jsonify({'success': True, 'message': 'QR code data saved successfully!', 'file_name': file_name})


if __name__ == '__main__':
    app.run(debug=True, port=5001)
