import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2'
// import { remove } from 'firebase/database';

// Just for peer review!
// It is not a good coding practice to write redundant code blocks.
// So, it should be back to the inline comparison or make an extra variable.
export const showPlaylistDialog = (type) => {    
    const swal = withReactContent(Swal);
    swal.fire({
        title: type === "add" ? "Added" : "Removed",
        text: type === "add" ? "This song has been added to the playlist." 
        : type === "remove" ? "This song has been removed from the playlist."
        : "The playlist has been successfully cleared.",
        icon: "success",
        timerProgressBar: true,
        confirmButtonColor: "#508050",
        confirmButtonText: "Okay",
        customClass: {
            confirmButton: "small-font",
        }
    })
}
