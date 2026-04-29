import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// --- LEAFLET IMPORTS ---
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix για τα icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({ click(e) { setPosition(e.latlng); } });
    return position === null ? null : <Marker position={position} />;
};

const EditEvent = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: '', description: '', location: '',
        dateTime: '', endDateTime: '', categoryId: '',
        bookingUrl: '', bookingDescription: '' // ΝΕΑ ΠΕΔΙΑ
    });

    const [markerPos, setMarkerPos] = useState(null);
    const [tickets, setTickets] = useState([{ type: '', price: '' }]); // State για τα εισιτήρια

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Φόρτωση κατηγοριών
        axios.get('/api/categories').then(res => setCategories(res.data));

        // 2. Φόρτωση δεδομένων event
        axios.get(`/api/events/${id}`)
            .then(res => {
                const event = res.data;
                const formattedDate = event.dateTime ? event.dateTime.substring(0, 16) : '';
                const formattedEndDate = event.endDateTime ? event.endDateTime.substring(0, 16) : '';

                setFormData({
                    title: event.title,
                    description: event.description,
                    location: event.location,
                    dateTime: formattedDate,
                    endDateTime: formattedEndDate,
                    categoryId: event.category ? event.category.id : '',
                    bookingUrl: event.bookingUrl || '',
                    bookingDescription: event.bookingDescription || ''
                });

                // Αρχικοποίηση εισιτηρίων: Αν υπάρχουν στη βάση τα βάζουμε, αλλιώς βάζουμε ένα κενό πεδίο
                if (event.tickets && event.tickets.length > 0) {
                    setTickets(event.tickets.map(t => ({ type: t.type, price: t.price })));
                } else {
                    setTickets([{ type: '', price: '' }]);
                }

                if (event.latitude && event.longitude) {
                    setMarkerPos({ lat: event.latitude, lng: event.longitude });
                } else {
                    setMarkerPos({ lat: 37.9838, lng: 23.7275 });
                }

                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                navigate('/profile');
            });
    }, [id, navigate]);

    // Handlers για τα εισιτήρια
    const handleTicketChange = (index, field, value) => {
        const newTickets = [...tickets];
        newTickets[index][field] = value;
        setTickets(newTickets);
    };
    const addTicket = () => setTickets([...tickets, { type: '', price: '' }]);
    const removeTicket = (index) => setTickets(tickets.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const processedTickets = tickets
            .filter(t => t.type.trim() !== '')
            .map(t => ({
                type: t.type,
                price: t.price === '' ? 0 : parseFloat(t.price)
            }));

        try {
            const payload = {
                ...formData,
                latitude: markerPos.lat,
                longitude: markerPos.lng,
                category: formData.categoryId ? { id: parseInt(formData.categoryId) } : null,
                endDateTime: formData.endDateTime ? formData.endDateTime : null,
                tickets: processedTickets // Στέλνουμε τα ενημερωμένα εισιτήρια
            };

            await axios.put(`/api/events/${id}`, payload);
            alert("Η εκδήλωση ενημερώθηκε επιτυχώς!");
            navigate('/profile');
        } catch (err) {
            alert("Αποτυχία ενημέρωσης.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Φόρτωση...</div>;
    const parentCategories = categories.filter(c => !c.parent);

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Επεξεργασία Εκδήλωσης</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>

                <label style={{ fontWeight: 'bold' }}>Τίτλος</label>
                <input type="text" value={formData.title} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                       onChange={e => setFormData({...formData, title: e.target.value})} />

                <label style={{ fontWeight: 'bold' }}>Περιγραφή</label>
                <ReactQuill theme="snow" value={formData.description} onChange={(c) => setFormData({...formData, description: c})} style={{ height: '200px' }} />

                {/* --- ΕΝΟΤΗΤΑ ΕΙΣΙΤΗΡΙΩΝ --- */}
                <div style={{ padding: '20px', background: '#fcf8e3', borderRadius: '10px', border: '1px solid #faebcc' }}>
                    <h3 style={{ marginTop: 0, color: '#8a6d3b' }}>🎟️ Εισιτήρια & Κρατήσεις</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        {tickets.map((ticket, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input type="text" placeholder="Τύπος (π.χ. Κανονικό)" style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                       value={ticket.type} onChange={e => handleTicketChange(index, 'type', e.target.value)} />

                                <input type="number" step="0.01" placeholder="Τιμή (€)" style={{ flex: 1.5, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                       value={ticket.price} onChange={e => handleTicketChange(index, 'price', e.target.value)} />

                                <button type="button" onClick={() => removeTicket(index)} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>✖</button>
                            </div>
                        ))}
                        <button type="button" onClick={addTicket} style={{ alignSelf: 'flex-start', background: '#8a6d3b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            + Προσθήκη Τύπου Εισιτηρίου
                        </button>
                    </div>

                    <input type="url" placeholder="URL Κράτησης/Αγοράς" value={formData.bookingUrl} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px', boxSizing: 'border-box' }}
                           onChange={e => setFormData({...formData, bookingUrl: e.target.value})} />

                    <textarea placeholder="Οδηγίες Κράτησης" value={formData.bookingDescription} rows="3" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                              onChange={e => setFormData({...formData, bookingDescription: e.target.value})} />
                </div>

                {/* Χάρτης */}
                <div style={{ marginTop: '20px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Αλλαγή Στίγματος στον Χάρτη:</label>
                    <div style={{ height: '300px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #ddd' }}>
                        <MapContainer center={markerPos} zoom={15} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationMarker position={markerPos} setPosition={setMarkerPos} />
                        </MapContainer>
                    </div>
                </div>

                <label style={{ fontWeight: 'bold' }}>Τοποθεσία (Κείμενο)</label>
                <input type="text" value={formData.location} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                       onChange={e => setFormData({...formData, location: e.target.value})} />

                {/* Κατηγορία */}
                <label style={{ fontWeight: 'bold' }}>Κατηγορία</label>
                <select value={formData.categoryId} style={{ padding: '12px' }} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                    <option value="">Επιλέξτε Κατηγορία</option>
                    {parentCategories.map(p => (
                        <React.Fragment key={p.id}>
                            <option value={p.id} style={{fontWeight:'bold'}}>{p.name}</option>
                            {categories.filter(c => c.parent?.id === p.id).map(child => (
                                <option key={child.id} value={child.id}>&nbsp;&nbsp;&nbsp;{child.name}</option>
                            ))}
                        </React.Fragment>
                    ))}
                </select>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" disabled={saving} style={{ flex: 2, padding: '15px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                        {saving ? "Αποθήκευση..." : "Ενημέρωση Εκδήλωσης"}
                    </button>
                    <button type="button" onClick={() => navigate('/profile')} style={{ flex: 1, padding: '15px', background: '#bdc3c7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                        Ακύρωση
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditEvent;