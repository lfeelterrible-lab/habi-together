import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import GeoNote from '../app/page';
import '../app/globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing app root');

createRoot(root).render(
  <StrictMode>
    <GeoNote />
  </StrictMode>,
);
