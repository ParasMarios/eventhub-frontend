import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [myEvents, setMyEvents] = useState([]);
    const [joinedEvents, setJoinedEvents] = useState([]);
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

    const fetchProfileData = async () => {
        if (user) {
            try {
                // Φόρτωση δικών μου events
                const myRes = await axios.get(`/api/events/user/${user.userId}`);
                setMyEvents(myRes.data);

                // Φόρτωση events που συμμετέχω
                const joinedRes = await axios.get(`/api/events/joined/${user.userId}`);
                setJoinedEvents(joinedRes.data);

                setLoading(false);
            } catch (err) {
                console.error("Σφάλμα κατά τη φόρτωση δεδομένων:", err);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [user]);

    // Συνάρτηση Διαγραφής Δικού μου Event
    const handleDelete = async (eventId, eventTitle) => {
        const confirmDelete = window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε την εκδήλωση "${eventTitle}";`);
        if (confirmDelete) {
            try {
                await axios.delete(`/api/events/${eventId}`);
                setMyEvents(myEvents.filter(event => event.id !== eventId));
                alert("Η εκδήλωση διαγράφηκε!");
            } catch (err) {
                console.error(err);
                alert("Σφάλμα διαγραφής.");
            }
        }
    };

    // ΝΕΑ Συνάρτηση: Ακύρωση Συμμετοχής (Unjoin)
    const handleLeaveEvent = async (eventId, eventTitle) => {
        const confirmLeave = window.confirm(`Είστε σίγουροι ότι θέλετε να ακυρώσετε τη συμμετοχή σας στην εκδήλωση "${eventTitle}";`);
        if (confirmLeave) {
            try {
                await axios.post(`/api/events/${eventId}/leave`);
                // Αφαιρούμε το event από τη λίστα άμεσα (για καλύτερο User Experience, χωρίς refresh)
                setJoinedEvents(joinedEvents.filter(event => event.id !== eventId));
                alert("Η συμμετοχή σας ακυρώθηκε επιτυχώς!");
            } catch (err) {
                console.error("Σφάλμα κατά την ακύρωση συμμετοχής:", err);
                alert("Υπήρξε πρόβλημα με την ακύρωση. Δοκιμάστε ξανά.");
            }
        }
    };

    if (!user) return <div style={{ textAlign: 'center', padding: '50px' }}>Παρακαλώ συνδεθείτε...</div>;
    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Φόρτωση...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            {/* Κάρτα Χρήστη */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '15px', marginBottom: '40px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                <h2 style={{ margin: 0, color: '#2c3e50' }}>👤 Το Προφίλ μου</h2>
            </div>

            {/* ΕΝΟΤΗΤΑ 1: ΟΙ ΕΚΔΗΛΩΣΕΙΣ ΜΟΥ */}
            <div style={{ marginBottom: '50px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                    Οι Εκδηλώσεις μου ({myEvents.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {myEvents.length > 0 ? (
                        myEvents.map(event => (
                            <div key={event.id} style={{
                                background: 'white',
                                padding: '15px 20px',
                                borderRadius: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                                border: '1px solid #eee'
                            }}>
                                <h4 style={{ margin: 0, color: '#34495e' }}>{event.title}</h4>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => navigate(`/event/${event.id}`)} style={{ ...iconButtonStyle, background: '#27ae60' }} title="Προβολή">👁️</button>
                                    <button onClick={() => navigate(`/edit-event/${event.id}`)} style={{ ...iconButtonStyle, background: '#f39c12' }} title="Επεξεργασία">✏️</button>
                                    <button onClick={() => handleDelete(event.id, event.title)} style={{ ...iconButtonStyle, background: '#e74c3c' }} title="Διαγραφή">🗑️</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>Δεν έχετε δημιουργήσει ακόμα κάποια εκδήλωση.</p>
                    )}
                </div>
            </div>

            {/* ΕΝΟΤΗΤΑ 2: ΘΑ ΠΑΡΕΥΡΕΘΩ ΣΕ */}
            <div>
                <h3 style={{ color: '#2c3e50', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                    Θα παρευρεθώ σε ({joinedEvents.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {joinedEvents.length > 0 ? (
                        joinedEvents.map(event => (
                            <div key={event.id} style={{
                                background: '#f8f9fa',
                                padding: '15px 20px',
                                borderRadius: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: '1px solid #e9ecef'
                            }}>
                                <h4 style={{ margin: 0, color: '#34495e' }}>{event.title}</h4>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {/* Κουμπί Προβολής */}
                                    <button onClick={() => navigate(`/event/${event.id}`)} style={{ ...iconButtonStyle, background: '#27ae60' }} title="Προβολή">👁️</button>

                                    {/* Κουμπί: Ακύρωση Συμμετοχής */}
                                    <button onClick={() => handleLeaveEvent(event.id, event.title)} style={{ ...iconButtonStyle, background: '#e74c3c' }} title="Ακύρωση Συμμετοχής">❌</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>Δεν έχετε δηλώσει συμμετοχή σε κάποια εκδήλωση ακόμα.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;