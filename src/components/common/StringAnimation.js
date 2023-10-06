import React, { useEffect, useState, useRef } from 'react';

// Component to express typing animation.
// It is not perfrect for hot-loading.
export function StringAnimation(props) {
    const [cursur, setCursor] = useState("");
    const [text, setText] = useState("");
    const [fullText, setFullText] = useState("");
    const [index, setIndex] = useState(0);
    const uId = useRef(0);

    useEffect(() => {
        uId.current ++;
        setFullText(props.message);
        setText("");
        setIndex(0);
    }, [props.message]);

    useEffect(() => {
        const currentUid = uId.current;

        if (index < fullText.length) {
            setTimeout(() => {
                if(currentUid !== uId.current) return;

                setText(fullText.substring(0, index));
                setCursor("|");
                setIndex(index + 1);
            }, Math.random() * 25)
        } else {
            setTimeout(() => {
                if(currentUid !== uId.current) return;

                setCursor(index % 2 ? "|" : " ");
                setText(fullText);
                setIndex(index + 1);
            }, 300)
        }
    }, [index, text, fullText, uId]);

    return (
        <div>
            <p>
                {text}{cursur}
            </p>
        </div>
    );
}
