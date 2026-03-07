import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, statsRes] = await Promise.all([
                    axios.get(`/api/events/${id}`),
                    axios.get(`/api/events/${id}/stats`)
                ]);
                setEvent(eventRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Σφάλμα:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div>Φόρτωση...</div>;
    if (!event) return <div>Το event δεν βρέθηκε.</div>;

    return (
        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <Link to="/" style={{ color: '#3498db', textDecoration: 'none' }}>← Πίσω στην Αρχική</Link>
            <div style={{ display: 'flex', gap: '50px', marginTop: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: '2' }}>
                    <h1 style={{ fontSize: '2.8rem', color: '#2c3e50', margin: '0 0 20px 0' }}>{event.title}</h1>
                    <p style={{ fontSize: '1.2rem', color: '#e67e22', fontWeight: 'bold' }}>📍 {event.location}</p>
                    <p style={{ fontSize: '1.1rem' }}>📅 {new Date(event.dateTime).toLocaleString('el-GR')}</p>
                    <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />
                    <h3>Πληροφορίες Εκδήλωσης</h3>
                    <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.1rem' }}>{event.description}</p>
                </div>
                <div style={{ flex: '1', background: '#f8f9fa', padding: '30px', borderRadius: '15px', height: 'fit-content' }}>
                    <h3 style={{ marginTop: 0 }}>Στατιστικά Αξιολόγησης</h3>
                    {stats ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3.5rem', color: '#f1c40f', fontWeight: 'bold' }}>{stats.averageOverall.toFixed(1)}</div>
                            <p style={{ color: '#7f8c8d' }}>από {stats.totalReviews} κριτικές</p>
                            <div style={{ textAlign: 'left', marginTop: '20px' }}>
                                <p>🏗️ Οργάνωση: {stats.averageOrganization.toFixed(1)}/5</p>
                                <p>📖 Περιεχόμενο: {stats.averageContent.toFixed(1)}/5</p>
                            </div>
                        </div>
                    ) : <p>Δεν υπάρχουν ακόμα κριτικές.</p>}
                    <button style={{ width: '100%', marginTop: '25px', padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        Join Event
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;