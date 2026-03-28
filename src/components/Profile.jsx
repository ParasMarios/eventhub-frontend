import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const iconButtonStyle = {
        padding: '8px 12px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        border: 'none',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '42px',
        minWidth: '42px',
        transition: 'background 0.2s',
        marginRight: '5px'
    };

    const fetchMyEvents = () => {
        if (user) {
            axios.get(`/api/events/user/${user.userId}`)
                .then(res => {
                    setMyEvents(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Σφάλμα κατά τη φόρτωση:", err);
                    setLoading(false);
                });
        }
    };

    useEffect(() => {
        fetchMyEvents();
    }, [user]);

    // Λειτουργία Διαγραφής
    const handleDelete = async (eventId, eventTitle) => {
        const confirmDelete = window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε την εκδήλωση "${eventTitle}"; Αυτή η ενέργεια δεν αναιρείται.`);

        if (confirmDelete) {
            try {
                await axios.delete(`/api/events/${eventId}`);

                setMyEvents(myEvents.filter(event => event.id !== eventId));
                alert("Η εκδήλωση διαγράφηκε!");
            } catch (err) {
                console.error("Σφάλμα κατά τη διαγραφή:", err);
                alert("Κάτι πήγε στραβά. Ίσως δεν είστε ο ιδιοκτήτης;");
            }
        }
    };

    if (!user) return <div style={{ textAlign: 'center', padding: '50px' }}>Παρακαλώ συνδεθείτε...</div>;
    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Φόρτωση...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: 0, color: '#2c3e50' }}>Το Προφίλ μου</h2>
                <p style={{ color: '#7f8c8d' }}>Username: <strong>{user.username}</strong></p>
            </div>

            <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>Οι Εκδηλώσεις μου ({myEvents.length})</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {myEvents.length > 0 ? (
                    myEvents.map(event => (
                        <div key={event.id} style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                            <img
                                src={event.imageUrl ? `http://localhost:8080/uploads/${event.imageUrl}` : 'https://via.placeholder.com/150'}
                                alt={event.title}
                                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                            />
                            <h4 style={{ margin: '0 0 10px 0' }}>{event.title}</h4>

                            {/* Κουμπιά Ενεργειών - Διατήρηση του Style */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                <button
                                    onClick={() => navigate(`/event/${event.id}`)}
                                    style={{ ...iconButtonStyle, background: '#27ae60' }}
                                    title="Προβολή"
                                >
                                    👁️
                                </button>

                                <button
                                    onClick={() => navigate(`/edit-event/${event.id}`)}
                                    style={{ ...iconButtonStyle, background: '#f39c12' }}
                                    title="Επεξεργασία"
                                >
                                    ✏️
                                </button>

                                <button
                                    onClick={() => handleDelete(event.id, event.title)}
                                    style={{ ...iconButtonStyle, background: '#e74c3c' }}
                                    title="Διαγραφή"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ color: '#7f8c8d' }}>Δεν έχετε δημιουργήσει ακόμα κάποια εκδήλωση.</p>
                )}
            </div>
        </div>
    );
};

export default Profile;