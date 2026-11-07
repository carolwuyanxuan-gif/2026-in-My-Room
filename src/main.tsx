import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RoomPrototype } from './RoomPrototype';
import './styles/prototype.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><RoomPrototype /></StrictMode>,
);
