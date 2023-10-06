import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import SearchTable from "./SearchTable";
import { getSongListByArtist } from '../common/JsonData';

export default function SearchDetail() {
    const [placeHolder , setPlaceHolder] = useState("There are no songs of the artist.");
    const [filteredData, setFilteredData] = useState([]);
    const [openSongModal] = useOutletContext();
    const navigate = useNavigate();
    const params = useParams();
    const artist = params.artistId;

    // Make the song list of the artist and store them into `filteredData`
    useEffect(() => {
        const searchFilter = { max_result: 20, artist_id: artist };
        getSongListByArtist(searchFilter, printSongListResult, errorSongListResult);

    }, [artist]);

    const errorSongListResult = () => {
        setFilteredData([]);
        setPlaceHolder("Oops! Error found. Please try again.");
    }

    // The callback event when getSongListByFeatures() is done successfully.
    const printSongListResult = (dataSet) => {
        if(dataSet.length > 0) {
            const result = dataSet.map((item, idx) => {
                return ({
                    idx: idx + 1,
                    id: item.song_id,
                    title: item.song_name,
                    artist: item.artist_name,
                    artist_id: item.artist_id,
                    artist_link: false,
                    type: item.song_type,
                    genre: item.main_genre,
                });
            });

            setFilteredData(result);
        } else {
            setFilteredData([]);
            setPlaceHolder("There are no songs of the artist.");
        }
    };

    return (
        <main>
            <section className="searchTitle">
                <h1>Music Search by Artist</h1>
                <img className="searchImg" src="/img/search.jpg" alt="Song Search" />
                <p>Discover More Songs by the Artist!</p>

                <div>
                    <input type="button" className="submit-button" value="Go back to Search" onClick={() => navigate(-1)} />
                </div>
            </section>
            <section className="searchResult">
                <div>
                    <SearchTable data={filteredData} placeholder={placeHolder} onClickSong={openSongModal} />
                </div>
            </section>
        </main>
    );
}
