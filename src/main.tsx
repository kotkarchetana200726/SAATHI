import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update
registerSW({
  immediate: true,
  onOfflineReady() {
    console.log('SAATHI PWA is ready for offline usage.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
