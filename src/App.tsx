import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './state/store'
import { ToastProvider } from './components/Toast'
import Layout from './components/Layout'
import Home from './pages/Home'
import MemoriesPage from './pages/MemoriesPage'
import NewMemoryPage from './pages/NewMemoryPage'
import MemoryDetailPage from './pages/MemoryDetailPage'
import FirstEncounterPage from './pages/FirstEncounterPage'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/memories" element={<MemoriesPage />} />
              <Route path="/memories/new" element={<NewMemoryPage />} />
              <Route path="/memories/:id" element={<MemoryDetailPage />} />
              <Route path="/first-encounter" element={<FirstEncounterPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  )
}

export default App
