  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
  import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyC92G1LybSWu3463j1Wi0yjZaTzuiHcIMk",
    authDomain: "autocert-8319d.firebaseapp.com",
    projectId: "autocert-8319d",
    storageBucket: "autocert-8319d.firebasestorage.app",
    messagingSenderId: "941021055631",
    appId: "1:941021055631:web:ffbfae2bce3856f742fefa",
    measurementId: "G-Q7Z8VF2N2W"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);

  // Load event questions on page load
  document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const eventName = params.get('event');

    if (!eventName) {
      console.warn("No 'event' parameter found in URL.");
      return;
    }

    try {
      const eventRef = doc(db, "events", eventName);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) {
        console.warn(`Event '${eventName}' not found in Firestore.`);
        return;
      }

      const { questions = [] } = eventSnap.data();
      renderQuestions(questions);
    } catch (error) {
      console.error("Error fetching event questions:", error);
    }
  });

  // Render form inputs for each question
  function renderQuestions(questions) {
    const form = document.getElementById('user-feedback-form');
    if (!form) {
      console.warn("Form with id 'user-feedback-form' not found.");
      return;
    }

    form.innerHTML = questions.map((question, index) => `
      <div class="mb-4">
        <label for="question${index}" class="block text-lg font-semibold mb-2">${question}</label>
        <input 
          type="text" 
          id="question${index}" 
          name="question${index}" 
          class="w-full border rounded px-3 py-2 text-base" 
          required>
      </div>
    `).join('') + `
      <button type="submit" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Submit
      </button>
    `;
  }
