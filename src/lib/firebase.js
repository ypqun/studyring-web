import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDp43P5AGP6bXNXAcy_f7M_m6he-4U-2Dk",
  authDomain: "studyring-398fc.firebaseapp.com",
  projectId: "studyring-398fc",
  storageBucket: "studyring-398fc.firebasestorage.app",
  messagingSenderId: "394337507689",
  appId: "1:394337507689:web:ecdc2bd58b238f0b91c5f8"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app