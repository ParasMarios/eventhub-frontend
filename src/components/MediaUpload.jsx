import React, { useState } from 'react';
import axios from 'axios';

const MediaUpload = ({ eventId, userId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!file) return alert("Παρακαλώ επιλέξτε ένα αρχείο");

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            await axios.post(`/api/media/upload/${eventId}/user/${userId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Η εικόνα ανέβηκε!");
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            console.error(err);
            alert("Σφάλμα στο ανέβασμα. Μήπως δεν είστε ο διοργανωτής;");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ border: '1px dashed #ccc', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button
                onClick={handleUpload}
                disabled={uploading || !file}
                style={{ marginLeft: '10px', background: '#27ae60', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
            >
                {uploading ? "Ανέβασμα..." : "Ανέβασμα Εικόνας"}
            </button>
        </div>
    );
};

export default MediaUpload;