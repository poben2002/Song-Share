import React, { useEffect, useState, useRef } from 'react';
import { getPlaylistAnalysis } from "../common/CloudFunc";
import { getSimilarSongs } from '../common/JsonData';
import { StringAnimation } from "../common/StringAnimation";
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { showPlaylistDialog } from './PlaylistDialog';
import { usePlaylistState } from './PlaylistContext';

export default function PlaylistAnalysis(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const lastRequest = useRef({ id: null, data: null });
    const [, setPlaylist] = usePlaylistState();

    useEffect(() => {
        // The returning order of Firebase functions is not guaranteed if it is called twice or more. (e.g., Calling before getting the result)
        // Thus, we remember the last call's unique id and only proceed with it if it is the same.
        const requestId = Math.random().toString(36);

        if (!props.resultList || props.resultList.length === 0) {
            lastRequest.current.id = requestId;
            setIsLoading(false);
            setMessage("Oh, there are no songs in the playlist to analyze. Don't worry! We can still recommend songs. Please click the button below.");
            return;
        }

        // Firebase function call is expensive.
        // So, it calls only when the playList is actually changed.
        const data = JSON.stringify(props.resultList);
        if (lastRequest.current.data === data) return;

        setIsLoading(true);
        setMessage("Analyzing your playlist...");
        getPlaylistAnalysis(props.resultList, requestId, printPlaylistAnalysis, errorPlaylistAnalysis);

        lastRequest.current.data = data;
        lastRequest.current.id = requestId;
    }, [props.resultList]);

    const printPlaylistAnalysis = (response, requestId) => {
        // console.log(response);

        // If requestId is not the last one, just drop it.
        if (lastRequest.current.id !== requestId) return;

        const msg = response.data.choices[0].message.content + " Click the button below and we will find similar songs!";
        setIsLoading(false);
        setMessage(msg);
    }

    const errorPlaylistAnalysis = (error, requestId) => {
        console.error("Cannot retrieve a result from Firebase Function");
        console.error(error);
        setIsLoading(false);
        setMessage("Oops! The playlist could not be analyzed due to server reasons. However, we can still recommend songs. Please click the button below.");
    }

    const onClickPickSong = (event) => {
        event.preventDefault();

        const successCallback = (songs) => {
            if (songs.length === 0 || songs.length < 0) {
                const swal = withReactContent(Swal);
                swal.fire({
                    title: "No Similar Songs Found.",
                    text: "We did not find any similar songs based on your playlist.",
                    icon: "info",
                    confirmButtonColor: "#41429e",
                    confirmButtonText: "Confirm",
                    customClass: {confirmButton: "small-font "}
                });
            }
            else {
                //only focusin on teh first song for now
                const selectedSong = songs[0];
                const playlistTemp = [...props.resultList, selectedSong];
                setPlaylist({
                    id: playlistTemp,
                    type: "list"
                });
                const swal = withReactContent(Swal);
                swal.fire({
                    title: "Song has been added!",
                    text: "A song with similar features has been added to your playlist!",
                    icon: "success",
                    confirmButtonColor: "#4ef67e",
                    confirmButtonText: "Confirm",
                    customClass: { confirmButton: "small-font" }
                });
            }
        };
            const failureCallback = () => {
                const swal = withReactContent(Swal);
                swal.fire({
                    title: "Error.",
                    text: "Failed to retrieve any similar songs.",
                    icon: "error",
                    confirmButtonColor: "#41429e",
                    confirmButtonText: "Confirm",
                    customClass: { confirmButton: "small-font" }
                });
            };

        // TODO : Like other Json data functions, we should pass the success and failure callback functions instead of `()=>{}` below.
        //        Then, we need to add returned songs into the playlist in the success callback function.
        //        For now, setPlaylist() function does not support adding multiple songs at once, we might want to limit `max_result` as 1.
        //        It might be implemented similarly the `onClickSave()` function in the `SongInfoModal.js` file.
        const filter = { max_result: 1, playlist: props.resultList };
        getSimilarSongs(filter, successCallback, failureCallback);
        
        // TODO : Show a dialog that explain a song is added.
    };

    const onClickClearSong = (event) => {
        event.preventDefault();
        const swal = withReactContent(Swal);
        swal.fire({
            title: "Are you sure?",
            text: "Do you want to remove every song from the playlist?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#F64E60",
            confirmButtonText: "Remove All",
            customClass: {
                confirmButton: "small-font",
                cancelButton: "small-font"
            }                
        }).then(result => {
            if (result.value) {
                setPlaylist({
                    id: [],
                    type: "list"
                });
                showPlaylistDialog("removeAll");
            }
        });
    }

    return (
        <div>
            <PlaylistAnalysisLoading isLoading={isLoading} />
            <StringAnimation message={message} />

            <form onSubmit={onClickPickSong}>
                <input type="submit" className="submit-button" value="Give me song!" />
                <input type="button" className="cancel-button" value="Clear your list" onClick={onClickClearSong} />
            </form>

        </div>
    );
}

function PlaylistAnalysisLoading(props) {
    if (!props.isLoading) return (null);

    return (
        <div>
            <img src="img/loading.gif" alt="Loading" width="100px" />
        </div>
    );
}
