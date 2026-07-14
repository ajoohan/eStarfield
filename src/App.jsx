import { Routes, Route, useLocation } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Complexes from './pages/Complexes.jsx'
import Listings from './pages/Listings.jsx'
import BoardPage from './pages/BoardPage.jsx'
import PostDetail from './pages/PostDetail.jsx'
import Contact from './pages/Contact.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  const routes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/complexes" element={<Complexes />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/process" element={<BoardPage board="process" />} />
      <Route path="/process/:id" element={<PostDetail board="process" />} />
      <Route path="/policy" element={<BoardPage board="policy" />} />
      <Route path="/policy/:id" element={<PostDetail board="policy" />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )

  if (isAdmin) {
    return routes
  }

  return (
    <>
      <ScrollToTop />
      <Header />
      <main>{routes}</main>
      <Footer />
    </>
  )
}
