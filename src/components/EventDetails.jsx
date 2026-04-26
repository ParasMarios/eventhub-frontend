import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ReviewForm from './ReviewForm';
import MediaUpload from './MediaUpload';

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

                    {user && !isOrganizer && !isParticipant && (
                        <button
                            onClick={handleJoin}
                            disabled={joining}
                            style={{
                                background: '#27ae60',
                                color: 'white',
                                border: 'none',
                                padding: '12px 25px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginTop: '10px',
                                transition: '0.3s'
                            }}
                        >
                            {joining ? "Παρακαλώ περιμένετε..." : "➕ Join Event"}
                        </button>
                    )}

                    {isParticipant && (
                        <span style={{
                            display: 'inline-block',
                            marginTop: '10px',
                            padding: '8px 15px',
                            background: '#d4edda',
                            color: '#155724',
                            borderRadius: '8px',
                            fontWeight: 'bold'
                        }}>
                            ✅ Συμμετέχετε σε αυτή την εκδήλωση!
                        </span>
                    )}

                    <hr style={{ margin: '20px 0' }} />
                    <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>{event.description}</p>

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

            <div style={{ marginTop: '40px' }}>
                <h3 style={{ borderBottom: '2px solid #3498db', display: 'inline-block', marginBottom: '20px' }}>
                    Κριτικές Χρηστών
                </h3>

                <div style={{ marginBottom: '40px' }}>
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <strong>👤 {review.author?.username || "Ανώνυμος"}</strong>
                                    <span style={{ color: '#f1c40f' }}>
                                        ★ {review.overallRating ? review.overallRating.toFixed(1) : "0.0"}
                                    </span>
                                </div>
                                <p style={{ margin: 0, color: '#34495e' }}>"{review.comment}"</p>
                            </div>
                        ))
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