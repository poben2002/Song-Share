import React from 'react';
import Swal from 'sweetalert2';
import { usePlaylistState } from '../playlist/PlaylistContext';
import { showPlaylistDialog } from './PlaylistDialog';
import { Link } from 'react-router-dom';
import { uppercaseFirstChar, makeYoutubeSearchString } from '../common/StringUtil';
import withReactContent from 'sweetalert2-react-content';

export default function PlaylistTable(props) {
    const [, setPlaylist] = usePlaylistState();

    const onClickDelete = (event, songId) => {
        event.preventDefault();
    
        const swal = withReactContent(Swal);
        swal.fire({
            title: "Are you sure?",
            text: "Do you want to remove this song from the playlist?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#F64E60",
            confirmButtonText: "Remove",
            customClass: {
                confirmButton: "small-font",
                cancelButton: "small-font"
            }                
        }).then(result => {
            if (result.value) {
                setPlaylist({
                    id: songId,
                    type: "delete",
                    onChanged: () => { showPlaylistDialog("remove"); }
                });
            }
        });
    }

    const allResults = props.resultList.map((item, idx) => {
        if (item === undefined) return (null);
        return (
            <PlaylistTableItem key={item.song_id} idx={idx} item={item} onClickSong={props.onClickSong} onClickDelete={onClickDelete} />
        )
    });

    return (
        <table>
            <thead>
                <tr>
                    <th scope="col" className="no">No</th>
                    <th scope="col" className="cover">Cover</th>
                    <th scope="col" className="song">Title</th>
                    <th scope="col" className="duration">Genre</th>
                    <th scope="col" className="duration">Duration</th>
                    <th scope="col" className="delete">Remove</th>
                    <th scope="col" className="play">Play</th>
                    <th scope="col" className="action">Actions</th>
                </tr>
            </thead>

            <tbody>
                {
                    (props.resultList.length > 0) ?
                        allResults
                        :
                        <tr height="100px">
                            <td colSpan="8">
                                {props.placeholder}
                            </td>
                        </tr>
                }
            </tbody>
        </table>
    );
}

export function PlaylistTableItem(props) {
    const item = props.item;

    let imageUrl = item.image_url;
    if (imageUrl === "-") imageUrl = "/img/feature1.jpg";

    const imageAlt = "Album cover of " + item.song_name;
    const duration = `${parseInt(parseInt(item.duration_ms / 1000) / 60)}' ${parseInt(item.duration_ms / 1000) % 60}"`;
    const play_link = makeYoutubeSearchString(item.song_name, item.artist_name);

    return (
        <tr>
            <td>{props.idx + 1}</td>
            <td className="cover">
                <img src={imageUrl} className="album" alt={imageAlt} />
            </td>
            <td className="song">
                <div className="song-title">
                    <Link to="#" className="song-link" onClick={(event) => props.onClickSong(event, item.song_id)}>
                        {item.song_name}
                    </Link>
                </div>
                <div className="song-artist">{item.artist_name}</div>
            </td>
            <td className="genre">{uppercaseFirstChar(item.main_genre)}</td>
            <td className="duration">{duration}</td>
            <td className="delete">
                <Link to="#" className="delete-link" onClick={(event) => props.onClickDelete(event, item.song_id)}>
                    <img src="/img/delete.png" className="action-button" alt="Delete Button" />
                </Link>
            </td>
            <td className="play">
                <Link to={play_link} className="youtube-link" target="_blank">
                    <img src="/img/youtube.png" className="action-button" alt="Play Button" />
                </Link>
            </td>
            <td className="action">
                <Link to="#" className="delete-link" onClick={(event) => props.onClickDelete(event, item.song_id)}>
                    <img src="/img/delete.png" className="action-button" alt="Delete Button" />
                </Link>
                <Link to={play_link} className="youtube-link" target="_blank">
                    <img src="/img/youtube.png" className="action-button" alt="Play Button" />
                </Link>
            </td>
        </tr>
    );
}
