import { getAuth,signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";

  const firebaseConfig = {
    apiKey: "AIzaSyC92G1LybSWu3463j1Wi0yjZaTzuiHcIMk",
    authDomain: "autocert-8319d.firebaseapp.com",
    projectId: "autocert-8319d",
    storageBucket: "autocert-8319d.firebasestorage.app",
    messagingSenderId: "941021055631",
    appId: "1:941021055631:web:ffbfae2bce3856f742fefa",
    measurementId: "G-Q7Z8VF2N2W"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

async function handleLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'form-builder.html';
        return userCredential.user;
    } catch (error) {
        console.error('Login failed:', error.code, error.message);
        alert(`Login failed: ${error.message}`);
        location.reload();
        throw error;
    }
}
document.getElementById('loginButton').addEventListener('click', async (event) => {
    event.preventDefault();
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    try {
        await handleLogin(email, password);
    } catch (error) {
    }
});