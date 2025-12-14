import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Deposit from './pages/Deposit';
import Search from './pages/Search';
import PropertyDetails from './pages/PropertyDetails';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Navbar />
        <main style={{ paddingTop: '5rem', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/search" element={<Search />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
