import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReviewForm from './ReviewForm';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [eventRes, statsRes] = await Promise.all([
                axios.get(`/api/events/${id}`),
                axios.get(`/api/events/${id}/stats`)
            ]);
            setEvent(eventRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error("Σφάλμα κατά τη φόρτωση των δεδομένων:", err);
        } finally {
            setLoading(false);
        }
    };

    const refreshStats = () => {
        axios.get(`/api/events/${id}/stats`)
            .then(res => setStats(res.data))
            .catch(err => console.error("Σφάλμα κατά την ανανέωση των στατιστικών:", err));
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Φόρτωση εκδήλωσης...</div>;
    if (!event) return <div style={{ padding: '40px', textAlign: 'center' }}>Η εκδήλωση δεν βρέθηκε.</div>;

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
            <Link to="/" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', marginBottom: '20px' }}>
                ← Επιστροφή στην Αρχική
            </Link>

            {/* Μεγάλη Εικόνα Banner */}
            <div style={{ width: '100%', marginBottom: '30px' }}>
                <img
                    src={event.imageUrl ? `http://localhost:8080/uploads/${event.imageUrl}` : 'https://via.placeholder.com/1100x450?text=EventHub'}
                    alt={event.title}
                    style={{
                        width: '100%',
                        maxHeight: '450px',
                        objectFit: 'cover',
                        borderRadius: '20px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

                <div style={{ flex: '2', minWidth: '350px' }}>
                    <h1 style={{ fontSize: '2.8rem', color: '#2c3e50', margin: '0 0 10px 0' }}>{event.title}</h1>
                    <div style={{ fontSize: '1.2rem', color: '#7f8c8d', marginBottom: '20px' }}>
                        <span style={{ marginRight: '20px' }}>📍 {event.location}</span>
                        <span>📅 {new Date(event.dateTime).toLocaleString('el-GR')}</span>
                    </div>

                    <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ borderBottom: '2px solid #3498db', display: 'inline-block', paddingBottom: '5px' }}>Περιγραφή</h3>
                        <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>
                            {event.description}
                        </p>
                    </div>

                    <ReviewForm eventId={id} onReviewSubmitted={refreshStats} />
                </div>

                <div style={{ flex: '1', minWidth: '300px' }}>
                    <div style={{ background: '#2c3e50', color: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', position: 'sticky', top: '20px' }}>
                        <h3 style={{ marginTop: 0 }}>Βαθμολογία Κοινού</h3>

                        {stats && stats.totalReviews > 0 ? (
                            <>
                                <div style={{ fontSize: '4rem', color: '#f1c40f', fontWeight: 'bold', lineHeight: '1' }}>
                                    {stats.averageOverall.toFixed(1)}
                                </div>
                                <p style={{ color: '#bdc3c7', marginBottom: '20px' }}>από {stats.totalReviews} αξιολογήσεις</p>

                                <div style={{ textAlign: 'left', fontSize: '0.9rem', borderTop: '1px solid #3e4f5f', paddingTop: '15px' }}>
                                    <p>🏗️ Οργάνωση: <strong>{stats.averageOrganization.toFixed(1)} / 5</strong></p>
                                    <p>📖 Περιεχόμενο: <strong>{stats.averageContent.toFixed(1)} / 5</strong></p>
                                </div>
                            </>
                        ) : (
                            <p style={{ color: '#bdc3c7' }}>Δεν υπάρχουν ακόμη κριτικές.</p>
                        )}

                        <button style={{
                            width: '100%',
                            marginTop: '25px',
                            padding: '15px',
                            background: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}>
                            Join This Event
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;