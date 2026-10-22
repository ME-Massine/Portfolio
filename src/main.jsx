import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import Layout from './components/Chrome.jsx';
import { TransitionProvider } from './components/Transition.jsx';
import { ContactProvider } from './components/Contact.jsx';
import Home from './pages/Home.jsx';
import Projects from './pages/Projects.jsx';
import Project from './pages/Project.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';
import './index.css';

// Old case-study URLs lived under /projects/:slug.
function LegacyProject() {
  const { slug } = useParams();
  return <Navigate to={`/project/${slug}`} replace />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TransitionProvider>
        <ContactProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:slug" element={<LegacyProject />} />
              <Route path="/project/:slug" element={<Project />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ContactProvider>
      </TransitionProvider>
    </BrowserRouter>
  </StrictMode>,
);
