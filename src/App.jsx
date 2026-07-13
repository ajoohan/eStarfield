import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Listings from './pages/Listings.jsx'
import Process from './pages/Process.jsx'
import Policy from './pages/Policy.jsx'
import Contact from './pages/Contact.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/process" element={<Process />} />
      <Route path="/policy" element={<Policy />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  )
}
