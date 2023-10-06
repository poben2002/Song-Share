import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import menuList from './MenuDefinition';
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2'

export default function Header(props) {    
    const navigate = useNavigate();

    const menuCallback = (event) => {
        const url = event.target.dataset.url;
        if (url === "/logout") {
            event.preventDefault();
            const swal = withReactContent(Swal);

            swal.fire({
                title: "Are you sure?",
                text: "Do you want to sign out?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#F64E60",
                confirmButtonText: "Sign Out",
                customClass: {
                    confirmButton: "small-font",
                    cancelButton: "small-font"
                }                
            }).then(result => {
                if (result.value) {
                    navigate(url);
                }
            });
        }
    }

    const allNavMenus = menuList.map((menu) => {
        // If the menu is not visible, just return.
        if(!menu.visible) return ("");

        if(menu.only_if_signed_in !== undefined) {
            // Implement 'only_if_signed_in' option. 
            // We might need to change "Sign In" / "Sign Out" status later.
            if(menu.only_if_signed_in === 1 && !props.user) return("");
            if(menu.only_if_signed_in === 0 && props.user) return("");
        }

        return (
            <li key={menu.url} className="nav-item">
                <Link to={menu.url} className="nav-link" data-url={menu.url} onClick={menu.process_callback ? menuCallback : null}>{menu.name}</Link>
            </li>
        )
    });

    return (
        <header>
            <nav>
                <ul className="nav-bar">
                    <li className="nav-logo">
                        <Link to="/">
                            <img className="nav-logo-lg" src="/img/logo.png" alt="Website Logo" />
                            <img className="nav-logo-sm" src="/img/logo_small.png" alt="Website Logo" />
                        </Link>
                    </li>

                    {allNavMenus}
                </ul>
            </nav>
        </header>
    );
}