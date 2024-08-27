import ReactDOM from 'react-dom/client';
import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
  <BrowserRouter>
  {/* biar dia nunggu setelah komponen keluar */}
    <Suspense>      
      <App />
    </Suspense>
  </BrowserRouter>
</HelmetProvider>
)
