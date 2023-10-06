import { getFunctions, httpsCallable } from "firebase/functions";

// Based on the feedback from TA, we should not release our API key to global users.
// So our front-end calls the Firebase Cloud Functions instead.
// The cloud function source code is in the /functions/index.js folder.
export const getPlaylistAnalysis = (playList, requestId, callbackSuccess, callbackFailure) => {
    // console.log("Firebase cloud function is called.");

    // If callback is not given, not need to proceed with.
    if (callbackSuccess === undefined) return;

    // Make songlist with necessary information
    const songList = playList.map((item, idx) => {
        if(idx >= 10) return(null);

        return ({
            song_name: item.song_name,
            song_type: item.song_type,
            main_genre: item.main_genre,
            genres: item.genres,
            artist_name: item.artist_name,
            artist_type: item.artist_type,
            tempo: `${Math.round(item.tempo)} bpm`,
            loudness: `${Number(item.loudness).toFixed(1)}dB`,
            acousticness: `${Number(item.acousticness * 100).toFixed(1)}%`,
            danceability: `${Number(item.danceability * 100).toFixed(1)}%`,
            energy: `${Number(item.energy * 100).toFixed(1)}%`,
            instrumentalness: `${Math.min(100.0, Number(item.instrumentalness * 100 * 10000)).toFixed(1)}%`,
            liveness: `${Number(item.liveness * 100).toFixed(1)}%`,
            speechiness: `${Math.min(100.0, Number(item.speechiness * 100 * 10)).toFixed(1)}%`,
            valence: `${Number(item.valence * 100).toFixed(1)}%`,
        });
    });

    const functions = getFunctions();
    const func = httpsCallable(functions, "analysis");

    func({ playList: songList }).then((result) => {
        // Note that for gen2 responses, we should use `callbackSuccess(result.data);` instead.
        // console.log(result);
        callbackSuccess(result, requestId);
    }).catch((error) => {
        // console.log(error);
        callbackFailure(error, requestId);
    });
};
