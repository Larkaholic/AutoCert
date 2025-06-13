import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

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

let eventQuestions = [];
let userInfo = {};

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
    eventQuestions = questions; // Store questions globally
    renderUserInfoForm(); // Show user info form first
  } catch (error) {
    console.error("Error fetching event questions:", error);
  }
});

// Render the user info form (step 1)
function renderUserInfoForm() {
  const form = document.getElementById('user-feedback-form');
  if (!form) {
    console.warn("Form with id 'user-feedback-form' not found.");
    return;
  }

  form.innerHTML = `
    <div class="mb-6">
      <label for="userName" class="block text-white text-lg font-semibold mb-3">Full Name</label>
      <input 
        type="text" 
        id="userName" 
        name="userName" 
        class="w-full bg-black/30 border border-[#6ee7b7] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6ee7b7]" 
        required>
    </div>
    <div class="mb-6">
      <label for="userEmail" class="block text-white text-lg font-semibold mb-3">Email Address</label>
      <input 
        type="email" 
        id="userEmail" 
        name="userEmail" 
        class="w-full bg-black/30 border border-[#6ee7b7] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6ee7b7]" 
        required>
    </div>
    <div class="flex justify-center mt-8">
      <button type="button" id="nextButton" class="w-72 h-16 rounded-xl border border-[#6ee7b7] text-white text-lg font-semibold transition hover:bg-[#134e2f]/30 focus:outline-none">
        Next
      </button>
    </div>
  `;

  // Add next button event listener
  document.getElementById('nextButton').addEventListener('click', handleUserInfoNext);
}

// Handle "Next" button click on user info form
function handleUserInfoNext() {
  const nameInput = document.getElementById('userName');
  const emailInput = document.getElementById('userEmail');
  
  // Basic validation
  if (!nameInput.value || !emailInput.value) {
    alert("Please fill out all fields");
    return;
  }
  
  // Store user info
  userInfo = {
    name: nameInput.value,
    email: emailInput.value
  };
  
  // Show feedback questions form
  renderQuestionsForm(eventQuestions);
}

// Render feedback questions form (step 2)
function renderQuestionsForm(questions) {
  const form = document.getElementById('user-feedback-form');
  if (!form) {
    console.warn("Form with id 'user-feedback-form' not found.");
    return;
  }

  form.innerHTML = `
    <h2 class="text-white text-xl font-bold mb-6">Feedback for ${userInfo.name}</h2>
    ${questions.map((question, index) => `
      <div class="mb-6">
        <label for="question${index}" class="block text-white text-lg font-semibold mb-3">${question}</label>
        <input 
          type="text" 
          id="question${index}" 
          name="question${index}" 
          class="w-full bg-black/30 border border-[#6ee7b7] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6ee7b7]" 
          required>
      </div>
    `).join('')}
    <div class="flex justify-center mt-8">
      <button type="submit" class="w-72 h-16 rounded-xl border border-[#6ee7b7] text-white text-lg font-semibold transition hover:bg-[#134e2f]/30 focus:outline-none">
        Submit
      </button>
    </div>
  `;

  // Add form submission event listener
  form.addEventListener('submit', handleFormSubmit);
}

// Handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const params = new URLSearchParams(window.location.search);
  const eventName = params.get('event');
  
  // Create data object with stored user info and form responses
  const userData = {
    name: userInfo.name,
    email: userInfo.email,
    eventName: eventName,
    timestamp: serverTimestamp(),
    responses: {}
  };

  // Add question responses
  for (const [name, value] of formData.entries()) {
    if (name.startsWith('question')) {
      userData.responses[name] = value;
    }
  }

  try {
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;

    // Save data to Firestore
    const docRef = await addDoc(collection(db, "certificates"), userData);
    console.log("Document written with ID: ", docRef.id);
    
    // Redirect to success page with the certificate ID
    window.location.href = `certificate.html?id=${docRef.id}`;
    
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("An error occurred. Please try again.");
    
    // Reset button
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}
