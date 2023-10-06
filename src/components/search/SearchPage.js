import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { getSongDetailInfo } from '../common/JsonData';
import SongInfoModal from '../songinfo/SongInfoModal';

export default function SearchPage() {
    const [songModal, setSongModal] = useState(false);
    const [songModalInfo, setSongModalInfo] = useState({});

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
            <Outlet context={[openSongModal]} />

            <section className="popup">
                <SongInfoModal isOpen={songModal} songInfo={songModalInfo} onClickClose={closeSongModal} />
            </section>
        </main>
    );
}
