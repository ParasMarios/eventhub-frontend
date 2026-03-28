
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EventList from './components/EventList';
import CreateEvent from './components/CreateEvent';
import EventDetails from './components/EventDetails';
import {AuthContext, AuthProvider} from './context/AuthContext';
import Login from './components/Login';
import axios from "axios";
import {useContext} from "react";
import Register from "./components/Register.jsx";
import Profile from "./components/Profile.jsx";

axios.interceptors.request.use(config => {
    const savedUser = localStorage.getItem('eventHubUser');
    if (savedUser) {
        const { token } = JSON.parse(savedUser);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const Navigation = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav style={{
            background: '#2c3e50',
            color: 'white',
            padding: '15px 5%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{ margin: 0 }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', letterSpacing: '1px' }}>EventHub</Link>
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Αρχική</Link>

                {user && (
                    <Link to="/profile" style={{ color: 'white', textDecoration: 'none', marginRight: '15px' }}>Το Προφίλ μου</Link>
                )}

                {user ? (
                    <>
                        <Link to="/create" style={{
                            background: '#3498db',
                            padding: '8px 15px',
                            borderRadius: '5px',
                            color: 'white',
                            textDecoration: 'none',
                            fontWeight: 'bold'
                        }}>+ Δημιουργία</Link>

                        <span style={{ color: '#bdc3c7', marginLeft: '10px' }}>
                            👤 {user.username}
                        </span>

                        <button
                            onClick={logout}
                            style={{
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                padding: '8px 15px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Εγγραφή</Link>
                        <Link to="/login" style={{
                            background: '#27ae60',
                            padding: '8px 15px',
                            borderRadius: '5px',
                            color: 'white',
                            textDecoration: 'none',
                            fontWeight: 'bold'
                        }}>Login</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app-container">
                    <Navigation />

                    <main style={{ width: '90%', maxWidth: '1400px', margin: '40px auto' }}>
                        <Routes>
                            <Route path="/" element={<EventList />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/create" element={<CreateEvent />} />
                            <Route path="/event/:id" element={<EventDetails />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;