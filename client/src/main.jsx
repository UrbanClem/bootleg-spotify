import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { I18nProvider } from './i18n';

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';

// GitHub Pages serves 404.html for unknown paths. That file redirects here with
// the original path in `?p=`, so a deep link such as /albums/1021 reaches the
// router intact instead of dead-ending. Must run before the router mounts.
if (import.meta.env.VITE_DEMO === 'true') {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('p');
  if (redirect) {
    params.delete('p');
    const rest = params.toString();
    window.history.replaceState(null, '', redirect + (rest ? `?${rest}` : ''));
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <PlayerProvider>
            <App />
          </PlayerProvider>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>
);
