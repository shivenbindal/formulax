import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyC3Wql5FbrXI6ONJfWHdAk_LTxVej23T2Y",
  authDomain: "formulax-daa25.firebaseapp.com",
  projectId: "formulax-daa25",
  storageBucket: "formulax-daa25.firebasestorage.app",
  messagingSenderId: "192732251648",
  appId: "1:192732251648:web:2122ca826f48d47a363ae5"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)