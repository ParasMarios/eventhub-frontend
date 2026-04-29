import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });
    return position === null ? null : <Marker position={position}></Marker>;
};

const CreateEvent = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({ title: '', description: '', location: '', dateTime: '', endDateTime: '', categoryId: '' });

    const [position, setPosition] = useState(null);

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error("Σφάλμα φόρτωσης κατηγοριών:", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.userId) {
            alert("Σφάλμα: Δεν βρέθηκε ID χρήστη. Παρακαλώ συνδεθείτε ξανά.");
            return;
        }

        if (!position) {
            alert("Παρακαλώ κάντε κλικ στον χάρτη για να δηλώσετε την ακριβή τοποθεσία!");
            return;
        }

        setLoading(true);
        const data = new FormData();

        const eventDto = {
            title: formData.title,
            description: formData.description,
            location: formData.location,
            latitude: position.lat,
            longitude: position.lng,
            dateTime: formData.dateTime,
            endDateTime: formData.endDateTime ? formData.endDateTime : null,
            organizer: { id: parseInt(user.userId) },
            category: formData.categoryId ? { id: parseInt(formData.categoryId) } : null
        };

        data.append('event', JSON.stringify(eventDto));
        data.append('file', file);

        try {
            await axios.post('/api/events', data);
            alert("Επιτυχής δημιουργία!");
            navigate('/');
        } catch (err) {
            console.error("Error details:", err.response?.data);
            alert("Σφάλμα κατά τη δημιουργία.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Πρόσβαση Μόνο για Μέλη</h2>
                <p>Παρακαλώ συνδεθείτε για να δημιουργήσετε μια νέα εκδήλωση.</p>
                <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', cursor: 'pointer' }}>Προς τη Σύνδεση</button>
            </div>
        );
    }

    const parentCategories = categories.filter(c => !c.parent);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Δημιουργία Νέου Event</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
                <input
                    type="text"
                    placeholder="Τίτλος Εκδήλωσης"
                    required
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                />

                <div style={{ marginBottom: '40px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Περιγραφή Εκδήλωσης</label>
                    <ReactQuill
                        theme="snow"
                        value={formData.description}
                        onChange={(content) => setFormData({...formData, description: content})}
                        style={{ height: '200px', background: 'white' }}
                    />
                </div>

                {/* --- ΤΟΠΟΘΕΣΙΑ ΚΑΙ ΧΑΡΤΗΣ --- */}
                <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Τοποθεσία (Κείμενο & Χάρτης) *</label>

                    <input
                        type="text"
                        placeholder="π.χ. ΟΑΚΑ, Μαρούσι"
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', marginBottom: '15px' }}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                    />

                    <p style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '10px' }}>
                        Κάντε κλικ στον χάρτη για να επιλέξετε το ακριβές στίγμα της εκδήλωσης.
                    </p>

                    <div style={{ height: '250px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                        <MapContainer center={[38.2, 23.8]} zoom={6} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <LocationMarker position={position} setPosition={setPosition} />
                        </MapContainer>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Κατηγορία</label>
                    <select
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: 'white' }}
                        value={formData.categoryId}
                        onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    >
                        <option value="">Επιλέξτε Κατηγορία (Προαιρετικό)</option>
                        {parentCategories.map(parent => (
                            <React.Fragment key={parent.id}>
                                <option value={parent.id} style={{ fontWeight: 'bold' }}>
                                    {parent.name}
                                </option>
                                {categories
                                    .filter(c => c.parent && c.parent.id === parent.id)
                                    .map(child => (
                                        <option key={child.id} value={child.id}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;{child.name}
                                        </option>
                                    ))
                                }
                            </React.Fragment>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Έναρξη Εκδήλωσης *</label>
                        <input
                            type="datetime-local"
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                            onChange={e => setFormData({...formData, dateTime: e.target.value})}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Λήξη Εκδήλωσης (Προαιρετικό)</label>
                        <input
                            type="datetime-local"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                            onChange={e => setFormData({...formData, endDateTime: e.target.value})}
                        />
                    </div>
                </div>

                <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>Φωτογραφία Εκδήλωσης:</label>
                    <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={e => setFile(e.target.files[0])}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                >
                    {loading ? "Γίνεται αποστολή..." : "Δημοσίευση Εκδήλωσης"}
                </button>
            </form>
        </div>
    );
};

export default CreateEvent;