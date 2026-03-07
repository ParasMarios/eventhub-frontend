
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EventList from './components/EventList';
import CreateEvent from './components/CreateEvent';
import EventDetails from './components/EventDetails';

function App() {
    return (
        <Router>
            <div style={{ minHeight: '100vh', background: '#fdfdfd', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
                <nav style={{ background: '#2c3e50', color: 'white', padding: '15px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                        <Link to="/" style={{ color: 'white', textDecoration: 'none', letterSpacing: '1px' }}>EventHub</Link>
                    </h1>
                    <div>
                        <Link to="/" style={{ color: 'white', marginRight: '25px', textDecoration: 'none', fontWeight: '500' }}>Αρχική</Link>
                        <Link to="/create" style={{ background: '#3498db', padding: '10px 20px', borderRadius: '5px', color: 'white', textDecoration: 'none', fontWeight: 'bold', transition: '0.3s' }}>+ Δημιουργία</Link>
                    </div>
                </nav>

                <main style={{ padding: '40px 10%', maxWidth: '1400px', margin: '0 auto' }}>
                    <Routes>
                        <Route path="/" element={<EventList />} />
                        <Route path="/create" element={<CreateEvent />} />
                        <Route path="/event/:id" element={<EventDetails />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;