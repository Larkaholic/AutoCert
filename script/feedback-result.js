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
    modalAnswers.style.position = 'relative'; // Ensure relative positioning for absolute button
    modalAnswers.style.paddingTop = '2.5rem'; // Add top padding for button
    modalAnswers.innerHTML = `
        <h4 class="text-[#3be382] font-bold mb-4">${question}</h4>
        <ul class="list-disc ml-6 space-y-5 max-h-[80vh] overflow-y-auto pb-16">
            ${answers.map(answer => `
                <li class="text-white overflow-auto mb-5">
                    <div class="bg-black/20 p-4 rounded-lg overflow-x-auto">${answer}</div>
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
    modalAnswers.style.position = 'relative';
    modalAnswers.style.paddingTop = '2.5rem';
    modalAnswers.innerHTML = `
        <button onclick="closeAnswersModal()" class="absolute top-2 right-4 text-white text-2xl font-bold hover:text-[#3be382] z-10">&times;</button>
        <div class="text-2xl text-white mb-6 mt-6">All responses ${question}</div>
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
    modalAnswers.style.position = 'relative';
    modalAnswers.style.paddingTop = '2.5rem';
    const counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    ratings.forEach(rating => counts[rating]++);
    modalAnswers.innerHTML = `
        <button onclick="closeAnswersModal()" class="absolute top-2 right-4 text-white text-2xl font-bold hover:text-[#3be382] z-10">&times;</button>
        <div class="text-2xl text-white mb-6 mt-6">All responses ${question}</div>
        ${Object.entries(counts).map(([rating, count]) => `
            <div class="text-white text-xl mb-4">
                ${rating} Star${rating !== '1' ? 's' : ''} (${count})
            </div>
        `).join('')}
    `;
    
    modal.classList.add('show');
}

function showCollegeModal(question, answers) {
    const modal = document.getElementById('answersModal');
    const modalAnswers = document.getElementById('modalAnswers');
    modalAnswers.style.position = 'relative';
    modalAnswers.style.paddingTop = '2.5rem';
    // Count occurrences of each answer
    const counts = {};
    answers.forEach(ans => {
        counts[ans] = (counts[ans] || 0) + 1;
    });
    // Sort by count descending, then alphabetically
    const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    modalAnswers.innerHTML = `
        <button onclick="closeAnswersModal()" class="absolute top-2 right-4 text-white text-2xl font-bold hover:text-[#3be382] z-10">&times;</button>
        <h4 class="text-[#3be382] font-bold mb-4 mt-6">${question}</h4>
        <ul class="list-disc ml-6 space-y-3">
            ${sorted.map(([answer, count]) => `
                <li class="text-white overflow-x-auto">
                    <div class="bg-black/20 p-4 rounded-lg">${answer} <span class="text-[#3be382] font-bold ml-2">(${count})</span></div>
                </li>
            `).join('')}
        </ul>
    `;
    modal.classList.add('show');
}

function showBoothModal(question, counts) {
    const modal = document.getElementById('answersModal');
    const modalAnswers = document.getElementById('modalAnswers');
    modalAnswers.style.position = 'relative';
    modalAnswers.style.paddingTop = '2.5rem';
    
    // Sort booths by vote count (descending)
    const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1]);
    
    const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);
    
    modalAnswers.innerHTML = `
        <button onclick="closeAnswersModal()" class="absolute top-2 right-4 text-white text-2xl font-bold hover:text-[#3be382] z-10">&times;</button>
        <h4 class="text-[#3be382] font-bold mb-4 mt-6">${question}</h4>
        <div class="text-white text-sm mb-4">Total votes: ${totalVotes}</div>
        <ul class="list-none space-y-3">
            ${sorted.map(([booth, count], index) => `
                <li class="text-white overflow-x-auto">
                    <div class="bg-black/20 p-4 rounded-lg flex justify-between items-center">
                        <span class="flex items-center">
                            ${index === 0 ? '<span class="text-yellow-400 mr-2">🏆</span>' : `<span class="text-gray-400 mr-2">#${index + 1}</span>`}
                            ${booth}
                        </span>
                        <span class="text-[#3be382] font-bold">${count} vote${count !== 1 ? 's' : ''}</span>
                    </div>
                </li>
            `).join('')}
        </ul>
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

            if (question.type === 'booth') {
                const counts = {};
                
                responses.forEach(response => {
                    const answer = response.responses[idx]?.answer;
                    if (answer) {
                        counts[answer] = (counts[answer] || 0) + 1;
                    }
                });

                const mostVoted = getMostVotedOption(counts);
                const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);

                questionDiv.innerHTML += `
                    <div class="bg-black/20 p-4 rounded-lg cursor-pointer hover:bg-black/30">
                        <p class="text-white">Most voted booth: <span class="text-[#3be382] font-bold">${mostVoted}</span></p>
                        <p class="text-gray-400 text-sm">Click to view all ${totalVotes} booth votes</p>
                    </div>
                `;

                questionDiv.onclick = () => showBoothModal(question.text, counts);
            } else if (question.type === 'likelihood') {
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
            } else if (question.type === 'college') {
                const answers = responses
                    .map(r => r.responses[idx]?.answer)
                    .filter(a => a);

                if (answers.length > 0) {
                    questionDiv.innerHTML += `
                        <div class="space-y-2 overflow-x-auto">
                            <div class="bg-black/20 p-4 rounded-lg mb-2 text-white">${answers[0]}</div>
                            <p class="text-[#3be382] text-sm">Click to view all ${answers.length} responses (sorted)</p>
                        </div>
                    `;
                    questionDiv.onclick = () => showCollegeModal(question.text, answers);
                } else {
                    questionDiv.innerHTML += `
                        <div class="space-y-2">
                            <p class="text-gray-400">No responses yet</p>
                        </div>
                    `;
                }
            } else {
                const answers = responses
                    .map(r => r.responses[idx]?.answer)
                    .filter(a => a);

                if (answers.length > 0) {
                    questionDiv.innerHTML += `
                        <div class="space-y-2 overflow-x-auto mb-10">
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
window.showCollegeModal = showCollegeModal;
window.showBoothModal = showBoothModal;
