import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const EventList = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        axios.get('/api/events')
            .then(res => setEvents(res.data))
            .catch(err => console.error("Σφάλμα κατά τη λήψη των events:", err));
    }, []);

    return (
        <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '30px', borderBottom: '2px solid #3498db', display: 'inline-block', paddingBottom: '5px' }}>
                Ανακαλύψτε Εκδηλώσεις
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {events.length === 0 ? (
                    <p>Δεν υπάρχουν διαθέσιμες εκδηλώσεις αυτή τη στιγμή.</p>
                ) : (
                    events.map(event => (
                        <div key={event.id} style={{ background: 'white', border: '1px solid #eee', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{event.title}</h3>
                            <p style={{ color: '#7f8c8d', marginBottom: '5px' }}>📍 {event.location}</p>
                            <p style={{ color: '#34495e', fontWeight: '500' }}>📅 {new Date(event.dateTime).toLocaleDateString('el-GR')}</p>
                            <Link to={`/event/${event.id}`} style={{ display: 'inline-block', marginTop: '15px', color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>
                                Περισσότερα →
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EventList;