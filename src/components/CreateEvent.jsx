import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
    const [formData, setFormData] = useState({ title: '', description: '', location: '', dateTime: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Σημείωση: Χρησιμοποιούμε hardcoded id: 1 για τον organizer μέχρι να φτιάξουμε το Login
            await axios.post('/api/events', { ...formData, organizer: { id: 1 } });
            alert("Επιτυχής δημιουργία!");
            navigate('/');
        } catch (err) {
            console.error("Σφάλμα κατά τη δημιουργία:", err);
            alert("Κάτι πήγε στραβά. Βεβαιωθείτε ότι υπάρχει χρήστης με ID 1 στη βάση.");
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Δημιουργία Νέου Event</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
                <input type="text" placeholder="Τίτλος Εκδήλωσης" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                       onChange={e => setFormData({...formData, title: e.target.value})} />

                <textarea placeholder="Περιγραφή" rows="5" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                          onChange={e => setFormData({...formData, description: e.target.value})} />

                <input type="text" placeholder="Τοποθεσία" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                       onChange={e => setFormData({...formData, location: e.target.value})} />

                <input type="datetime-local" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                       onChange={e => setFormData({...formData, dateTime: e.target.value})} />

                <button type="submit" style={{ padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Δημοσίευση Εκδήλωσης
                </button>
            </form>
        </div>
    );
};

export default CreateEvent;