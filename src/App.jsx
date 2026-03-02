import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import GeneratorPage from './pages/GeneratorPage'

// Individual tool pages
import CaptionToolPage from './pages/tools/CaptionToolPage'
import PosterToolPage from './pages/tools/PosterToolPage'
import AvatarToolPage from './pages/tools/AvatarToolPage'
import VideoToolPage from './pages/tools/VideoToolPage'
import MarketplaceToolPage from './pages/tools/MarketplaceToolPage'
import R2VStudioPage from './pages/tools/R2VStudioPage'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/generator" element={<GeneratorPage />} />

        {/* Individual tool routes */}
        <Route path="/generator/caption" element={<CaptionToolPage />} />
        <Route path="/generator/poster" element={<PosterToolPage />} />
        <Route path="/generator/avatar" element={<AvatarToolPage />} />
        <Route path="/generator/video" element={<VideoToolPage />} />
        <Route path="/generator/marketplace" element={<MarketplaceToolPage />} />

        <Route path="/generator/r2v-studio" element={<R2VStudioPage />} />
      </Routes>
    </Router>
  )
}

export default App
