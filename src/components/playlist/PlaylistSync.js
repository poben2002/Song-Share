import { getDatabase, onValue, ref as firebaseRef, set as firebaseSet /*, serverTimestamp*/ } from "firebase/database";
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2'

const showErrorDialog = (error) => {
    const swal = withReactContent(Swal);

    swal.fire({
        title: "Error",
        text: "Cannot sync your playlist with the database. Please try again later",
        icon: "error",
        confirmButtonColor: "#E06060",
        confirmButtonText: "Okay",
        customClass: { confirmButton: "small-font", }
    });

    console.error(error);
}

export const pushPlaylistToDatabase = (user, playlist) => {
    // If user is null (not logined), no need to sync.
    if (!user) return;

    // We assume that we set proper security rules in the Firebase Realtime database.
    // Otherwise, if users manupulate client codes, they can access other's playlist.    
    const db = getDatabase();
    const dataKey = `playlist/${user.uid}`;
    const playlistRef = firebaseRef(db, dataKey);

    firebaseSet(playlistRef, playlist)
        .then(() => {
            // Currently nothing to do. Left a debug message just in case.
            // console.log("Playlist is pushed into the database.");
        })
        .catch(err => {
            showErrorDialog(err);
        });
}

// Sync user's playlist with the database.
export const syncPlaylistToDatabase = (user, playlist, setPlaylist) => {
    // If user is null (not logined), no need to sync.
    if (!user) return (null);

    // We assume that we set proper security rules in the Firebase Realtime database.
    // Otherwise, if users manupulate client codes, they can access other's playlist.
    const db = getDatabase();
    const dataKey = `playlist/${user.uid}`;
    const playlistRef = firebaseRef(db, dataKey);

    // It returns an event cleanup function. Please refer to textbook.
    // https://info340.github.io/firebase.html#listening-for-data-changes
    const unregisterFunction = onValue(
        playlistRef,
        (snapshot) => { // Success callback
            // Because we support temporary playlist with login, there are a few cases.
            // 1. User is signed in     : Database playlist Precedence. 
            //                            Local playlist will be overwritten when signed in.
            // 2. User is not signed in : Local playlist Precedence. 
            //                            Local playlist will be removed when the browser is closed or refreshed.
            const dataSet = snapshot.val();
            if (JSON.stringify(dataSet) !== JSON.stringify(playlist)) {
                // console.log("Playlist is updated from the database.");
                setPlaylist({
                    id: dataSet ? dataSet : [],
                    type: "list"
                });
            }
        },
        (error) => { // Cancel & Error callback
            showErrorDialog(error);
        }
    )

    return (unregisterFunction);
}

