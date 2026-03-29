import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const EventList = () => {
    const [events, setEvents] = useState([]);

    const [searchTitle, setSearchTitle] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [searchDate, setSearchDate] = useState('');

    const handleSearch = (e) => {
     e.preventDefault();
     fetchEvents();
    };

    const fetchEvents = () => {
        axios.get('/api/events', {
            params: {
                title: searchTitle || null,
                location: searchLocation || null,
                date: searchDate || null
            }
        })
            .then(response => {
                setEvents(response.data);
            })
            .catch(error => {
                console.error("Error fetching events:", error);
            });
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchEvents();
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTitle, searchLocation, searchDate]);

    const clearFilters = () => {
        setSearchTitle('');
        setSearchLocation('');
        setSearchDate('');
    };

    const inputStyle = {
        padding: '12px',
        width: '220px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        outline: 'none',
        fontSize: '1rem',
        fontFamily: 'inherit'
    };

    return (
        <div>
            {/* --- ΦΟΡΜΑ ΑΝΑΖΗΤΗΣΗΣ --- */}
            <form
                onSubmit={handleSearch}
                style={{
                    marginBottom: '30px',
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap', // Αν η οθόνη είναι μικρή, θα πάνε από κάτω
                    alignItems: 'center'
                }}
            >
                <input
                    type="text"
                    placeholder="Τίτλος (π.χ. Rock Live)..."
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    style={inputStyle}
                />

                <input
                    type="text"
                    placeholder="Τοποθεσία (π.χ. Loutraki)..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    style={inputStyle}
                />

                <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    style={{ ...inputStyle, width: '160px', color: searchDate ? '#2c3e50' : '#7f8c8d' }}
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
                        fontWeight: 'bold'
                    }}
                >
                    Αναζήτηση
                </button>

                {/* Κουμπί Καθαρισμού Φίλτρων */}
                <button
                    type="button"
                    onClick={clearFilters}
                    style={{
                        padding: '12px 20px',
                        background: '#ecf0f1',
                        color: '#7f8c8d',
                        border: '1px solid #bdc3c7',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#e0e6ed'}
                    onMouseOut={(e) => e.target.style.background = '#ecf0f1'}
                >
                    ✕ Καθαρισμός
                </button>
            </form>

            {/* --- ΛΙΣΤΑ EVENTS (GRID) --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                {events.length > 0 ? (
                    events.map(event => (
                        <div key={event.id} style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '15px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                            border: '1px solid #eee',
                            display: 'flex',
                            flexDirection: 'column' // Για να σπρώξουμε το link στο τέλος
                        }}>
                            <img
                                src={event.imageUrl ? `http://localhost:8080/uploads/${event.imageUrl}` : 'https://via.placeholder.com/300x180?text=No+Image'}
                                alt={event.title}
                                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px' }}
                            />

                            <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#2c3e50' }}>{event.title}</h3>

                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ color: '#7f8c8d', margin: '0 0 5px 0' }}>
                                    📍 {event.location}
                                </p>
                                <p style={{ color: '#7f8c8d', margin: '0' }}>
                                    📅 {new Date(event.dateTime).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </p>
                            </div>

                            {/* Χρησιμοποιούμε margin-top: auto για να πάει το link πάντα κάτω κάτω στην κάρτα */}
                            <Link to={`/event/${event.id}`} style={{
                                color: '#3498db',
                                fontWeight: 'bold',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                marginTop: 'auto',
                                display: 'inline-block'
                            }}>
                                Λεπτομέρειες →
                            </Link>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0' }}>
                        <p style={{ color: '#7f8c8d', fontSize: '1.2rem' }}>Δεν βρέθηκαν εκδηλώσεις με αυτά τα κριτήρια. 🕵️‍♂️</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventList;