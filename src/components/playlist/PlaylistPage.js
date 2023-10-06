import React, { useState, useEffect } from 'react';
import { getSongListByIds, getSongDetailInfo } from '../common/JsonData';
import { usePlaylistState } from '../playlist/PlaylistContext';
import PlaylistAnalysis from './PlaylistAnalysis';
import PlaylistTable from './PlaylistTable';
import SongInfoModal from '../songinfo/SongInfoModal';

export default function PlaylistPage(props) {
    const [playlistName, setPlaylistName] = useState("");
    const [placeHolder, setPlaceHolder] = useState("");
    const [resultList, setResultList] = useState([]);
    const [songModal, setSongModal] = useState(false);
    const [songModalInfo, setSongModalInfo] = useState({});
    const [playlist] = usePlaylistState();

    // Call functions to retrieve json data.
    // Need to use useEffect() fuction to avoid infinite loop. 
    useEffect(() => {
        getSongListByIds(playlist, printSongListResult, errorSongListResult);

        if(props.user) {
            setPlaylistName(`${props.user.displayName}'s Playlist`);
        } else {
            setPlaylistName("Your Temporary Playlist (Sign in to save playlist)");
        }
    }, [playlist, props.user]);

    const errorSongListResult = () => {
        setResultList([]);
        setPlaceHolder("Oops! Error found. Please try again.");
    }

    // The callback event when getSongListByFeatures() is done successfully.
    const printSongListResult = (dataSet) => {
        // console.log(dataSet);

        if(dataSet.length > 0) {
            setResultList(dataSet);
            setPlaceHolder("");
        } else {
            setResultList([]);
            setPlaceHolder("No songs in the playlist. Add songs in the 'Search' and 'Recommendation' menus!");
        }
    };

    const openSongModal = (event, songId) => {
        event.preventDefault();

        getSongDetailInfo(
            songId, 
            (data) => { // For success callback
                setSongModalInfo(data);
                setSongModal(true);
            },
            () => { // For failure callback
                // Print only in the console window for this sub event.
                console.error("Error. Cannot retrieve the song info.");
            }
        );
    }

    const closeSongModal = () => {
        setSongModal(false);
    }

    return (
        <main>
            <section className="playlist-search">
                <h1>Playlist Generator</h1>
                <p>Save and play your favorite music! We will analyze the list and recommend music and artists that suit you.</p>
            </section>

            <section className="playlist-filter">
                <div className="playlist-filter-container">
                    <PlaylistAnalysis resultList={resultList} />
                </div>
            </section>

            <section className="playlist-list">
                <h1>{playlistName}</h1>
                <div className="playlist-list-container">
                    <PlaylistTable resultList={resultList} placeholder={placeHolder} onClickSong={openSongModal} />
                </div>
            </section>

            <section className="popup">
                <SongInfoModal isOpen={songModal} songInfo={songModalInfo} onClickClose={closeSongModal} />
            </section>
        </main>
    );
}