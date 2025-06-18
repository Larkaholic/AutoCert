const firebaseConfig = {
    apiKey: "AIzaSyC92G1LybSWu3463j1Wi0yjZaTzuiHcIMk",
    authDomain: "autocert-8319d.firebaseapp.com",
    projectId: "autocert-8319d",
    storageBucket: "autocert-8319d.firebasestorage.app",
    messagingSenderId: "941021055631",
    appId: "1:941021055631:web:ffbfae2bce3856f742fefa",
    measurementId: "G-Q7Z8VF2N2W"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const eventSelect = document.getElementById("eventSelect");
const resultsContainer = document.getElementById("resultsContainer");

// Populate event dropdown
async function populateEventDropdown() {
    eventSelect.innerHTML = '<option value="">-- Choose an event --</option>';
    try {
        const snapshot = await db.collection("events").get();
        snapshot.forEach(doc => {
            const option = document.createElement("option");
            option.value = doc.id;
            option.textContent = doc.id;
            eventSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching events:", error);
    }
}

// Add these functions at the start of the file
function showAnswersModal(question, answers) {
    const modal = document.getElementById('answersModal');
    const modalAnswers = document.getElementById('modalAnswers');
    
    modalAnswers.innerHTML = `
        <h4 class="text-[#3be382] font-bold mb-4">${question}</h4>
        <ul class="list-disc ml-6 space-y-3">
            ${answers.map(answer => `
                <li class="text-white">
                    <div class="bg-black/20 p-4 rounded-lg">${answer}</div>
                </li>
            `).join('')}
        </ul>
    `;
    
    modal.classList.add('show');
}

function closeAnswersModal() {
    const modal = document.getElementById('answersModal');
    modal.classList.remove('show');
}

// Fetch and display responses for the selected event
async function displayEventResponses(eventId) {
    resultsContainer.innerHTML = "<div class='animate-pulse'>Loading responses...</div>";
    if (!eventId) return;

    try {
        // Fetch event data for questions
        const eventDoc = await db.collection("events").doc(eventId).get();
        if (!eventDoc.exists) {
            resultsContainer.innerHTML = "<div class='text-red-600'>Event not found.</div>";
            return;
        }

        // Fetch all responses for this event
        const responsesSnapshot = await db.collection("events").doc(eventId)
            .collection("responses").get();

        if (responsesSnapshot.empty) {
            resultsContainer.innerHTML = "<div class='text-gray-500'>No responses yet for this event.</div>";
            return;
        }

        // Process responses
        const questions = eventDoc.data().questions || [];
        const responses = responsesSnapshot.docs.map(doc => doc.data());
        
        // Create result display
        resultsContainer.innerHTML = '';
        
        questions.forEach((question, idx) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'mb-8 p-6 bg-black/30 rounded-xl border border-gray-700 cursor-pointer hover:border-[#3be382] transition-colors';
            
            // Question header
            questionDiv.innerHTML = `
                <h3 class="text-[#3be382] text-lg font-bold mb-4">Question ${idx + 1}:</h3>
                <p class="text-white text-lg mb-4">${question.text}</p>
            `;

            // Process answers based on question type
            if (question.type === 'rating') {
                // Calculate mean for rating questions
                const ratings = responses
                    .map(r => parseInt(r.responses[idx]?.answer))
                    .filter(r => !isNaN(r));
                
                const mean = ratings.length > 0 
                    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                    : 'No ratings';

                questionDiv.innerHTML += `
                    <div class="bg-black/20 p-4 rounded-lg">
                        <p class="text-white">Average Rating: <span class="text-[#3be382] font-bold">${mean}</span></p>
                        <p class="text-gray-400 text-sm">(from ${ratings.length} responses)</p>
                    </div>
                `;
            } else {
                // For text responses, show only first answer
                const answers = responses
                    .map(r => r.responses[idx]?.answer)
                    .filter(a => a);

                if (answers.length > 0) {
                    questionDiv.innerHTML += `
                        <div class="space-y-2">
                            <div class="bg-black/20 p-4 rounded-lg mb-2 text-white">${answers[0]}</div>
                            <p class="text-[#3be382] text-sm">Click to view all ${answers.length} responses</p>
                        </div>
                    `;

                    // Add click handler to show all answers
                    questionDiv.onclick = () => showAnswersModal(question.text, answers);
                } else {
                    questionDiv.innerHTML += `
                        <div class="space-y-2">
                            <p class="text-gray-400">No responses yet</p>
                        </div>
                    `;
                }
            }

            resultsContainer.appendChild(questionDiv);
        });

    } catch (error) {
        console.error("Error fetching responses:", error);
        resultsContainer.innerHTML = `<div class='text-red-600'>Error fetching responses: ${error.message}</div>`;
    }
}

// Event listeners
eventSelect.addEventListener("change", (e) => {
    displayEventResponses(e.target.value);
});

// On load
populateEventDropdown();

// Make functions globally available
window.showAnswersModal = showAnswersModal;
window.closeAnswersModal = closeAnswersModal;
