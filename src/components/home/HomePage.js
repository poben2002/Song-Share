import React from 'react';
import HomePageCard from './HomePageCard';

export default function HomePage() {
    // Define menu list
    const menuList = [{
        name: "Music Search",
        image: "img/feature1.jpg",
        url: "search",
        desc: "Search for your favorite music and discover new artists.",
    }, {
        name: "Recommendations",
        image: "img/feature3.jpg",
        url: "recommendation",
        desc: "Get personalized song recommendations based on your preferences.",
    }, {
        name: "Playlist Generator",
        image: "img/feature4.jpg",
        url: "playlist",
        desc: "Create custom playlists based on your favorite artists and genres.",
    }];

    // Based on the spec, we should use map() to repeat DOM objects.
    const allMenuCards = menuList.map((menuInfo) => {
        return (
            <HomePageCard key={menuInfo.url} menuInfo={menuInfo} />
        )
    });

    return (
        <main>
            <section className="main-title">
                <h1>Find New Music</h1>
            </section>

            <section className="features">
                <div className="card-container">
                    {allMenuCards}
                </div>
            </section>
        </main>
    );
}
