import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

// Import pages
import Header from './common/Header';
import Footer from './common/Footer';
import HomePage from './home/HomePage';
import PlaylistPage from './playlist/PlaylistPage';
import RecommendationPage from './recommendation/RecommendationPage';
import SearchPage from './search/SearchPage';
import SearchArtist from './search/SearchArtist';
import SearchResults from './search/SearchResults';
import LoginPage from './login/LoginPage';
// import TestFirebasePage from './test/TestFirebase';
// import TestJsonPage from './test/TestJson';
import { usePlaylistState } from './playlist/PlaylistContext';
import { syncPlaylistToDatabase, pushPlaylistToDatabase } from './playlist/PlaylistSync';

// Setup Firebase database
const firebaseConfig = {
    apiKey: "AIzaSyB9Nt2R_qg4PhUGrF3vZNaFM3CUoReYuzY",
    authDomain: "info340-sp23-final.firebaseapp.com",
    databaseURL: "https://info340-sp23-final-default-rtdb.firebaseio.com",
    projectId: "info340-sp23-final",
    storageBucket: "info340-sp23-final.appspot.com",
    messagingSenderId: "715569959263",
    appId: "1:715569959263:web:e91947cc86f125c50726ea"
};


initializeApp(firebaseConfig);

export default function App() {
    const auth = getAuth();
    const [user] = useAuthState(auth);
    const [playlist, setPlaylist] = usePlaylistState();

    // Hook for playlist change
    useEffect(() => {
        const unregisterFunction = syncPlaylistToDatabase(user, playlist, setPlaylist);
        
        // Cleanup function for when component is removed.
        function cleanup() {
            if(unregisterFunction) unregisterFunction();
        }

        return (cleanup);
        // Current this effect should be triggered only by user.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Hook for playlist change
    useEffect(() => {
        pushPlaylistToDatabase(user, playlist);
        // Current this effect should be triggered only by playlist.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playlist]);

    return (
        <div className="App">
            <Header user={user} />

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/playlist" element={<PlaylistPage user={user} />} />
                <Route path="/recommendation" element={<RecommendationPage />} />
                <Route path="/search" element={<SearchPage />}>
                    <Route path=":artistId" element={<SearchArtist />} />
                    <Route index element={<SearchResults />} />
                </Route>

                <Route path="/login" element={<LoginPage user={user} />} />
                <Route path="/logout" element={<LoginPage action="logout" user={user} />} />

                {/* These routing are for just testing functions. They will be removed when we submit.
                    <Route path="test">
                    <Route path="json" element={<TestJsonPage />} />
                    <Route path="firebase" element={<TestFirebasePage />} />
                    </Route> */}

                {/* If page route doesn't exist, go to / */}
                <Route path="*" element={<Navigate to="/" replace={true} />} />
            </Routes>
        
            <Footer />
        </div>
    )
};
