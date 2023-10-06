import React, { useState, useEffect } from 'react';
import * as json5 from "json5";
import { uppercaseFirstChar } from "../common/StringUtil";
import { usePlaylistState } from '../playlist/PlaylistContext';
import { showPlaylistDialog } from '../playlist/PlaylistDialog';

export default function SongInfoModal(props) {
    const [playlist, setPlaylist] = usePlaylistState();
    const [isIncluded, setIsIncluded] = useState(false);

    const item = props.songInfo;

    // Check if it is already in the playlist
    useEffect(() => {
        if (playlist && playlist.includes(item.song_id)) {
            setIsIncluded(true);
        } else {
            setIsIncluded(false);
        }
    }, [playlist, item.song_id]);

    // If the modal is not open, just return null
    if (!props.isOpen) return (null);

    const starImages = [];
    let popularity = (item.popularity / 20) + 1;
    popularity = Math.max(Math.min(popularity, 5), 0);

    for (let i = 0; i < popularity; ++i) {
        starImages.push(
            <img key={i} src="/img/star.svg" alt="Star" className="small-star" />
        );
    }

    const duration = `${parseInt(parseInt(item.duration_ms / 1000) / 60)}' ${parseInt(item.duration_ms / 1000) % 60}"`;

    const genres = json5.parse(item.genres);
    let genreList = [];

    if (genres !== null && genres !== []) {
        genreList = genres.map((item, idx) => {
            return (
                <div key={idx} className="tag">
                    {uppercaseFirstChar(item)}
                </div>
            );
        });
    }

    // The callback event when users click on submit button.
    const onClickSave = (event) => {
        event.preventDefault();
        const type = !isIncluded ? "add" : "delete";

        setPlaylist({
            id: item.song_id,
            type: type,
            onChanged: () => { showPlaylistDialog(type); }
        });

        props.onClickClose();
    };

    return (
        <div onClick={props.onClickClose} className="overlay">
            <form onSubmit={onClickSave}>
                <div onClick={(e) => { e.stopPropagation(); }} className="modal-container">
                    <div className="modal-container-background" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${item.image_url})` }}>
                        <div className="modal-container-title">
                            <div className="song-title">{item.song_name}</div>
                            <div>{item.artist_name}</div>
                        </div>

                        <hr />

                        <div className="modal-container-contents-twice-line">
                            <div>
                                Artist Type : {uppercaseFirstChar(item.artist_type)}
                            </div>
                            <div>
                                Song Type : {uppercaseFirstChar(item.song_type)}
                            </div>
                        </div>

                        <div className="modal-container-contents-twice-line">
                            <div>
                                Duration : {duration}
                            </div>
                            <div>
                                Tempo : {`${Math.round(item.tempo)} bpm`}
                            </div>
                        </div>


                        <div className="modal-container-contents-twice-line">
                            <div>
                                Followers : {parseInt(item.followers).toLocaleString()}
                            </div>
                            <div>
                                Popularity : {starImages}
                            </div>
                        </div>


                        <div className="modal-container-contents">
                            <table>
                                <tbody>
                                    <tr>
                                        <td className="song-feature">Acousticness</td>
                                        <td>{`${Number(item.acousticness * 100).toFixed(1)}%`}</td>
                                        <td className="song-feature">Danceability</td>
                                        <td>{`${Number(item.danceability * 100).toFixed(1)}%`}</td>
                                    </tr>
                                    <tr>
                                        <td className="song-feature">Energy</td>
                                        <td>{`${Number(item.energy * 100).toFixed(1)}%`}</td>
                                        <td className="song-feature">Instrument</td>
                                        <td>{`${Math.min(100.0, Number(item.instrumentalness * 100 * 10000)).toFixed(1)}%`}</td>
                                    </tr>
                                    <tr>
                                        <td className="song-feature">Liveness</td>
                                        <td>{`${Number(item.liveness * 100).toFixed(1)}%`}</td>
                                        <td className="song-feature">Speechiness</td>
                                        <td>{`${Math.min(100.0, Number(item.speechiness * 100 * 10)).toFixed(1)}%`}</td>
                                    </tr>
                                    <tr>
                                        <td className="song-feature">Valence</td>
                                        <td>{`${Number(item.valence * 100).toFixed(1)}%`}</td>
                                        <td className="song-feature">Loudness</td>
                                        <td>{`${Number(item.loudness).toFixed(1)}dB`}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="modal-container-contents-single-line">
                            <div className="modal-container-contents-tags">
                                {genreList}
                            </div>
                        </div>
                    </div>

                    <div className="modal-container-buttons">
                        <div>
                            {
                                !isIncluded ?
                                    <input type="submit" className="submit-button" value="Add to Playlist" />
                                    :
                                    <input type="submit" className="delete-button" value="Remove from Playlist" />
                            }
                        </div>
                        <div>
                            <input type="button" className="cancel-button" value="Close" onClick={props.onClickClose} />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};