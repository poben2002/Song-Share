import { createContext, useContext, useReducer } from "react";

// Since the playlist is required for all pages, make a context instead of a state.
// https://react.dev/reference/react/useContext
const PlaylistContext = createContext();

// Since it needs to update according to old conditions and sync with Firebase database, we use reducer.
// https://coderpad.io/blog/development/global-state-management-react/
const playlistReducer = (state, action) => {
    const { id, type, onChanged } = action;

    switch (type) {
        case "add": {
            // If it is already included, just return the currrent state
            if(state.includes(id)) return (state);
            
            // If a callback function is given, call it.
            if(onChanged) onChanged();

            return([...state, id]);
        }

        case "delete": {
            const idx = state.findIndex((item) => item === id);

            // If it is noot included, just return the currrent state
            if(idx < 0) return (state);

            // If a callback function is given, call it.
            if(onChanged) onChanged();

            const newState = [...state];
            newState.splice(idx, 1);

            return(newState);
        }

        case "list": {
            // If it doesn't change, just return old one so that it will not trigger state change effect.
            if(JSON.stringify(state) === JSON.stringify(id)) return (state);

            const newState = [...id];

            // If a callback function is given, call it.
            if(onChanged) onChanged();

            return(newState);
        }

        default: {
            return (state);
        }
    }
};

export const PlaylistProvider = ({ children }) => {
    const [playlist, setPlaylist] = useReducer(playlistReducer, []);

    return (
        <PlaylistContext.Provider value={[playlist, setPlaylist]}>
            {children}
        </PlaylistContext.Provider>
    );
};

export const usePlaylistState = () => useContext(PlaylistContext);
