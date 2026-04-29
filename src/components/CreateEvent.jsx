import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({ click(e) { setPosition(e.latlng); } });
    return position === null ? null : <Marker position={position} />;
};

const CreateEvent = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: '', description: '', location: '',
        dateTime: '', endDateTime: '', categoryId: '',
        bookingUrl: '', bookingDescription: '' // ΝΕΑ ΠΕΔΙΑ
    });

    const [markerPos, setMarkerPos] = useState({ lat: 37.9838, lng: 23.7275 });

    const [tickets, setTickets] = useState([{ type: '', price: '' }]);

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => { axios.get('/api/categories').then(res => setCategories(res.data)); }, []);

    // Συναρτήσεις για διαχείριση της λίστας εισιτηρίων
    const handleTicketChange = (index, field, value) => {
        const newTickets = [...tickets];
        newTickets[index][field] = value;
        setTickets(newTickets);
    };
    const addTicket = () => setTickets([...tickets, { type: '', price: '' }]);
    const removeTicket = (index) => setTickets(tickets.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();

        const processedTickets = tickets
            .filter(t => t.type.trim() !== '')
            .map(t => ({
                type: t.type,
                price: t.price === '' ? 0 : parseFloat(t.price)
            }));

        const eventDto = {
            ...formData,
            latitude: markerPos.lat,
            longitude: markerPos.lng,
            organizer: { id: parseInt(user.userId) },
            category: formData.categoryId ? { id: parseInt(formData.categoryId) } : null,
            tickets: processedTickets // Στέλνουμε τα εισιτήρια στο Backend
        };

        data.append('event', JSON.stringify(eventDto));
        data.append('file', file);

        try {
            await axios.post('/api/events', data);
            alert("Επιτυχής δημιουργία!");
            navigate('/');
        } catch (err) {
            alert("Σφάλμα κατά τη δημιουργία.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div style={{textAlign:'center', marginTop:'50px'}}><h2>Πρόσβαση Μόνο για Μέλη</h2></div>;
    const parentCategories = categories.filter(c => !c.parent);

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Δημιουργία Νέου Event</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <input type="text" placeholder="Τίτλος Εκδήλωσης" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                       onChange={e => setFormData({...formData, title: e.target.value})} />

                <div style={{ marginBottom: '40px' }}>
                    <label style={{ fontWeight: 'bold' }}>Περιγραφή</label>
                    <ReactQuill theme="snow" value={formData.description} onChange={(c) => setFormData({...formData, description: c})} style={{ height: '150px' }} />
                </div>

                {/* --- ΕΝΟΤΗΤΑ ΕΙΣΙΤΗΡΙΩΝ ΚΑΙ ΚΡΑΤΗΣΕΩΝ --- */}
                <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e9ecef' }}>
                    <h3 style={{ marginTop: 0, color: '#2c3e50' }}>🎟️ Εισιτήρια & Κρατήσεις</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        {tickets.map((ticket, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input type="text" placeholder="Τύπος (π.χ. Κανονικό, VIP)" style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                       value={ticket.type} onChange={e => handleTicketChange(index, 'type', e.target.value)} />

                                <input type="number" step="0.01" min="0" placeholder="Τιμή (€) - Αφήστε κενό για Δωρεάν" style={{ flex: 1.5, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                       value={ticket.price} onChange={e => handleTicketChange(index, 'price', e.target.value)} />

                                {tickets.length > 1 && (
                                    <button type="button" onClick={() => removeTicket(index)} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>✖</button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addTicket} style={{ alignSelf: 'flex-start', background: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            + Προσθήκη Τύπου Εισιτηρίου
                        </button>
                    </div>

                    <input type="url" placeholder="URL Κράτησης/Αγοράς (π.χ. https://viva.gr/events/...)" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px', boxSizing: 'border-box' }}
                           onChange={e => setFormData({...formData, bookingUrl: e.target.value})} />

                    <textarea placeholder="Οδηγίες Κράτησης (π.χ. 'Η αγορά γίνεται στην είσοδο' ή 'Τηλέφωνο κρατήσεων: 210...')" rows="3" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                              onChange={e => setFormData({...formData, bookingDescription: e.target.value})} />
                </div>

                {/* --- ΧΑΡΤΗΣ --- */}
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Στίγμα στον Χάρτη:</label>
                    <div style={{ height: '300px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #ddd' }}>
                        <MapContainer center={[37.9838, 23.7275]} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationMarker position={markerPos} setPosition={setMarkerPos} />
                        </MapContainer>
                    </div>
                </div>

                <input type="text" placeholder="Ονομασία Τοποθεσίας (π.χ. Πλατεία Συντάγματος)" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                       onChange={e => setFormData({...formData, location: e.target.value})} />

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{flex:1}}>
                        <label style={{fontSize:'0.8rem'}}>Έναρξη</label>
                        <input type="datetime-local" required style={{ width: '100%', padding: '10px' }} onChange={e => setFormData({...formData, dateTime: e.target.value})} />
                    </div>
                    <div style={{flex:1}}>
                        <label style={{fontSize:'0.8rem'}}>Λήξη</label>
                        <input type="datetime-local" style={{ width: '100%', padding: '10px' }} onChange={e => setFormData({...formData, endDateTime: e.target.value})} />
                    </div>
                </div>

                <select style={{ padding: '12px' }} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                    <option value="">Επιλέξτε Κατηγορία</option>
                    {parentCategories.map(p => (
                        <optgroup key={p.id} label={p.name}>
                            <option value={p.id}>-- Γενικά --</option>
                            {categories.filter(c => c.parent?.id === p.id).map(child => (
                                <option key={child.id} value={child.id}>{child.name}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>

                <input type="file" required onChange={e => setFile(e.target.files[0])} />

                <button type="submit" disabled={loading} style={{ padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {loading ? "Γίνεται αποστολή..." : "Δημοσίευση Εκδήλωσης"}
                </button>
            </form>
        </div>
    );
};

export default CreateEvent;