import React, { useState } from 'react';
import axios from 'axios';

const MediaUpload = ({ eventId, onUploadSuccess }) => {
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    // Όταν ο χρήστης επιλέγει αρχεία
    const handleFileChange = (e) => {
        setSelectedFiles(e.target.files);
        setMessage(''); // Καθαρίζουμε τυχόν παλιά μηνύματα
    };

    // Όταν πατάει το κουμπί "Ανέβασμα"
    const handleUpload = async (e) => {
        e.preventDefault();

        if (!selectedFiles || selectedFiles.length === 0) {
            setMessage('⚠️ Παρακαλώ επιλέξτε τουλάχιστον μία φωτογραφία.');
            return;
        }

        // Φτιάχνουμε το "πακέτο" που θα στείλουμε
        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('files', selectedFiles[i]); // Το 'files' πρέπει να ταιριάζει με το @RequestParam στην Java
        }

        setUploading(true);
        setMessage('');

        try {
            // Στέλνουμε το request στο νέο endpoint που φτιάξαμε
            const response = await axios.post(`/api/events/${eventId}/gallery`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage('✅ Οι φωτογραφίες ανέβηκαν με επιτυχία!');
            setSelectedFiles(null); // Μηδενίζουμε την επιλογή

            // Αν το parent component (π.χ. EventDetails) μας έχει δώσει συνάρτηση, την καλούμε για να κάνει refresh τη σελίδα
            if (onUploadSuccess) {
                onUploadSuccess(response.data);
            }

            // Καθαρίζουμε το input (προαιρετικό)
            document.getElementById('gallery-upload-input').value = '';

        } catch (error) {
            console.error('Σφάλμα κατά το ανέβασμα:', error);
            setMessage('❌ Υπήρξε πρόβλημα με το ανέβασμα. Προσπαθήστε ξανά.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{
            marginTop: '30px',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '10px',
            border: '2px dashed #bdc3c7',
            textAlign: 'center'
        }}>
            <h3 style={{ color: '#2c3e50', marginTop: 0 }}>📸 Προσθήκη Υλικού Προβολής</h3>
            <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Ανεβάστε φωτογραφίες από την εκδήλωση!</p>

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>

                {/* Το input που δέχεται πολλά αρχεία (multiple) */}
                <input
                    id="gallery-upload-input"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ padding: '10px' }}
                />

                <button
                    type="submit"
                    disabled={uploading}
                    style={{
                        padding: '10px 20px',
                        background: uploading ? '#95a5a6' : '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        transition: '0.3s'
                    }}
                >
                    {uploading ? 'Ανέβασμα...' : 'Ανέβασμα Φωτογραφιών'}
                </button>
            </form>

            {/* Εμφάνιση μηνύματος επιτυχίας ή σφάλματος */}
            {message && (
                <p style={{ marginTop: '15px', fontWeight: 'bold', color: message.includes('✅') ? '#27ae60' : '#e74c3c' }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default MediaUpload;