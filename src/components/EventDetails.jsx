import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ReviewForm from './ReviewForm';
import MediaUpload from './MediaUpload';
import DOMPurify from 'dompurify';
import { MapContainer, Marker, TileLayer } from "react-leaflet";

const EventDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ averageOverall: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    const [showGallery, setShowGallery] = useState(false);

    const fetchData = async () => {
        try {
            const eventRes = await axios.get(`/api/events/${id}`);
            setEvent(eventRes.data);

            const reviewsRes = await axios.get(`/api/reviews/event/${id}`);
            setReviews(reviewsRes.data);

            const statsRes = await axios.get(`/api/events/${id}/stats`);
            setStats(statsRes.data);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleJoin = async () => {
        setJoining(true);
        try {
            await axios.post(`/api/events/${id}/join`);
            alert("Η συμμετοχή σας κατοχυρώθηκε!");
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Αποτυχία συμμετοχής. Ίσως είστε ήδη μέλος;");
        } finally {
            setJoining(false);
        }
    };

    const handleLeaveEvent = async () => {
        if (!window.confirm("Θέλετε σίγουρα να ακυρώσετε τη συμμετοχή σας;")) return;
        setJoining(true);
        try {
            await axios.post(`/api/events/${id}/leave`);
            alert("Η συμμετοχή σας ακυρώθηκε.");
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Σφάλμα κατά την ακύρωση συμμετοχής.");
        } finally {
            setJoining(false);
        }
    };

    const handleDeleteImage = async (imageId, imageUrl) => {
        if (!window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη φωτογραφία;")) {
            return;
        }

        try {
            await axios.delete(`/api/events/images/${imageId}`);
            alert("Η φωτογραφία διαγράφηκε.");

            setEvent(prevEvent => ({
                ...prevEvent,
                gallery: prevEvent.gallery.filter(img => img.id !== imageId)
            }));

        } catch (error) {
            console.error("Σφάλμα κατά τη διαγραφή φωτογραφίας:", error);
            if (error.response && error.response.status === 403) {
                alert("Δεν έχετε δικαίωμα να διαγράψετε αυτή τη φωτογραφία.");
            } else {
                alert("Υπήρξε πρόβλημα με τη διαγραφή.");
            }
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Φόρτωση...</div>;
    if (!event) return <div style={{ textAlign: 'center', padding: '50px' }}>Το event δεν βρέθηκε.</div>;

    const isOrganizer = user && event.organizer && user.userId === event.organizer.id;
    const isParticipant = user && event.participants && event.participants.some(p => p.id === user.userId);
    const canInteractWithGallery = isOrganizer || isParticipant;

    const hasEventPassed = event.endDateTime
        ? new Date(event.endDateTime) < new Date()
        : new Date(event.dateTime) < new Date();

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <style>
                {`
                .gallery-item:hover .delete-btn {
                    opacity: 1 !important;
                }
            `}
            </style>

            <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <img
                    src={event.imageUrl ? event.imageUrl : 'https://via.placeholder.com/800x400'}
                    alt={event.title}
                    style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                />
                <div style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h1>{event.title}</h1>
                        <div style={{ textAlign: 'right', background: '#f8f9fa', padding: '10px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '1.5rem', color: '#f1c40f', fontWeight: 'bold' }}>
                                ⭐ {stats.averageOverall ? stats.averageOverall.toFixed(1) : "0.0"}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                                {stats.totalReviews} κριτικές
                            </div>
                        </div>
                    </div>

                    <p style={{ color: '#7f8c8d', lineHeight: '1.8' }}>
                        📍 {event.location} <br/>
                        📅 Έναρξη: {new Date(event.dateTime).toLocaleString('el-GR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {event.endDateTime && (
                            <>
                                <br/>
                                🏁 Λήξη: <span style={{ marginLeft: '5px' }}>{new Date(event.endDateTime).toLocaleString('el-GR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </>
                        )}
                    </p>

                    {/* --- ΕΞΥΠΝΟ ΚΟΥΜΠΙ ΣΥΜΜΕΤΟΧΗΣ --- */}
                    {user && !isOrganizer && (
                        <div style={{ marginTop: '20px' }}>
                            {(() => {
                                const eventDate = new Date(event.dateTime);
                                const now = new Date();
                                const isPast = now > eventDate;
                                const isParticipantLocal = event.participants?.some(p => p.id === parseInt(user.userId));

                                if (isPast) {
                                    return isParticipantLocal ? (
                                        <div style={{
                                            padding: '12px 25px',
                                            background: '#27ae60',
                                            color: 'white',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            display: 'inline-block',
                                            cursor: 'default'
                                        }}>
                                            ✅ Συμμετείχα (Attended)
                                        </div>
                                    ) : (
                                        <button
                                            disabled
                                            style={{
                                                padding: '12px 25px',
                                                background: '#bdc3c7',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                cursor: 'not-allowed'
                                            }}
                                        >
                                            Η εκδήλωση έχει λήξει
                                        </button>
                                    );
                                }

                                return isParticipantLocal ? (
                                    <button
                                        onClick={handleLeaveEvent}
                                        disabled={joining}
                                        style={{
                                            padding: '12px 25px',
                                            background: '#e74c3c',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {joining ? "Ακύρωση..." : "Ακύρωση Συμμετοχής"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleJoin}
                                        disabled={joining}
                                        style={{
                                            padding: '12px 25px',
                                            background: '#2ecc71',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {joining ? "Παρακαλώ περιμένετε..." : "➕ Δήλωση Συμμετοχής (Join)"}
                                    </button>
                                );
                            })()}
                        </div>
                    )}

                    <hr style={{ margin: '20px 0' }} />

                    <div
                        style={{ lineHeight: '1.6', fontSize: '1.1rem', marginTop: '20px' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}
                    />

                    {canInteractWithGallery && event.gallery && event.gallery.length > 0 && (
                        <div style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, color: '#2c3e50' }}>📸 Υλικό Εκδήλωσης</h3>

                                <button
                                    onClick={() => setShowGallery(!showGallery)}
                                    style={{
                                        padding: '10px 20px',
                                        background: showGallery ? '#e74c3c' : '#3498db',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        transition: 'background 0.3s'
                                    }}
                                >
                                    {showGallery ? 'Απόκρυψη Υλικού' : `Προβολή Υλικού (${event.gallery.length} Φωτογραφίες)`}
                                </button>
                            </div>

                            {showGallery && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: '15px',
                                    marginTop: '20px'
                                }}>
                                    {event.gallery.map(image => (
                                        <div key={image.id} className="gallery-item" style={{ position: 'relative' }}>
                                            <img
                                                src={image.imageUrl}
                                                alt="Στιγμιότυπο"
                                                style={{
                                                    width: '100%',
                                                    height: '200px',
                                                    objectFit: 'cover',
                                                    borderRadius: '10px',
                                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                    border: '2px solid white',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                                                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                            />

                                            {user && image.uploader && (user.userId === image.uploader.id || isOrganizer) && (
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteImage(image.id, image.imageUrl)}
                                                    title="Διαγραφή φωτογραφίας"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '10px',
                                                        right: '10px',
                                                        background: 'rgba(231, 76, 60, 0.9)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '32px',
                                                        height: '32px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1rem',
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                        transition: 'opacity 0.2s',
                                                        opacity: 0,
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {!canInteractWithGallery && event.gallery && event.gallery.length > 0 && (
                        <div style={{ marginTop: '30px', padding: '15px', background: '#fff3cd', color: '#856404', borderRadius: '8px', textAlign: 'center' }}>
                            <p style={{ margin: 0 }}>🔒 Υπάρχουν {event.gallery.length} φωτογραφίες από αυτή την εκδήλωση. Κάντε "Join" για να τις δείτε!</p>
                        </div>
                    )}
                </div>
            </div>

            {isOrganizer && (
                <div style={{
                    marginTop: '30px',
                    padding: '20px',
                    background: '#f0f7ff',
                    borderRadius: '12px',
                    border: '1px solid #d0e3ff'
                }}>
                    <h3 style={{ color: '#2c3e50', marginTop: 0 }}>
                        👥 Λίστα Συμμετεχόντων ({event.participants?.length || 0})
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                        {event.participants && event.participants.length > 0 ? (
                            event.participants.map(participant => (
                                <span key={participant.id} style={{
                                    background: 'white',
                                    padding: '5px 15px',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    border: '1px solid #eee'
                                }}>
                    @{participant.username}
                </span>
                            ))
                        ) : (
                            <p style={{ color: '#7f8c8d', fontStyle: 'italic', margin: 0 }}>
                                Δεν υπάρχουν ακόμα συμμετοχές.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {canInteractWithGallery ? (
                hasEventPassed ? (
                    <MediaUpload
                        eventId={event.id}
                        onUploadSuccess={() => {
                            console.log("Φωτογραφίες ανέβηκαν, ανανέωση δεδομένων...");
                            fetchData();
                        }}
                    />
                ) : (
                    <div style={{ marginTop: '30px', padding: '15px', background: '#e8f4f8', color: '#2980b9', borderRadius: '8px', textAlign: 'center' }}>
                        ⏳ Η δυνατότητα μεταφόρτωσης υλικού θα "ξεκλειδώσει" μετά τη διεξαγωγή (ή λήξη) της εκδήλωσης!
                    </div>
                )
            ) : null}

            {/* --- ΠΡΟΒΟΛΗ ΕΙΣΙΤΗΡΙΩΝ & ΚΡΑΤΗΣΕΩΝ --- */}
            {(event.tickets?.length > 0 || event.bookingUrl || event.bookingDescription) && (
                <div style={{ marginTop: '30px', padding: '25px', background: '#f0f4f8', borderRadius: '12px', borderLeft: '5px solid #3498db' }}>
                    <h3 style={{ marginTop: 0, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🎟️ Πληροφορίες Εισιτηρίων
                    </h3>

                    {/* Τύποι Εισιτηρίων */}
                    {event.tickets?.length > 0 && (
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
                            {event.tickets.map(ticket => (
                                <li key={ticket.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed #cbd5e1' }}>
                                    <strong>{ticket.type}</strong>
                                    <span style={{ fontWeight: 'bold', color: ticket.price === 0 ? '#27ae60' : '#2c3e50' }}>
                                            {ticket.price === 0 ? "ΔΩΡΕΑΝ" : `${ticket.price.toFixed(2)} €`}
                                        </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Οδηγίες Κράτησης */}
                    {event.bookingDescription && (
                        <div style={{ marginBottom: '20px', color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            <strong>Οδηγίες:</strong> {event.bookingDescription}
                        </div>
                    )}

                    {/* Κουμπί Αγοράς/Κράτησης */}
                    {event.bookingUrl && (
                        <a
                            href={event.bookingUrl.startsWith('http') ? event.bookingUrl : `https://${event.bookingUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                width: '100%',
                                textAlign: 'center',
                                padding: '12px',
                                background: '#3498db',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#2980b9'}
                            onMouseOut={(e) => e.target.style.background = '#3498db'}
                        >
                            Κλείστε Θέση / Αγορά Εισιτηρίου 🔗
                        </a>
                    )}
                </div>
            )}

            {/* --- ΧΑΡΤΗΣ ΤΟΠΟΘΕΣΙΑΣ --- */}
            {event.latitude && event.longitude && (
                <div style={{ marginTop: '30px' }}>
                    <h3 style={{ marginBottom: '15px' }}>📍 Τοποθεσία στο Χάρτη</h3>
                    <div style={{ height: '300px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        <MapContainer center={[event.latitude, event.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[event.latitude, event.longitude]} />
                        </MapContainer>
                    </div>
                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=$${event.latitude},${event.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
                        >
                            🚗 Οδηγίες Πλοήγησης (Google Maps) →
                        </a>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '40px' }}>
                <h3 style={{ borderBottom: '2px solid #3498db', display: 'inline-block', marginBottom: '20px' }}>
                    Κριτικές Χρηστών
                </h3>

                <div style={{ marginBottom: '40px' }}>
                    {reviews.length > 0 ? (
                        reviews.map(review => {
                            const isReviewerParticipant = event.participants && review.author &&
                                event.participants.some(p => p.id === review.author.id);

                            return (
                                <div key={review.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>

                                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                            <strong style={{ fontSize: '1.05rem', color: '#2c3e50' }}>
                                                👤 {review.author?.username || "Ανώνυμος"}
                                            </strong>

                                            {isReviewerParticipant && (
                                                <span style={{
                                                    background: '#d4edda',
                                                    color: '#155724',
                                                    padding: '3px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                ✅ Επιβεβαιωμένη Συμμετοχή
                                            </span>
                                            )}

                                            {review.createdAt && (
                                                <span style={{ color: '#95a5a6', fontSize: '0.85rem', marginLeft: '5px' }}>
                                                • {new Date(review.createdAt).toLocaleDateString('el-GR')}
                                            </span>
                                            )}
                                        </div>

                                        <span style={{ color: '#f1c40f', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                        ★ {review.overallRating ? review.overallRating.toFixed(1) : "0.0"}
                                    </span>
                                    </div>
                                    <div
                                        style={{ margin: 0, color: '#34495e', lineHeight: '1.6', marginTop: '10px' }}
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(review.comment) }}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>Δεν υπάρχουν ακόμα κριτικές.</p>
                    )}
                </div>

                {user ? (
                    hasEventPassed ? (
                        <ReviewForm eventId={id} onReviewSubmitted={fetchData} />
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', background: '#e8f4f8', borderRadius: '10px', color: '#2980b9' }}>
                            ⏳ Μπορείτε να αφήσετε την κριτική σας μετά την ολοκλήρωση της εκδήλωσης!
                        </div>
                    )
                ) : (
                    <div style={{ padding: '20px', textAlign: 'center', background: '#fdf2f2', borderRadius: '10px', color: '#e74c3c' }}>
                        Πρέπει να είστε <strong>συνδεδεμένος</strong> για να γράψετε κριτική.
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetails;