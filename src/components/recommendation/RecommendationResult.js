import React from 'react';
import { Link } from 'react-router-dom';

export default function RecommendationFilter(props) {
    // Based on the spec, we should use map() to repeat DOM objects.
    const allResults = props.resultList.map((resultItem) => {
        return (
            <RecommendationResultItem key={resultItem.id} resultItem={resultItem} onClickSong={props.onClickSong}/>
        )
    });

    return (
        <table>
            <thead>
                <tr>
                    <th scope="col" className="no">No</th>
                    <th scope="col" className="cover">Cover</th>
                    <th scope="col" className="song">Title</th>
                    <th scope="col" className="duration">Duration</th>
                    <th scope="col" className="popularity">Popularity</th>
                    <th scope="col" className="followers">Followers</th>
                </tr>
            </thead>

            <tbody>
                {
                    (props.resultList.length > 0) ?
                        allResults
                        :
                        <tr height="100px">
                            <td colSpan="6">
                                {props.placeholder}
                            </td>
                        </tr>
                }
            </tbody>
        </table>
    );
}

export function RecommendationResultItem(props) {
    const item = props.resultItem;
    const imageAlt = "Album cover of " + item.title;

    const starImages = [];
    for (let i = 0; i < item.popularity; ++i) {
        starImages.push(
            <img key={i} src="/img/star.svg" alt="Star" />
        );
    }

    return (
        <tr>
            <td>{item.idx}</td>
            <td className="cover">
                <img src={item.image} className="album" alt={imageAlt} />
            </td>
            <td className="song">
                <div className="song-title">
                    <Link to="#" className="song-link" onClick={(event) => props.onClickSong(event, item.id)}>
                        {item.title}
                    </Link>
                </div>
                <div className="song-artist">{item.artist}</div>
            </td>
            <td className="duration">{item.duration}</td>
            <td className="popularity">{starImages}</td>
            <td className="followers">{item.match}</td>
        </tr>
    );
}
