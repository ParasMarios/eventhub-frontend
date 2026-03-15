import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
    const [formData, setFormData] = useState({ title: '', description: '', location: '', dateTime: '' });
    const [file, setFile] = useState(null); // Νέο state για το αρχείο
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Έλεγχος αν έχει επιλεγεί αρχείο
        if (!file) {
            alert("Παρακαλώ επιλέξτε μια φωτογραφία!");
            return;
        }

        setLoading(true);

        // Δημιουργία FormData για την αποστολή multipart/form-data
        const data = new FormData();

        // Το αντικείμενο του event (DTO)
        const eventDto = {
            ...formData,
            organizer: { id: 1 } // Hardcoded για τώρα
        };

        // Προσθήκη των δεδομένων στο FormData
        data.append('event', JSON.stringify(eventDto));
        data.append('file', file);

        try {
            await axios.post('/api/events', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert("Επιτυχής δημιουργία εκδήλωσης με φωτογραφία!");
            navigate('/');
        } catch (err) {
            console.error("Σφάλμα κατά τη δημιουργία:", err);
            alert("Κάτι πήγε στραβά. Ελέγξτε αν το Backend τρέχει σωστά.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Δημιουργία Νέου Event</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
                <input
                    type="text"
                    placeholder="Τίτλος Εκδήλωσης"
                    required
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                />

                <textarea
                    placeholder="Περιγραφή"
                    rows="5"
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                />

                <input
                    type="text"
                    placeholder="Τοποθεσία"
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                />

                <input
                    type="datetime-local"
                    required
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    onChange={e => setFormData({...formData, dateTime: e.target.value})}
                />

                {/* Νέο Input για την Εικόνα - Διατηρώντας το απλό στυλ */}
                <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>Φωτογραφία Εκδήλωσης:</label>
                    <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={e => setFile(e.target.files[0])}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                >
                    {loading ? "Γίνεται αποστολή..." : "Δημοσίευση Εκδήλωσης"}
                </button>
            </form>
        </div>
    );
};

export default CreateEvent;