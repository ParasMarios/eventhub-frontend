import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [locationSearch, setLocationSearch] = useState('');

    const handleSearch = (e) => {
        if (e) e.preventDefault();

        axios.get(`/api/events/filter?location=${locationSearch}`)
            .then(res => setEvents(res.data))
            .catch(err => console.error("Σφάλμα στην αναζήτηση:", err));
    };

    useEffect(() => {
        // Αρχικό φόρτωμα όλων των events
        axios.get('/api/events')
            .then(res => setEvents(res.data));
    }, []);

    return (
        <div>
            {/* Χρησιμοποιούμε form για να λειτουργεί το Enter αυτόματα */}
            <form
                onSubmit={handleSearch}
                style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}
            >
                <input
                    type="text"
                    placeholder="Αναζήτηση ανά τοποθεσία (π.χ. Loutraki)..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    style={{
                        padding: '12px',
                        width: '350px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        outline: 'none',
                        fontSize: '1rem'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '12px 25px',
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: '0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#2980b9'}
                    onMouseOut={(e) => e.target.style.background = '#3498db'}
                >
                    Αναζήτηση
                </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                {events.length > 0 ? (
                    events.map(event => (
                        <div key={event.id} style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '15px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                            border: '1px solid #eee'
                        }}>
                            <h3 style={{ marginTop: 0, color: '#2c3e50' }}>{event.title}</h3>
                            <p style={{ color: '#7f8c8d' }}>📍 {event.location}</p>
                            <Link to={`/event/${event.id}`} style={{
                                color: '#3498db',
                                fontWeight: 'bold',
                                textDecoration: 'none',
                                fontSize: '0.9rem'
                            }}>
                                Λεπτομέρειες →
                            </Link>
                        </div>
                    ))
                ) : (
                    <p style={{ color: '#7f8c8d' }}>Δεν βρέθηκαν εκδηλώσεις για αυτή την τοποθεσία.</p>
                )}
            </div>
        </div>
    );
};

export default EventList;