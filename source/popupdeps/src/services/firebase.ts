import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth/web-extension';

const firebaseConfig = {
  apiKey: "AIzaSyAIG21DdrsL43TmiORMYPaLTQtlzblfO-E",
  authDomain: "mail-frames.firebaseapp.com",
  projectId: "mail-frames",
  storageBucket: "mail-frames.appspot.com",
  messagingSenderId: "650411795943",
  appId: "1:650411795943:web:d5a91e8ad24d39dddbc942",
  measurementId: "G-J9LJ4N5KJX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);