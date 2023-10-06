import React from 'react';
import { Link } from 'react-router-dom';
import { uppercaseFirstChar } from '../common/StringUtil';

// It has changed to a function type because our spec doesn't allow const 'components'.
// https://info340.github.io/code-style-guide.html#components-1
export default function SearchTable(props) {
    const allResults = props.data.map((item) => {
        return (
            <tr key={item.idx}>
                <td>
                    <Link to="#" className="song-link" onClick={(event) => props.onClickSong(event, item.id)}>
                        {item.title}
                    </Link>
                </td>
                <td>
                    {
                        (item.artist_link) ?
                            <Link to={`/search/${item.artist_id}`} className="song-link">
                                {item.artist}
                            </Link>
                        :
                        item.artist
                    }
                </td>
                <td className="search-details">{item.type}</td>
                <td className="search-details">{uppercaseFirstChar(item.genre)}</td>
            </tr>
        )
    });

    return (
        <div>
            <table className="resultsTbl">
                <thead>
                    <tr>
                        <th scope="col" width="40%">Title</th>
                        <th scope="col" width="30%">Artist</th>
                        <th scope="col" className="search-details">Song Type</th>
                        <th scope="col" className="search-details">Genre</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        (props.data.length > 0) ?
                            allResults
                            :
                            <tr height="60px">
                                <td colSpan="4">
                                    {props.placeholder}
                                </td>
                            </tr>
                    }
                </tbody>
            </table>
        </div>
    );
};
