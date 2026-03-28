import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const EditEvent = () => {
    const { id } = useParams(); // Το ID του event από το URL
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({ title: '', description: '', location: '', dateTime: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Φόρτωση των δεδομένων του event για να γεμίσουν τα πεδία
        axios.get(`/api/events/${id}`)
            .then(res => {
                const event = res.data;
                // Μετατροπή ημερομηνίας σε format: YYYY-MM-DDTHH:mm
                const formattedDate = event.dateTime ? event.dateTime.substring(0, 16) : '';

                setFormData({
                    title: event.title,
                    description: event.description,
                    location: event.location,
                    dateTime: formattedDate
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Σφάλμα κατά τη φόρτωση:", err);
                alert("Δεν ήταν δυνατή η φόρτωση της εκδήλωσης.");
                navigate('/profile');
            });
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Στέλνουμε PUT request με τα νέα στοιχεία
            // Το Backend θα ελέγξει αν είμαστε ο organizer μέσω του JWT
            await axios.put(`/api/events/${id}`, formData);
            alert("Η εκδήλωση ενημερώθηκε επιτυχώς!");
            navigate('/profile');
        } catch (err) {
            console.error("Σφάλμα κατά την ενημέρωση:", err);
            alert("Αποτυχία ενημέρωσης. Βεβαιωθείτε ότι είστε ο διοργανωτής.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Φόρτωση δεδομένων...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Επεξεργασία Εκδήλωσης</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>

                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Τίτλος</label>
                <input
                    type="text"
                    value={formData.title}
                    required
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                />

                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Περιγραφή</label>
                <textarea
                    value={formData.description}
                    rows="5"
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                />

                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Τοποθεσία</label>
                <input
                    type="text"
                    value={formData.location}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                />

                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Ημερομηνία & Ώρα</label>
                <input
                    type="datetime-local"
                    value={formData.dateTime}
                    required
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    onChange={e => setFormData({...formData, dateTime: e.target.value})}
                />

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{ flex: 2, padding: '15px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {saving ? "Αποθήκευση..." : "Ενημέρωση Εκδήλωσης"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        style={{ flex: 1, padding: '15px', background: '#bdc3c7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Ακύρωση
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditEvent;