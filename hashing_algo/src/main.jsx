import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MD5 from './Algorithms/Md5.jsx'
import SHA1 from './Algorithms/Sha1.jsx'
import Sha256 from './Algorithms/Sha256.jsx'
import Scrypt from './Algorithms/Scrypt.jsx'
import HmacSha512 from './Algorithms/HmacSha512.jsx'
import AlgorithmComparison from './Algorithms/AlgorithmComparison.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/compare" element={<AlgorithmComparison />} />
        <Route path="/md5" element={<MD5 />} />
        <Route path="/sha1" element={<SHA1/>}/>
        <Route path="/sha256" element={<Sha256/>}/>
        <Route path="/scrypt" element={<Scrypt/>}/>
        <Route path="/hmac-sha512" element={<HmacSha512/>}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

