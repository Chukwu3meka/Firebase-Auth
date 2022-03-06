import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// check if app has been initialized
if (!getApps().length) {
  // parse env key stored as JSON and initialize app
  initializeApp(JSON.parse(process.env.NEXT_PUBLIC_CLIENT));
}

const firestore = getFirestore(); //firebase instance
const auth = getAuth(); //auth instance

export { firestore, auth };
