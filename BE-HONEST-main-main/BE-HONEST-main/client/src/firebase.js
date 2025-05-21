import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD7jMGgvbMadxcDc4FF5cc3vmlb04Jvd1A",
  authDomain: "behonest-df115.firebaseapp.com",
  projectId: "behonest-df115",
  storageBucket: "behonest-df115.appspot.com",
  messagingSenderId: "608865733789",
  appId: "1:608865733789:web:45d45479d818f88aa25874",
  measurementId: "G-15RHGRFGBL"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics }; 