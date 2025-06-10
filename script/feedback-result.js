import { app } from "./firebase.js";

// Initialize Firestore using the global firebase object from CDN
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

// Fetch and display questions for the selected event
async function displayEventQuestions(eventId) {
    resultsContainer.innerHTML = "";
    if (!eventId) return;
    try {
        const doc = await db.collection("events").doc(eventId).get();
        if (!doc.exists) {
            resultsContainer.innerHTML = "<div class='text-red-600'>No event found.</div>";
            return;
        }
        const data = doc.data();
        const questions = data.questions || [];
        if (questions.length === 0) {
            resultsContainer.innerHTML = "<div class='text-gray-500'>No questions found for this event.</div>";
            return;
        }
        let idx = 1;
        questions.forEach(q => {
            const div = document.createElement("div");
            div.className = "mb-4";
            div.innerHTML = `
                <div class="font-semibold">${idx++}. ${q.text}</div>
                <div class="text-gray-600">Type: ${q.type}</div>
            `;
            resultsContainer.appendChild(div);
        });
    } catch (error) {
        resultsContainer.innerHTML = `<div class='text-red-600'>Error fetching questions: ${error.message}</div>`;
    }
}

// Event listeners
eventSelect.addEventListener("change", (e) => {
    displayEventQuestions(e.target.value);
});

// On load
populateEventDropdown();
