
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAZHbpzGu9n0TxaA19u2iJWHxUf63_mw08",
  authDomain: "ichy-dumpling-game.firebaseapp.com",
  projectId: "ichy-dumpling-game",
  storageBucket: "ichy-dumpling-game.firebasestorage.app",
  messagingSenderId: "748075974933",
  appId: "1:748075974933:web:3fa08a9b89f05e6990a91c",
};

const mysteryDumplingsConfig = {
  apiKey: "AIzaSyDvO3ZTn6qZtc87mbZDo3LBzQcJlAQ6_tw",
  authDomain: "squishy-dumplings-b6be5.firebaseapp.com",
  projectId: "squishy-dumplings-b6be5",
  storageBucket: "squishy-dumplings-b6be5.firebasestorage.app",
  messagingSenderId: "539390534494",
  appId: "1:539390534494:web:425697af77b971fa2225cf"
};

// Existing Ichy Dumpling Game
const app = getApps().find(
  (existingApp) => existingApp.name === "[DEFAULT]"
) ?? initializeApp(firebaseConfig);

export const db = getFirestore(app);

// New Mystery Dumplings game
const mysteryDumplingsApp = getApps().find(
  (existingApp) => existingApp.name === "mystery-dumplings"
) ?? initializeApp(mysteryDumplingsConfig, "mystery-dumplings");

export const mysteryDumplingsDb = getFirestore(mysteryDumplingsApp);

export const mysteryDumplingsAuth = getAuth(mysteryDumplingsApp);
