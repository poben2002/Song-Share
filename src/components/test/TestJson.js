import React, { useEffect, useState } from 'react';
import { getTestJson, getSongListByKeyword, getSongListByFeatures } from "../common/JsonData";

export default function TestJsonPage() {
    const [testResult, setTestResult] = useState("TBD");
    const [featureResult, setFeatureResult] = useState("TBD");
    const [keywordResult, setKeywordResult] = useState("TBD");

    // Call back functions
    const printTestJsonResult = (data) => {
        setTestResult(JSON.stringify(data, null, 2));
    };

    const printSongFeaturesResult = (data) => {
        setFeatureResult(JSON.stringify(data, null, 2));
    };

    const printSongKeywordResult = (data) => {
        setKeywordResult(JSON.stringify(data, null, 2));
    };

    // Call functions to retrieve json data.
    // Need to use useEffect() fuction to avoid infinite loop. 
    useEffect(() => {
        getTestJson(printTestJsonResult);

        const filter1 = {
            max_result: 3,
            keyword: "seattle",
        };
        getSongListByKeyword(filter1, printSongKeywordResult);

        const filter2 = {
            max_result: 3,
            danceability: 2,
            tempo: 2,
        };
        getSongListByFeatures(filter2, printSongFeaturesResult);
    }, []);

    return(
        <main>
            <h1>Test Json data Page</h1>

            <section className="testpage-section">
                <h1>All albums in 'test.json'</h1>

                <div className="testpage-container">
                    <pre>                        
                        { testResult }
                    </pre>
                </div>
            </section>

            <section className="testpage-section">
                <h1>All songs with 'Seattle' keyword (song, artist)</h1>

                <div className="testpage-container">
                    <pre>
                        { keywordResult }
                    </pre>
                </div>
            </section>

            <section className="testpage-section">
                <h1>Random 3 songs that have high danceability and fast tempo</h1>

                <div className="testpage-container">
                    <pre>
                        { featureResult }
                    </pre>
                </div>
            </section>
        </main>
    );
}
