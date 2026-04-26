import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [userData, setUserData] = useState({ username: '', password: '', email: '' });
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        //Επαλήθευση κωδικού
        if (userData.password !== confirmPassword) {
            alert("Οι κωδικοί πρόσβασης δεν ταιριάζουν. Παρακαλώ προσπαθήστε ξανά!");
            return;
        }

        setLoading(true);
        try {
            // Κλήση στο API εγγραφής
            await axios.post('/api/auth/register', userData);
            alert("Η εγγραφή ολοκληρώθηκε! Τώρα μπορείτε να συνδεθείτε.");
            navigate('/login');
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Σφάλμα κατά την εγγραφή. Ίσως το username υπάρχει ήδη.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Εγγραφή Μέλους</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder="Username"
                    required
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    onChange={e => setUserData({...userData, username: e.target.value})}
                />
                <input
                    type="email"
                    placeholder="Email"
                    required
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    onChange={e => setUserData({...userData, email: e.target.value})}
                />
                <input
                    type="password"
                    placeholder="Password"
                    required
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    onChange={e => setUserData({...userData, password: e.target.value})}
                />

                <input
                    type="password"
                    placeholder="Επιβεβαίωση Password"
                    required
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    onChange={e => setConfirmPassword(e.target.value)}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '12px',
                        background: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginTop: '10px'
                    }}
                >
                    {loading ? "Δημιουργία..." : "Δημιουργία Λογαριασμού"}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#7f8c8d' }}>
                    Έχετε ήδη λογαριασμό; <Link to="/login" style={{ color: '#3498db' }}>Συνδεθείτε εδώ</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;