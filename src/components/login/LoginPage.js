import React, { useState, useEffect } from 'react';
import { getAuth, signOut, EmailAuthProvider, GoogleAuthProvider } from 'firebase/auth'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { useNavigate } from 'react-router-dom';

// We use 'option 1' for user authentication. So please do not install 'firebaseui'.
// Please see this section of textbook for details.
// https://info340.github.io/firebase.html#user-authentication

export default function LoginPage(props) {
    // Access the "authenticator"
    const auth = getAuth();
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const user = props.user;

    // Default config from the textbook.
    const firebaseUIConfig = {
        signInOptions: [ // Array of sign in options supported
            // Array can include just "Provider IDs", or objects with the IDs and options
            GoogleAuthProvider.PROVIDER_ID,
            { provider: EmailAuthProvider.PROVIDER_ID, requiredDisplayName: true },
        ],
        signInFlow: 'popup',      // Don't redirect to authenticate
        credentialHelper: 'none', // Don't show the email account chooser
        callbacks: {              // "lifecycle" callbacks
            signInSuccessWithAuthResult: () => {
                // Redirect to the main page after authentication
                navigate("/");
            }
        }
    }

    useEffect(() => {
        if (props.action === "logout") {
            // Logout request
            signOut(auth)
                .then(() => {
                    setMessage(
                        <div>
                            <p>You have successfully signed out.</p>
                            <p>Please click the button below to sign in again.</p>
                        </div>
                    );
                 })
                .catch((err) => {
                    console.error(err);
                    setMessage(
                        <div>
                            <p>Sorry, cannot sign out your ID.</p>
                            <p>Please click the button below to sign in again.</p>
                        </div>
                    );
                });
        } else {
            // Login in
            setMessage(
                <div>
                    <p>Welcome!</p>
                    <p>Sign in with your ID and have your own playlist.</p>
                </div>
            );
        }
    }, [auth, props.action]);

    return (
        <main>
            <h1>Login with Your ID</h1>
            <section className="login-buttons">
                <div className="login-messages">
                    {message}
                </div>
                {
                    !user ?
                        <StyledFirebaseAuth uiConfig={firebaseUIConfig} firebaseAuth={auth} />
                        :
                        null
                }
            </section>
        </main>
    );
}
