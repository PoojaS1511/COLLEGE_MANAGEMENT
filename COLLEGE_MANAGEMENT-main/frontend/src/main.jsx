import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AOS from 'aos'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { logError } from './utils/errorLogger'

// Initialize AOS
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true,
  offset: 100,
  delay: 100,
})

// Global window error handlers to capture uncaught errors and unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    try {
      // event.error may be null for syntax/resource errors; create a fallback Error
      const err = event.error || new Error(event.message || 'Window error');
      logError({ error: err, info: { filename: event.filename, lineno: event.lineno, colno: event.colno } });
    } catch (e) {
      console.error('Error logging window error:', e);
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event.reason;
      const err = reason instanceof Error ? reason : new Error(typeof reason === 'string' ? reason : JSON.stringify(reason));
      logError({ error: err, info: { type: 'unhandledrejection' } });
    } catch (e) {
      console.error('Error logging unhandled rejection:', e);
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
