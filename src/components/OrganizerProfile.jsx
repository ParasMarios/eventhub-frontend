import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';

const OrganizerProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/users/${id}/public`)
            .then(res => {
                setProfile(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Σφάλμα φόρτωσης προφίλ:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Φόρτωση Προφίλ...</div>;
    if (!profile) return <div style={{ textAlign: 'center', padding: '50px' }}>Ο διοργανωτής δεν βρέθηκε.</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            {/* --- HEADER ΠΡΟΦΙΛ --- */}
            <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#3498db', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold' }}>
                    {profile.username.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{profile.username}</h1>

                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                        <span style={{ background: '#f1c40f', color: '#fff', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            ⭐ {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : "Νέος Διοργανωτής"}
                        </span>
                        <span style={{ background: '#ecf0f1', color: '#7f8c8d', padding: '5px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>
                            📅 {profile.events?.length || 0} Εκδηλώσεις
                        </span>
                    </div>

                    {/* Στοιχεία Επικοινωνίας */}
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: '#7f8c8d', fontSize: '0.95rem' }}>
                        {profile.publicEmail && <span>📧 <a href={`mailto:${profile.publicEmail}`} style={{ color: '#3498db', textDecoration: 'none' }}>{profile.publicEmail}</a></span>}
                        {profile.phone && <span>📞 {profile.phone}</span>}
                        {profile.address && <span>📍 {profile.address}</span>}
                    </div>
                </div>
            </div>

            {/* --- ΠΕΡΙΓΡΑΦΗ (ΒΙΟΓΡΑΦΙΚΟ) --- */}
            {profile.description && (
                <div style={{ marginTop: '30px', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px', display: 'inline-block' }}>Σχετικά με εμάς</h3>
                    <div style={{ lineHeight: '1.7', color: '#34495e', marginTop: '10px' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(profile.description) }} />
                </div>
            )}

            {/* --- ΛΙΣΤΑ ΕΚΔΗΛΩΣΕΩΝ --- */}
            <div style={{ marginTop: '40px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>Εκδηλώσεις Διοργανωτή</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {profile.events && profile.events.length > 0 ? (
                        profile.events.map(event => (
                            <div key={event.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
                                <h4 style={{ margin: '0 0 10px 0' }}>{event.title}</h4>
                                <p style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '15px' }}>
                                    📅 {new Date(event.dateTime).toLocaleDateString('el-GR')}
                                </p>
                                <Link to={`/event/${event.id}`} style={{ marginTop: 'auto', background: '#3498db', color: 'white', textAlign: 'center', padding: '8px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
                                    Προβολή →
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#7f8c8d' }}>Δεν υπάρχουν εκδηλώσεις.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizerProfile;