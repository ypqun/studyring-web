import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// ⚠️ 아래 값은 본인의 Firebase 프로젝트 설정으로 교체하세요.
// Firebase 콘솔 > 프로젝트 설정 > 일반 > 내 앱 > SDK 설정 및 구성 에서 확인할 수 있습니다.
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDp43P5AGP6bXNXAcy_f7M_m6he-4U-2Dk",
  authDomain: "studyring-398fc.firebaseapp.com",
  projectId: "studyring-398fc",
  storageBucket: "studyring-398fc.firebasestorage.app",
  messagingSenderId: "394337507689",
  appId: "1:394337507689:web:ecdc2bd58b238f0b91c5f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
