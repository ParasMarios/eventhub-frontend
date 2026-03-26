import React, {useContext, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const CreateEvent = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({ title: '', description: '', location: '', dateTime: '' });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.userId) {
            alert("Σφάλμα: Δεν βρέθηκε ID χρήστη. Παρακαλώ συνδεθείτε ξανά.");
            return;
        }

        setLoading(true);
        const data = new FormData();

        // Βεβαιωνόμαστε ότι το id μπαίνει σωστά μέσα στο organizer
        const eventDto = {
            title: formData.title,
            description: formData.description,
            location: formData.location,
            dateTime: formData.dateTime,
            organizer: { id: parseInt(user.userId) } // Μετατροπή σε αριθμό για σιγουριά
        };

        data.append('event', JSON.stringify(eventDto));
        data.append('file', file);

        try {
            await axios.post('/api/events', data);
            alert("Επιτυχής δημιουργία!");
            navigate('/');
        } catch (err) {
            console.error("Error details:", err.response?.data);
            alert("Σφάλμα κατά τη δημιουργία.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Πρόσβαση Μόνο για Μέλη</h2>
                <p>Παρακαλώ συνδεθείτε για να δημιουργήσετε μια νέα εκδήλωση.</p>
                <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', cursor: 'pointer' }}>Προς τη Σύνδεση</button>
            </div>
        );
    }

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