// Capitalize the first character in the string
export const uppercaseFirstChar = (str) => {
    return (str.charAt(0).toUpperCase() + str.slice(1));
};

// Make a search string format for YouTube
export const makeYoutubeSearchString = (song, artist) => {
    let keyword = `${song} by ${artist}`;
    keyword = encodeURIComponent(keyword);
    keyword = keyword.toLowerCase().replace(/%20/g, "+");

    const link = `https://youtube.com/results?search_query=${keyword}`;
    return (link);
};
