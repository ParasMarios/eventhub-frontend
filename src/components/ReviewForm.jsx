import React, {useContext, useState} from 'react';
import axios from 'axios';
import {AuthContext} from "../context/AuthContext.jsx";


const ReviewForm = ({ eventId, onReviewSubmitted }) => {
    const [formData, setFormData] = useState({
        overallRating: 5,
        comment: ''
    });

    const { user } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert("Πρέπει να συνδεθείτε για να κάνετε κριτική");

        try {
            // Στέλνουμε το review συνδέοντάς το με το event και τον χρήστη
            await axios.post('/api/reviews', {
                ...formData,
                event: { id: parseInt(eventId) },
                author: { id: parseInt(user.userId) }
            });
            alert("Η αξιολόγησή σας υποβλήθηκε!");
            setFormData({ ...formData, comment: '' }); // Καθαρισμός σχολίου
            onReviewSubmitted(); // Ενημέρωση των στατιστικών στη σελίδα
        } catch (err) {
            console.error("Σφάλμα κατά την υποβολή:", err);
        }
    };

    const renderStars = (name, value) => (
        <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '10px', textTransform: 'capitalize' }}>{name}: </label>
            {[1, 2, 3, 4, 5].map(star => (
                <span
                    key={star}
                    onClick={() => setFormData({...formData, [value]: star})}
                    style={{ cursor: 'pointer', fontSize: '1.5rem', color: star <= formData[value] ? '#f1c40f' : '#ddd' }}
                >
                    ★
                </span>
            ))}
        </div>
    );

    return (
        <div style={{ marginTop: '40px', padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
            <h3>Αφήστε μια Αξιολόγηση</h3>
            <form onSubmit={handleSubmit}>
                {renderStars("Συνολικά", "overallRating")}

                <textarea
                    placeholder="Γράψτε το σχόλιό σας εδώ..."
                    value={formData.comment}
                    onChange={(e) => setFormData({...formData, comment: e.target.value})}
                    style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '10px' }}
                    required
                />

                <button type="submit" style={{ marginTop: '15px', padding: '10px 25px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Υποβολή Κριτικής
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;