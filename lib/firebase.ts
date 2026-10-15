import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZHbpzGu9n0TxaA19u2iJWHxUf63_mw08",
  authDomain: "ichy-dumpling-game.firebaseapp.com",
  projectId: "ichy-dumpling-game",
  storageBucket: "ichy-dumpling-game.firebasestorage.app",
  messagingSenderId: "748075974933",
  appId: "1:748075974933:web:3fa08a9b89f05e6990a91c",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);