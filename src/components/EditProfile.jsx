import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const EditProfile = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        description: '',
        address: '',
        phone: '',
        publicEmail: ''
    });

    useEffect(() => {
        if (!user || !user.userId) {
            navigate('/login');
            return;
        }

        // Φορτώνουμε τα υπάρχοντα δεδομένα από το public endpoint
        axios.get(`/api/users/${user.userId}/public`)
            .then(res => {
                setFormData({
                    description: res.data.description || '',
                    address: res.data.address || '',
                    phone: res.data.phone || '',
                    publicEmail: res.data.publicEmail || ''
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Σφάλμα φόρτωσης:", err);
                setLoading(false);
            });
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await axios.put(`/api/users/${user.userId}`, formData);
            alert("Το προφίλ σας ενημερώθηκε επιτυχώς!");
            navigate(`/organizer/${user.userId}`); // Τον στέλνουμε να δει το νέο του προφίλ
        } catch (err) {
            console.error(err);
            alert("Υπήρξε πρόβλημα κατά την αποθήκευση.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Φόρτωση...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>Επεξεργασία Προφίλ Διοργανωτή</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Δημόσιο Email Επικοινωνίας</label>
                    <input
                        type="email"
                        placeholder="π.χ. contact@myband.gr"
                        value={formData.publicEmail}
                        onChange={e => setFormData({...formData, publicEmail: e.target.value})}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                    />
                    <small style={{ color: '#7f8c8d' }}>Αυτό το email θα είναι ορατό σε όλους. (Δεν αλλάζει το email σύνδεσής σας).</small>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Τηλέφωνο Επικοινωνίας</label>
                    <input
                        type="tel"
                        placeholder="π.χ. 2101234567"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                    />
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Ταχυδρομική Διεύθυνση / Έδρα</label>
                    <input
                        type="text"
                        placeholder="π.χ. Ερμού 15, Αθήνα"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '40px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Περιγραφή / Βιογραφικό</label>
                    <ReactQuill
                        theme="snow"
                        value={formData.description}
                        onChange={(content) => setFormData({...formData, description: content})}
                        style={{ height: '200px', background: 'white' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{ flex: 2, padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {saving ? "Αποθήκευση..." : "Αποθήκευση Αλλαγών"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        style={{ flex: 1, padding: '15px', background: '#ecf0f1', color: '#7f8c8d', border: '1px solid #bdc3c7', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Ακύρωση
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;