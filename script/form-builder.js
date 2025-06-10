import { app } from "./firebase.js";

// Initialize Firestore using the global firebase object from CDN
const db = firebase.firestore();

let questionCount = 0;
const form = document.getElementById("questionForm");
const output = document.getElementById("output");
const eventTitleInput = document.getElementById("eventTitle");

// Helper to get event title (trimmed)
function getEventTitle() {
    return eventTitleInput ? eventTitleInput.value.trim() : "";
}

// Helper to create a question div
function createQuestionDiv({ text = "", type = "text" } = {}) {
    questionCount++;
    const questionDiv = document.createElement("div");
    questionDiv.className = "flex items-start gap-4";
    questionDiv.innerHTML = `
        <input type="text" name="question" value="${text}" placeholder="Enter your question" class="flex-1 p-2 border border-gray-300 bg-white rounded-xl shadow-lg" />
        <select name="type" class="p-2 border border-gray-300 rounded-xl bg-white shadow-lg">
            <option value="text"${type === "text" ? " selected" : ""}>Text</option>
            <option value="rating"${type === "rating" ? " selected" : ""}>Rating (1-5)</option>
        </select>
        <button type="button" class="remove-btn text-red-600 hover:underline">Remove</button>
    `;
    form.appendChild(questionDiv);
}

// Debounce helper
function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Fetch and display all questions for the current event from Firestore
async function displayQuestionsFromFirebase() {
    form.innerHTML = "";
    questionCount = 0;
    const eventTitle = getEventTitle();
    if (!eventTitle || eventTitle.length < 3) return;

    try {
        console.log("Fetching questions for event:", eventTitle);
        const doc = await db.collection("events").doc(eventTitle).get();
        if (!doc.exists) {
            console.log("No event found for:", eventTitle);
            return;
        }
        const data = doc.data();
        const questions = data.questions || [];
        questions.forEach(q => createQuestionDiv({ text: q.text, type: q.type || "text" }));
    } catch (error) {
        console.error("Error fetching questions:", error);
        output.classList.remove("hidden");
        output.textContent = `Error fetching from Firebase: ${error.message}`;
    }
}

// Call on page load and when event title changes
window.addEventListener("DOMContentLoaded", displayQuestionsFromFirebase);
if (eventTitleInput) {
    eventTitleInput.addEventListener("input", displayQuestionsFromFirebase);
}

document.getElementById("addQuestionBtn").addEventListener("click", () => {
    if (!getEventTitle()) {
        alert("Please enter an event title first.");
        return;
    }
    createQuestionDiv();
});

form.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
        const questionDiv = e.target.closest("div");
        questionDiv.remove();
    }
});

document.getElementById("saveFormBtn").addEventListener("click", async () => {
    const eventTitle = getEventTitle();
    if (!eventTitle) {
        alert("Please enter an event title before saving.");
        return;
    }
    const questionDivs = form.querySelectorAll("div");
    output.classList.remove("hidden");
    let questions = [];

    for (const div of questionDivs) {
        const input = div.querySelector("input[name='question']");
        const select = div.querySelector("select[name='type']");
        const questionText = input.value.trim();
        const questionType = select.value;

        if (questionText) {
            questions.push({
                text: questionText,
                type: questionType,
                createdAt: new Date().toISOString()
            });
        }
    }

    try {
        await db.collection("events").doc(eventTitle).set({ questions }, { merge: true });
        output.textContent = JSON.stringify(questions, null, 2) + "\n\nQuestions saved to Firebase!";
        // Show attendee form link
        const attendeeFormUrl = `feedback-form-User.html?event=${encodeURIComponent(eventTitle)}`;
        output.innerHTML += `\n\n<a href="${attendeeFormUrl}" target="_blank" class="text-blue-600 underline">Open attendee feedback form</a>`;
    } catch (error) {
        output.textContent = `Error saving to Firebase: ${error.message}`;
    }

    await displayQuestionsFromFirebase();
});