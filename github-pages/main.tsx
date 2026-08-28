import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import HabiTogether from '../app/components/HabiTogether';
import '../app/habi-together.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing app root');

createRoot(root).render(
  <StrictMode>
    <HabiTogether />
  </StrictMode>,
);
