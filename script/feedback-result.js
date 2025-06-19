const firebaseConfig = {
    apiKey: "AIzaSyC92G1LybSWu3463j1Wi0yjZaTzuiHcIMk",
    authDomain: "autocert-8319d.firebaseapp.com",
    projectId: "autocert-8319d",
    storageBucket: "autocert-8319d.firebasestorage.app",
    messagingSenderId: "941021055631",
    appId: "1:941021055631:web:ffbfae2bce3856f742fefa",
    measurementId: "G-Q7Z8VF2N2W"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const eventSelect = document.getElementById("eventSelect");
const resultsContainer = document.getElementById("resultsContainer");

// likelihood options
const LIKELIHOOD_OPTIONS = [
    'Very Likely',
    'Likely',
    'Neutral',
    'Unlikely',
    'Very Unlikely'
];

// populate event dropdown
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

function getMostVotedOption(counts) {
    return Object.entries(counts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

function showLikelihoodModal(question, counts) {
    const modal = document.getElementById('answersModal');
    const modalAnswers = document.getElementById('modalAnswers');
    
    modalAnswers.innerHTML = `
        <div class="text-2xl text-white mb-6">All responses ${question}</div>
        ${LIKELIHOOD_OPTIONS.map(option => `
            <div class="text-white text-xl mb-4">
                ${option} (${counts[option] || 0})
            </div>
        `).join('')}
    `;
    
    modal.classList.add('show');
}

function showRatingModal(question, ratings) {
    const modal = document.getElementById('answersModal');
    const modalAnswers = document.getElementById('modalAnswers');
    
    const counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    ratings.forEach(rating => counts[rating]++);
    
    modalAnswers.innerHTML = `
        <div class="text-2xl text-white mb-6">All responses ${question}</div>
        ${Object.entries(counts).map(([rating, count]) => `
            <div class="text-white text-xl mb-4">
                ${rating} Star${rating !== '1' ? 's' : ''} (${count})
            </div>
        `).join('')}
    `;
    
    modal.classList.add('show');
}

// fetch and display responses for the selected event
async function displayEventResponses(eventId) {
    resultsContainer.innerHTML = "<div class='animate-pulse'>Loading responses...</div>";
    if (!eventId) return;

    try {
        // fuck fetching
        const eventDoc = await db.collection("events").doc(eventId).get();
        if (!eventDoc.exists) {
            resultsContainer.innerHTML = "<div class='text-red-600'>Event not found.</div>";
            return;
        }

        const responsesSnapshot = await db.collection("events").doc(eventId)
            .collection("responses").get();

        if (responsesSnapshot.empty) {
            resultsContainer.innerHTML = "<div class='text-gray-500'>No responses yet for this event.</div>";
            return;
        }

        const questions = eventDoc.data().questions || [];
        const responses = responsesSnapshot.docs.map(doc => doc.data());
        
        resultsContainer.innerHTML = '';
        
        questions.forEach((question, idx) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'mb-8 p-6 bg-black/30 rounded-xl border border-gray-700 cursor-pointer hover:border-[#3be382] transition-colors';
            
            questionDiv.innerHTML = `
                <h3 class="text-[#3be382] text-lg font-bold mb-4">Question ${idx + 1}:</h3>
                <p class="text-white text-lg mb-4">${question.text}</p>
            `;

            if (question.type === 'likelihood') {
                const counts = LIKELIHOOD_OPTIONS.reduce((acc, opt) => ({...acc, [opt]: 0}), {});
                
                responses.forEach(response => {
                    const answer = response.responses[idx]?.answer;
                    if (LIKELIHOOD_OPTIONS.includes(answer)) {
                        counts[answer]++;
                    }
                });

                const mostVoted = getMostVotedOption(counts);
                const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);

                questionDiv.innerHTML += `
                    <div class="bg-black/20 p-4 rounded-lg cursor-pointer hover:bg-black/30">
                        <p class="text-white">Most selected: <span class="text-[#3be382] font-bold">${mostVoted}</span></p>
                        <p class="text-gray-400 text-sm">Click to view all ${totalVotes} responses</p>
                    </div>
                `;

                questionDiv.onclick = () => showLikelihoodModal(eventId, counts);
            } else if (question.type === 'rating') {
                const ratings = responses
                    .map(r => parseInt(r.responses[idx]?.answer))
                    .filter(r => !isNaN(r));
                
                const mean = ratings.length > 0 
                    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                    : 'No ratings';

                questionDiv.innerHTML += `
                    <div class="bg-black/20 p-4 rounded-lg cursor-pointer hover:bg-black/30">
                        <p class="text-white">Average Rating: <span class="text-[#3be382] font-bold">${mean}</span></p>
                        <p class="text-gray-400 text-sm">Click to view all ${ratings.length} responses</p>
                    </div>
                `;

                questionDiv.onclick = () => showRatingModal(question.text, ratings);
            } else {
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

eventSelect.addEventListener("change", (e) => {
    displayEventResponses(e.target.value);
});

populateEventDropdown();

window.showAnswersModal = showAnswersModal;
window.closeAnswersModal = closeAnswersModal;
