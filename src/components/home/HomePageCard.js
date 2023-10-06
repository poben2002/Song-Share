import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePageCard(props) {
    const menu = props.menuInfo;

    return (
        <div className="card glow">
            <Link to={menu.url}>
                <h2>{menu.name}</h2>
                <img src={menu.image} alt={menu.name} />
                <p>{menu.desc}</p>
            </Link>
        </div>
    );
}
