import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrWgHtAj5sik2Ap-DFUdY1cGsUosKvt0g",
  authDomain: "exelk-erp.firebaseapp.com",
  projectId: "exelk-erp",
  storageBucket: "exelk-erp.appspot.com",
  messagingSenderId: "806104452555",
  appId: "1:806104452555:web:9b7858a2adc93309b77a4e",
  measurementId: "G-1GC85TH3F6"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);
export {app, auth, firestore, storage,database};