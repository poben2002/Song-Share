import * as d3 from "d3-fetch";
import * as json5 from "json5";

// Json data group definition
const jsonDataGroups = {
    preprocessed_data: { json: "/data/preprocessed_data.json", key: "song_id", data: null, map: null },
    features: { json: "/data/acoustic_features.json", key: "song_id", data: null, map: null },
    albums: { json: "/data/albums.json", key: "album_id", data: null, map: null },
    artists: { json: "/data/artists.json", key: "artist_id", data: null, map: null },
    songs: { json: "/data/songs.json", key: "song_id", data: null, map: null },
    test: { json: "/data/test.json", key: "album_id", data: null, map: null },
};

// Function to load json data asynchronously.
// If it loads the given json file successfully, it calls the callback function with the loaded data
// and save such data into the cache so that it doesn't load our big json files twice.
const loadJsonData = (group, callbackSuccess, callbackFailure) => {
    const dataGroup = jsonDataGroups[group];
    if (dataGroup === undefined) {
        console.error("Json data group error : " + group);
        return;
    }

    // If data is already loaded, we don't need to load it again.
    // Just call the callback function with the cached data.
    if (dataGroup.data !== null) {
        // console.log("Used the cached data");
        callbackSuccess(dataGroup.data, dataGroup.map);
        return;
    }

    // This d3.json() function uses fetch() that the spec requires.
    // https://github.com/d3/d3-fetch/blob/main/src/json.js
    d3.json(dataGroup.json)
        .then((data) => {
            // Make a hashMap for search/join performance in advance
            const hashMap = new Map();
            for (const item of data) {
                hashMap.set(item[dataGroup.key], item);
            }

            // Update the cache data
            dataGroup.data = data;
            dataGroup.map = hashMap;

            // Call the given callback function
            callbackSuccess(dataGroup.data, dataGroup.map);
        })
        .catch((error) => {
            // Show an error message and it will try again later.
            callbackFailure(error);
            console.error(error);
        });
};

// Read song info from Json database and merge(left join) it with the given dataset.
// The given `dataSet` elements must have `song_id` property so that it uses for the join key.
// If the callback param is given, call it when it is done successfully.
const joinSongInfoIntoDataSet = (dataSet, callbackSuccess, callbackFailure) => {
    // If callback is not given, not need to proceed with.
    if (callbackSuccess === undefined) return;

    loadJsonData("songs", function (data, map) {
        const result = dataSet.map((item) => {
            if (item.song_id === undefined) return (item);

            const matchedItem = map.get(item.song_id);
            const mergedItem = { ...matchedItem, ...item };
            return (mergedItem);
        });

        callbackSuccess(result);
    }, callbackFailure);
};

// Read artist info from Json database and merge(left join) it with the given dataset.
// The given `dataSet` elements must have `artists` property so that it uses for the join key.
// If a song has 2 or more artists element, only the first artist will be joined.
// If the callback param is given, call it when it is done successfully.
const joinArtistInfoIntoDataSet = (dataSet, callbackSuccess, callbackFailure) => {
    // If callback is not given, not need to proceed with.
    if (callbackSuccess === undefined) return;

    loadJsonData("artists", function (data, map) {
        const result = dataSet.map((item) => {
            if (item.artists === undefined) return (item);

            // To parse single quote json, json5 is used.
            // https://stackoverflow.com/a/49188147
            const key = Object.keys(json5.parse(item.artists))[0];
            const matchedItem = map.get(key);
            const mergedItem = { ...matchedItem, ...item };
            return (mergedItem);
        });

        callbackSuccess(result);
    }, callbackFailure);
};

// Return song info in the test.json info.
export const getTestJson = (callback) => {
    // If callback is not given, not need to proceed with.
    if (callback === undefined) return;

    loadJsonData("test", function (dataSet) {
        if (callback !== undefined) {
            callback(dataSet);
        }
    });
};

// Read Json database and merge album, artist, songs data and return it.
// If the callback param is given, call it when it is done successfully.
export const getTestJoinedInfo = (filter, callbackSuccess, callbackFailure) => {
    // If callback is not given, not need to proceed with.
    if (callbackSuccess === undefined) return;

    loadJsonData("features", function (dataSet) {
        // Call join functions and the callback function
        joinSongInfoIntoDataSet(dataSet, (joinedSongDataSet) => {
            joinArtistInfoIntoDataSet(joinedSongDataSet, (joinedArtistDataSet) => {
                if (filter.max_result) {
                    if (joinedArtistDataSet.length > filter.max_result) {
                        joinedArtistDataSet = joinedArtistDataSet.slice(joinedArtistDataSet.length - filter.max_result);
                    }
                }

                // Filter the result
                const results = [];
                for (const song of joinedArtistDataSet) {
                    if (song.name === undefined) song.name = "Unknown";

                    song.artist_name = song.name;
                    song.song_name_lowercase = song.song_name.toLowerCase();
                    song.artist_name_lowercase = song.artist_name.toLowerCase();
                    delete song["name"];
                    results.push(song);
                }

                // Call the callback of the caller with the results.
                callbackSuccess(results);
            }, callbackFailure);
        }, callbackFailure);
    }, callbackFailure);
};

// Get similar songs based by the given songlist
export const getSimilarSongs = (filter, callbackSuccess, callbackFailure) => {
    loadJsonData("preprocessed_data", function (dataset) {
        if (callbackSuccess === undefined) return;

        // TODO : Caclulate average feature values of the songs in the `filter.playlist`.
        //        Also, store all genres and artist ids and types into the array in advance.
        const main_genres = [];
        const artist_ids = [];
        const artist_types = [];
        const avr_features = { 
            acousticness: 0, 
            danceability: 0, 
            energy: 0, 
            instrumentalness: 0, 
            liveness: 0, 
            loudness: 0, 
            speechiness: 0, 
            tempo: 0, 
            valence: 0, 
        };

        // Test log
        console.log(filter.playlist);
        console.log(main_genres);
        console.log(artist_ids);
        console.log(artist_types);
        console.log(avr_features);

        // TODO : Iterate all songs in the database, and calculate the match score. We can make a proper formula. 
        //        For example, if `song.artist` is in the `artist_ids` that we calculate, we can add 5pts.
        //        Also, if the different of each feature is less than somethings, we can add some points in proportion.
        //        If the match score is zero, we can drop it.
        const results = [];
        for (const song of dataset) {
            let match_score = 0;

            for (const feature in avr_features) {
                avr_features[feature] += song[feature];
            }
            main_genres.push(song.genre);
            artist_ids.push(song.artist_id);
            artist_types.push(song.artist_type);
            results.push({...song, match_score});
        }

        const numSongs = filter.playlist.length;
        for (const feature in avr_features) {
            avr_features[feature] /= numSongs;
        }

        for (const song of dataset) {
            let match_score = 0;

            if (artist_ids.includes(song.artist_id)) {
                match_score += 5;
            }
            if (main_genres.includes(song.genre)) {
                match_score += 3;
            }
            for (const feature in avr_features) {
                const diff = Math.abs(avr_features[feature] - song[feature]);
                if (diff < 0.1) {
                    match_score += 1;
                } else if (diff < 0.2) {
                    match_score += 0.5;
                }
            }
            //drop it
            if (match_score === 0) {
                //test
                console.log(match_score);
                continue;
            }
            results.push({ ...song, match_score });
        }

        // Test log
        console.log(results);

        // TODO : Sort the result by match_score and pick only the number of results specified in `filter.max_result`.
        //        It should be similar `shuffledResults` of `getSongListByFeatures()` function below.
        //        We might need to use `- value.match_score` instead of `Math.random()` for this sorting.
        //let sortedResults = results; // Should be replaced.

        // Test log. It must be listed in descending order by match score.
        console.log(sortedResults);
        const sortedResults = results.sort((a, b) => b.match_score - a.match_score).slice(0, filter.max_result);
        callbackSuccess(sortedResults);
    }, callbackFailure);
};

// Read Json database and filter songs based on genre filters. For the playlist generator function.
export const getSongByGenre = (filter, callbackSuccess, callbackFailure) => {
    loadJsonData("preprocessed_data", function (dataset) {
        if (callbackSuccess === undefined) return;

        const results = [];
        for (const song of dataset) {
            if (filter.Karoake && song.main_genre === 'karaoke') {
                results.push(song);
            } else if (filter.Country && song.main_genre && song.main_genre.includes('country')) {
                results.push(song);
            } else if (filter.HipHop && song.main_genre && song.main_genre.includes('hip hop')) {
                results.push(song);
            } else if (filter.RnB && song.main_genre && song.main_genre.includes('r&b')) {
                results.push(song);
            } else if (filter.Rock && song.main_genre && song.main_genre.includes('rock')) {
                results.push(song);
            } else if (filter.Latin && song.main_genre && song.main_genre.includes('latin')) {
                results.push(song);
            } else if (filter.Pop && song.main_genre && song.main_genre.includes('pop')) {
                results.push(song);
            }
        }
        callbackSuccess(results);
    }, callbackFailure);
};

// Read Json database and filter song lists based on the given filter.
// If the callback param is given, call it when it is done successfully.
// Please refer to RecommendationDefinition.js about filter properties.
export const getSongListByFeatures = (filter, callbackSuccess, callbackFailure) => {
    loadJsonData("features", function (dataSet) {
        // If callback is not given, not need to proceed with. (just caching data)
        if (callbackSuccess === undefined) return;

        // Filter the result
        const results = [];
        for (const song of dataSet) {
            if (filter.acousticness !== undefined) {
                const acousticness = Math.min(song.acousticness + 0.15, 1.0);
                if (acousticness < filter.acousticness * 0.334 || acousticness > (filter.acousticness + 1) * 0.334) continue;
            }

            if (filter.danceability !== undefined) {
                if (filter.danceability === 0) {
                    if (song.danceability > 0.4) continue;
                } else if (filter.danceability === 1) {
                    if (song.danceability < 0.4 || song.danceability > 0.60) continue;
                } else if (filter.danceability === 2) {
                    if (song.danceability < 0.60) continue;
                }
            }

            if (filter.energy !== undefined) {
                if (song.energy < filter.energy * 0.334 || song.energy > (filter.energy + 1) * 0.334) continue;
            }

            if (filter.instrumentalness !== undefined) {
                if (filter.instrumentalness === 0) {
                    if (song.instrumentalness !== 0) continue;
                } else if (filter.instrumentalness === 1) {
                    if (song.instrumentalness === 0 || song.instrumentalness > 0.00005) continue;
                } else if (filter.instrumentalness === 2) {
                    if (song.instrumentalness < 0.00005) continue;
                }
            }

            if (filter.liveness !== undefined) {
                const liveness = Math.min(song.liveness * 2.5, 1.0);
                if (liveness < filter.liveness * 0.334 || liveness > (filter.liveness + 1) * 0.334) continue;
            }

            if (filter.speechiness !== undefined) {
                const speechiness = Math.min(song.speechiness * 30, 3.0);

                if (filter.speechiness === 0) {
                    if (speechiness > 0.95) continue;
                } else if (filter.speechiness === 1) {
                    if (speechiness < 0.95 || speechiness > 1.7) continue;
                } else if (filter.speechiness === 2) {
                    if (speechiness < 1.7) continue;
                }
            }

            if (filter.valence !== undefined) {
                if (song.valence < filter.valence * 0.334 || song.valence > (filter.valence + 1) * 0.334) continue;
            }

            if (filter.loudness !== undefined) {
                let loudness = (song.loudness + 30) / 30.0;
                loudness = Math.max(Math.min(loudness, 1.0), 0);

                if (filter.loudness === 0) {
                    if (loudness > 0.6) continue;
                } else if (filter.loudness === 1) {
                    if (loudness < 0.6 || loudness > 0.7) continue;
                } else if (filter.loudness === 2) {
                    if (loudness < 0.7) continue;
                }
            }

            if (filter.tempo !== undefined) {
                let tempo = song.tempo / 230.0;
                tempo = Math.max(Math.min(tempo, 1.0), 0);

                if (filter.tempo === 0) {
                    if (tempo > 0.4) continue;
                } else if (filter.tempo === 1) {
                    if (tempo < 0.4 || tempo > 0.6) continue;
                } else if (filter.tempo === 2) {
                    if (tempo < 0.6) continue;
                }
            }

            results.push(song);
        }

        // For result debugging
        // console.log(results.length);

        // Shuffle the result array to choose random X songs.
        // https://stackoverflow.com/a/46545530
        let shuffledResults = results
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

        if (filter.max_result) {
            if (shuffledResults.length > filter.max_result) {
                shuffledResults = shuffledResults.slice(shuffledResults.length - filter.max_result);
            }
        }

        // Call join functions and the callback function
        // It is faster than `joined_data` dataset because it only calculates filtered recodes.
        joinSongInfoIntoDataSet(shuffledResults, (joinedSongResult) => {
            joinArtistInfoIntoDataSet(joinedSongResult, (joinedArtistResult) => {
                // Call the callback of the caller with the results.
                callbackSuccess(joinedArtistResult);
            }, callbackFailure);
        }, callbackFailure);
    }, callbackFailure);
};

export const getSongListByKeyword = (filter, callbackSuccess, callbackFailure) => {
    loadJsonData("preprocessed_data", function (dataSet) {
        // If callback is not given, not need to proceed with. (just caching data)
        if (callbackSuccess === undefined) return;

        // Change keyword to lowercase.
        const keyword = filter.keyword ? filter.keyword.toLowerCase().trim() : null;

        // Filter the result
        const results = [];
        for (const song of dataSet) {
            // string.indexOf seems the fastest way to find word in strings.
            // Also, to reduce string processing time, preprocessed_data.json has lowercase artist and song name in advance.
            // https://stackoverflow.com/questions/5296268/fastest-way-to-check-a-string-contain-another-substring-in-javascript
            if (keyword && song.song_name_lowercase.indexOf(keyword) === -1 && song.artist_name_lowercase.indexOf(keyword) === -1) {
                continue;
            }

            results.push(song);

            if (filter.max_result && results.length >= filter.max_result) break;
        }

        // Call the callback of the caller with the results.
        callbackSuccess(results);
    }, callbackFailure);
};

export const getSongListByArtist = (filter, callbackSuccess, callbackFailure) => {
    loadJsonData("preprocessed_data", function (dataSet) {
        // If callback is not given, not need to proceed with. (just caching data)
        if (callbackSuccess === undefined) return;

        // Change keyword to lowercase.
        const artist = filter.artist_id ? filter.artist_id.trim() : null;

        // Filter the result
        const results = [];
        for (const song of dataSet) {
            if (artist && song.artist_id !== artist) {
                continue;
            }

            results.push(song);

            if (filter.max_result && results.length >= filter.max_result) break;
        }

        // Call the callback of the caller with the results.
        callbackSuccess(results);
    }, callbackFailure);
};

export const getSongListByIds = (songIds, callbackSuccess, callbackFailure) => {
    loadJsonData("preprocessed_data", function (dataSet, dataMap) {
        // If callback is not given, not need to proceed with. (just caching data)
        if (callbackSuccess === undefined) return;

        const result = songIds.map((id) => {
            return(dataMap.get(id));
        });

        // Call the callback of the caller with the results.
        callbackSuccess(result);
    }, callbackFailure);
};

export const getSongDetailInfo = (songId, callbackSuccess, callbackFailure) => {
    loadJsonData("preprocessed_data", function (dataSet, dataMap) {
        // If callback is not given, not need to proceed with. (just caching data)
        if (callbackSuccess === undefined) return;

        // Call the callback of the caller with the results.
        const matchedItem = dataMap.get(songId);
        callbackSuccess(matchedItem);
    }, callbackFailure);
};

