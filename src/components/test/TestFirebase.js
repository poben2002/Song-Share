import React, { useEffect, useState } from 'react';
import { ref, getDatabase, onValue } from "firebase/database";

export default function TestFirebasePage() {
    const [dataResult, setDataResult] = useState([]);

    useEffect(() => {
        const db = getDatabase();
        const playlistRef = ref(db, "playlist");

        // It returns an event cleanup function. Please refer to textbook.
        // https://info340.github.io/firebase.html#listening-for-data-changes
        const unregisterFunction = onValue(playlistRef, (snapshot) => {
            const dataSet = snapshot.val();
            setDataResult(JSON.stringify(dataSet, null, 2));
        })

        // Cleanup function for when component is removed.
        function cleanup() {
            unregisterFunction();
        }

        return (cleanup);
    })

    return(
        <main>
            <h1>Test Firebase Page</h1>

            <section className="testpage-section">
                <h1>All song ids in the playlist in Realtime Firebase</h1>

                <div className="testpage-container">
                    <pre>                        
                        { dataResult }
                    </pre>
                </div>
            </section>
        </main>
    );
}
