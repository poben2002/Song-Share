const menuList = [{
    url: "/search", name: "Search", visible: 1,
}, {
    url: "/recommendation", name: "Recommendation", visible: 1,
}, {
    url: "/playlist", name: "Playlist", visible: 1,
}, {
    url: "/login", name: "Sign In", visible: 1, only_if_signed_in: 0,
}, {
    url: "/logout", name: "Sign Out", visible: 1, only_if_signed_in: 1, process_callback: 1,
}, {
    // Make sure to set visible to 0 for publishing
    url: "/test/json", name: "Test (Json)", visible: 0,
}, {
    // Make sure to set visible to 0 for publishing
    url: "/test/firebase", name: "Test (Firebase)", visible: 0,
}];

export default menuList;