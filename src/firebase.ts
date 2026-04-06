import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// PackAssist Demo – Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbCiNWxxn0cIaPjxD2EKYcZi4hQ_VsM-o",
  authDomain: "packassist-demo.firebaseapp.com",
  projectId: "packassist-demo",
  storageBucket: "packassist-demo.firebasestorage.app",
  messagingSenderId: "481004399961",
  appId: "1:481004399961:web:35d13b98b205b01c4eb048",
  measurementId: "G-7YRTNKYGPF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
