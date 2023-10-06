import React, { useState } from 'react';
import { useOutletContext } from "react-router-dom";        
import SearchTable from "./SearchTable";
import { getSongListByKeyword } from '../common/JsonData';

export default function SearchPage() {
    const [placeHolder, setPlaceHolder] = useState("Please input a keyword in the above box.");
    const [filteredData, setFilteredData] = useState([]);
    const [openSongModal] = useOutletContext();

    // Processing async Json
    const searchSongs = (event) => {
        const searchFilter = {
            max_result: 50,
            keyword: event.target.value,
        };

        if (event.target.value !== "") {
            getSongListByKeyword(searchFilter, printSongKeywordsResult, errorSongKeywordsResult);
        } else {
            setFilteredData([]);
            setPlaceHolder("Please input a keyword in the above box.");
        }
    }

    const errorSongKeywordsResult = () => {
        setFilteredData([]);
        setPlaceHolder("Oops! Error found. Please try again.");
    }

    const printSongKeywordsResult = (dataSet) => {
        if (dataSet.length > 0) {
            const result = dataSet.map((item, idx) => {
                return ({
                    idx: idx + 1,
                    id: item.song_id,
                    title: item.song_name,
                    artist: item.artist_name,
                    artist_id: item.artist_id,
                    artist_link: true,
                    type: item.song_type,
                    genre: item.main_genre,
                });
            });

            setFilteredData(result);
        } else {
            setFilteredData([]);
            setPlaceHolder("No results found. Please try again with another keyword.");
        }

        // For debuging results
        // console.log(dataSet);
    }

    return (
        <div>
            <section className="searchTitle">
                <h1>Music Search</h1>
                <img className="searchImg" src="/img/search.jpg" alt="Song Search" />
                <p>Browse songs by preferred keywords! We currently have 20,405 songs in the database.</p>
            </section>
            <section className="searchResult">
                <div>
                    <input className="musicSearchBar" placeholder="Search for a song!" onChange={searchSongs} />
                    <SearchTable data={filteredData} placeholder={placeHolder} onClickSong={openSongModal} />
                </div>
            </section>
        </div>
    );
}
