
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  increment,
  onSnapshot,
  orderBy,
  arrayUnion,
  arrayRemove,
  collectionGroup
} from "firebase/firestore";
import { 
  getAuth, 
  signInAnonymously, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  reload,
  deleteUser
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBuIPLQfGGdpCgZXqYl593OaLQ0N22WfAE",
  authDomain: "bihonrainbow-47d31.firebaseapp.com",
  projectId: "bihonrainbow-47d31",
  storageBucket: "bihonrainbow-47d31.firebasestorage.app",
  messagingSenderId: "735310898882",
  appId: "1:735310898882:web:e3db323381e1e774e73d5b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Exporting necessary Firestore and Auth functionality
export { 
  db, 
  auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  reload,
  deleteUser,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  increment,
  onSnapshot,
  orderBy,
  arrayUnion,
  arrayRemove,
  collectionGroup
};
