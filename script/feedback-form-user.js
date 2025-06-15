import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

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
  const infoContainer = document.getElementById('user-info-form-container');
  const questionsContainer = document.getElementById('questions-form-container');
  if (!infoContainer) return;

  // Show info form, hide questions form
  infoContainer.classList.remove('hidden');
  if (questionsContainer) questionsContainer.classList.add('hidden');

  const form = document.getElementById('user-info-form');
  if (!form) return;

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

  document.getElementById('nextButton').onclick = handleUserInfoNext;
}

// Handle "Next" button click on user info form
function handleUserInfoNext() {
  const nameInput = document.getElementById('userName');
  const emailInput = document.getElementById('userEmail');
  if (!nameInput.value || !emailInput.value) {
    alert("Please fill out all fields");
    return;
  }
  userInfo = {
    name: nameInput.value,
    email: emailInput.value
  };
  renderQuestionsForm(eventQuestions);
}

// Render feedback questions form (step 2)
function renderQuestionsForm(questions) {
  const infoContainer = document.getElementById('user-info-form-container');
  const questionsContainer = document.getElementById('questions-form-container');
  if (!questionsContainer) return;

  // Hide info form, show questions form
  if (infoContainer) infoContainer.classList.add('hidden');
  questionsContainer.classList.remove('hidden');

  const form = document.getElementById('user-questions-form');
  if (!form) return;

  form.innerHTML = `
    <h2 class="text-white text-xl font-bold mb-6">Feedback for ${userInfo.name}</h2>
    <div class="overflow-y-auto max-h-[60vh]">
      ${questions.map((question, index) => {
        let qText = "";
        let qType = "text";
        if (typeof question === "object" && question !== null) {
          qText = question.text || question.label || question.question || "";
          qType = question.type || "text";
        } else {
          qText = question;
        }

        if (qType === "rating") {
          return `
            <div class="mb-6">
              <label class="block text-white text-lg font-semibold mb-3">${qText}</label>
              <div class="flex items-center justify-center gap-3" id="rating-stars-${index}">
                ${[1,2,3,4,5].map(i => `
                  <svg data-value="${i}" class="star w-8 h-8 cursor-pointer text-gray-400 hover:text-yellow-400 transition-colors mx-1" fill="currentColor" viewBox="0 0 20 20">
                    <polygon points="10,1 12.59,7.36 19.51,7.64 14,12.14 15.82,18.99 10,15.27 4.18,18.99 6,12.14 0.49,7.64 7.41,7.36"/>
                  </svg>
                `).join('')}
                <input type="hidden" id="question${index}" name="question${index}" required>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="mb-6">
              <label for="question${index}" class="block text-white text-lg font-semibold mb-3">
                ${qText}
              </label>
              <input 
                type="text" 
                id="question${index}" 
                name="question${index}" 
                class="w-full bg-black/30 border border-[#6ee7b7] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6ee7b7]" 
                required>
            </div>
          `;
        }
      }).join('')}
    </div>
    <div class="flex justify-center mt-8">
      <button type="submit" class="w-72 h-16 rounded-xl border border-[#6ee7b7] text-white text-lg font-semibold transition hover:bg-[#134e2f]/30 focus:outline-none">
        Submit
      </button>
    </div>
  `;

  // Add star rating event listeners
  questions.forEach((question, index) => {
    let qType = typeof question === "object" && question !== null ? question.type || "text" : "text";
    if (qType === "rating") {
      const stars = form.querySelectorAll(`#rating-stars-${index} .star`);
      const hiddenInput = form.querySelector(`#question${index}`);
      stars.forEach((star, i) => {
        star.addEventListener('click', () => {
          // Set value
          hiddenInput.value = i + 1;
          // Highlight stars
          stars.forEach((s, j) => {
            s.classList.toggle('text-yellow-400', j <= i);
            s.classList.toggle('text-gray-400', j > i);
          });
        });
      });
    }
  });

  form.onsubmit = handleFormSubmit;
}

// Handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const params = new URLSearchParams(window.location.search);
  const eventName = params.get('event');
  const userData = {
    name: userInfo.name,
    email: userInfo.email,
    eventName: eventName,
    timestamp: serverTimestamp(),
    responses: {}
  };
  for (const [name, value] of formData.entries()) {
    if (name.startsWith('question')) {
      userData.responses[name] = value;
    }
  }
  try {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;
    const docRef = await addDoc(collection(db, "certificates"), userData);

    // Fetch the certificate image URL from Firestore (assume stored in event doc as 'certificateUrl')
    let certificateUrl = '';
    try {
      const eventRef = doc(db, "events", eventName);
      const eventSnap = await getDoc(eventRef);
      certificateUrl = eventSnap.exists() && eventSnap.data().certificateUrl
        ? eventSnap.data().certificateUrl
        : '';
    } catch (e) {
      certificateUrl = '';
    }

    // Show modal with download button
    showCertificateModal(certificateUrl || 'certificate-default.png');

    // Optionally, reset form or hide it
    form.reset();
    form.classList.add('hidden');
  } catch (error) {
    alert("An error occurred. Please try again.");
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = "Submit";
      submitButton.disabled = false;
    }
  }
}

// Add this function to show the modal
function showCertificateModal(certificateUrl) {
  let modal = document.getElementById('certificateReadyModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'certificateReadyModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60';
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-8 flex flex-col items-center max-w-md w-full">
        <div class="text-2xl font-bold mb-4 text-[#00691c]">Your certificate is ready</div>
        <button id="downloadCertBtn" class="mb-4 px-6 py-2 rounded bg-[#232b2b] text-white border border-[#3be382] hover:bg-[#1a1a1a]">Download Certificate</button>
        <button id="closeCertModalBtn" class="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.classList.remove('hidden');
  }

  const downloadBtn = document.getElementById('downloadCertBtn');
  if (downloadBtn) {
    downloadBtn.onclick = async () => {
      if (!certificateUrl) {
        alert("Certificate image not available.");
        return;
      }
      const userName = userInfo.name || "Participant";
      // Fetch placement from Firestore
      const params = new URLSearchParams(window.location.search);
      const eventName = params.get('event');
      let placement = { x: 0.5, y: 0.51, fontSize: 0.055, fontFamily: 'Montserrat, Arial, sans-serif', fill: '#1a2a3a' };
      try {
        const eventRef = doc(db, "events", eventName);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists() && eventSnap.data().namePlacement) {
          placement = Object.assign(placement, eventSnap.data().namePlacement);
        }
      } catch (e) {}
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        ctx.font = `bold ${Math.floor(canvas.height * (placement.fontSize || 0.055))}px ${placement.fontFamily || 'Montserrat, Arial, sans-serif'}`;
        ctx.fillStyle = placement.fill || "#1a2a3a";
        ctx.textAlign = "center";
        ctx.fillText(userName, canvas.width * (placement.x || 0.5), canvas.height * (placement.y || 0.51));
        const a = document.createElement('a');
        a.href = canvas.toDataURL("image/png");
        a.download = 'certificate.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
      };
      img.onerror = function() {
        alert("Failed to load certificate image.");
      };
      img.src = certificateUrl;
    };
  }

  const closeBtn = document.getElementById('closeCertModalBtn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.classList.add('hidden');
    };
  }
}