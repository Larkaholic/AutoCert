// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC92G1LybSWu3463j1Wi0yjZaTzuiHcIMk",
  authDomain: "autocert-8319d.firebaseapp.com",
  projectId: "autocert-8319d",
  storageBucket: "autocert-8319d.firebasestorage.app",
  messagingSenderId: "941021055631",
  appId: "1:941021055631:web:ffbfae2bce3856f742fefa",
  measurementId: "G-Q7Z8VF2N2W"
};

// Initialize Firebase using the global firebase object from CDN
const app = firebase.initializeApp(firebaseConfig);

// Optionally, initialize analytics if needed
// const analytics = firebase.analytics();

export { app };