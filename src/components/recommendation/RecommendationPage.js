import React, { useState } from 'react';
import filterList from './RecommendationDefinition';
import RecommendationFilter from './RecommendationFilter';
import RecommendationResult from './RecommendationResult';
import { getSongListByFeatures, getSongDetailInfo } from "../common/JsonData";
import SongInfoModal from '../songinfo/SongInfoModal';

export default function RecommendationPage() {
    const [placeHolder, setPlaceHolder] = useState("Adjust the filter and click 'Pick Songs' button.");
    const [resultList, setResultList] = useState([]);
    const [songModal, setSongModal] = useState(false);
    const [songModalInfo, setSongModalInfo] = useState({});

    // The callback event when users click on submit button.
    const onFormSubmit = (event) => {
        event.preventDefault();

        // Make a search filter object.
        const searchFilter = { max_result: 5 };
        filterList.forEach((filterItem, idx) => {
            searchFilter[filterItem.id] = parseInt(event.target[idx].value);
        });
    
        getSongListByFeatures(searchFilter, printSongFeaturesResult, errorSongFeaturesResult);
    };

    const errorSongFeaturesResult = () => {
        setResultList([]);
        setPlaceHolder("Oops! Error found. Please try again.");
    }

    // The callback event when getSongListByFeatures() is done successfully.
    const printSongFeaturesResult = (dataSet) => {
        if(dataSet.length > 0) {
            const result = dataSet.map((item, idx) => {
                let imageUrl = item.image_url;
                if(imageUrl === "-") imageUrl = "/img/feature1.jpg";

                let popularity = (item.popularity / 20) + 1;
                popularity = Math.max(Math.min(popularity, 5), 0);

                const duration = `${parseInt(parseInt(item.duration_ms / 1000) / 60)}' ${parseInt(item.duration_ms / 1000) % 60}"`;

                return({
                    idx: idx + 1,
                    id: item.song_id,
                    title: item.song_name,
                    artist: item.name,
                    image: imageUrl,
                    duration: duration,
                    popularity: popularity, 
                    match: parseInt(item.followers).toLocaleString(),
                });
            });
    
            setResultList(result);
        } else {
            setResultList([]);
            setPlaceHolder("No results found. Please adjust the filters and search again.");
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
            <section className="filter">
                <h1>Music Recommendations</h1>
                <p>Move the bar to choose your favorite music style. The more the bar fills, the more you like that feature.</p>
                <RecommendationFilter onFormSubmit={onFormSubmit} />
            </section>

            <section className="recommdation">
                <h1>Music for You</h1>

                <div className="recommdation-container">
                    <RecommendationResult resultList={resultList} placeholder={placeHolder} onClickSong={openSongModal}/>
                </div>
            </section>

            <section className="popup">
                <SongInfoModal isOpen={songModal} songInfo={songModalInfo} onClickClose={closeSongModal} />
            </section>
        </main>
    );
}
