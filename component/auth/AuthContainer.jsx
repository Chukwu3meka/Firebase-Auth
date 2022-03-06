import { connect } from "react-redux";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import {
  signOut,
  getRedirectResult,
  signInWithRedirect,
  linkWithCredential,
  GoogleAuthProvider,
  TwitterAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

import userControl from "@utils/userControl";
import { auth } from "@utils/firebaseClient";
import { setProfileAction } from "@store/actions";

import { fetcher } from "@utils/clientFuncs";
import { FacebookAuth, TwitterAuth, GoogleAuth, styles } from ".";

const providers = {
  google: new GoogleAuthProvider(),
  twitter: new TwitterAuthProvider(),
  facebook: new FacebookAuthProvider(),
};

const AuthContainer = (props) => {
  const { destroyCookie, saveCookie } = userControl(),
    { setProfileAction } = props,
    [online, setOnline] = useState(false),
    [authenticated, setAuthenticated] = useState(false);

  // detect when app is online/offline
  useEffect(() => setOnline(window.navigator.onLine));

  useEffect(() => {
    // there are other methods to auth users in firebase
    //  we won't use the signInWithPopup as its not usually mobile friendly
    //  so we'll call  signInWithRedirect to sign in by redirecting to the sign-in page,
    getRedirectResult(auth)
      .then(async (result) => {
        // if user has been authenticated already
        if (auth.currentUser) await authUser(auth.currentUser);
        // result = The signed-in user info.
        if (result) await authUser(result.user);
      })
      .catch(async (err) => {
        // resolve error from account-exists-with-different-credential
        const savedProvider = sessionStorage.getItem("providerType"); // get saved provider

        if (err?.code === "auth/account-exists-with-different-credential") {
          // The AuthCredential type that was used before conflict.
          // we'll get credential from the error
          const credential =
            savedProvider === "twitter"
              ? TwitterAuthProvider.credentialFromError(err)
              : savedProvider === "facebook"
              ? FacebookAuthProvider.credentialFromError(err)
              : null;

          // You can allow users to sign in to your app using multiple authentication providers
          //  by linking auth provider credentials to an existing user account.
          //  Users are identifiable by the same Firebase user ID
          //  regardless of the authentication provider they used to sign in.
          //  For example, a user who signed in with a password can link a Google account
          // and sign in with either method in the future.
          //  Or, an anonymous user can link a Facebook account and then, later,
          //  sign in with Facebook to continue using your app.

          linkWithCredential(auth.currentUser, credential)
            .then(() => sessionStorage.removeItem("providerType"))
            .catch(() => sessionStorage.removeItem("providerType"));
        }
      });
  }, []);

  const logoutHandler = async () => {
    setAuthenticated(false);
    try {
      await signOut(auth)
        .then(() => {
          // set reducer to empty opject on logout
          destroyCookie(); // delete cookies from userControl
        })
        .catch((error) => {
          throw error;
        });
    } catch (error) {
      process.env.NODE_ENV !== "production" && console.log("Signout err", error);
    }
  };

  const authUser = async (auth) => {
    if (auth) {
      const {
        uid,
        photoURL,
        displayName,
        stsTokenManager: { refreshToken },
      } = auth; // destrcture auth object

      // create profile in firestore, using pages/api
      const profile = await fetcher("/api/createProfile", JSON.stringify({ uid, displayName, photoURL, refreshToken }));

      if (profile) {
        setAuthenticated(profile);
        setProfileAction(profile);
        saveCookie(refreshToken);
      }
    }
  };

  const signInHandler = (e) => {
    if (online) {
      const providerType = e.target.id,
        provider = providers[providerType];

      signInWithRedirect(auth, provider);
      sessionStorage.setItem("providerType", providerType);
    } else {
      process.env.NODE_ENV !== "production" && console.log("You're not connected to the Internet");
    }
  };

  return (
    <div className={styles.auth}>
      {authenticated ? (
        <Button variant="contained" color="error" size="small" onClick={logoutHandler}>
          logout
        </Button>
      ) : (
        <>
          <TwitterAuth signInHandler={signInHandler} />
          <GoogleAuth signInHandler={signInHandler} />
          <FacebookAuth signInHandler={signInHandler} />
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
    online: state.device?.online,
  }),
  mapDispatchToProps = {
    setProfileAction,
  };

export default connect(mapStateToProps, mapDispatchToProps)(AuthContainer);
