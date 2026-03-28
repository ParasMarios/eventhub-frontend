
import {BrowserRouter as Router, Routes, Route, Link, useNavigate} from 'react-router-dom';
import EventList from './components/EventList';
import CreateEvent from './components/CreateEvent';
import EventDetails from './components/EventDetails';
import {AuthContext, AuthProvider} from './context/AuthContext';
import Login from './components/Login';
import axios from "axios";
import {useContext} from "react";
import Register from "./components/Register.jsx";
import Profile from "./components/Profile.jsx";
import EditEvent from './components/EditEvent';

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
    const navigate = useNavigate();

    const sharedButtonStyle = {
        padding: '10px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.95rem',
        border: 'none',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '42px',      // Σταθερό ύψος
        minWidth: '120px',   // Σταθερό ελάχιστο πλάτος
        transition: 'opacity 0.2s'
    };

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

                {user ? (
                    <>
                        <Link to="/profile" style={{
                            color: 'white',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            marginLeft: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            👤 {user.username}
                        </Link>

                        <button
                            onClick={() => navigate('/create')}
                            style={{ ...sharedButtonStyle, background: '#3498db' }}
                        >
                            Create Event
                        </button>

                        <button
                            onClick={logout}
                            style={{ ...sharedButtonStyle, background: '#e74c3c' }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => navigate('/register')}
                            style={{ ...sharedButtonStyle, background: '#7f8c8d' }}
                        >
                            Register
                        </button>

                        <button
                            onClick={() => navigate('/login')}
                            style={{ ...sharedButtonStyle, background: '#27ae60' }}
                        >
                            Login
                        </button>
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
                            <Route path="/edit-event/:id" element={<EditEvent />} />
                            <Route path="/event/:id" element={<EventDetails />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;