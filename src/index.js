// Import modules
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import components
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';

// Import css files
import './index.css';

// Since the playlist is required for all pages, make a context instead of a state.
import { PlaylistProvider } from './components/playlist/PlaylistContext';

// We should only use a single page for assignment, so we don't need to edit this page anymore. 
// Please edit App.js instead too add contents..
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <PlaylistProvider>
                <App />
            </PlaylistProvider>
        </BrowserRouter>
    </React.StrictMode>
);
