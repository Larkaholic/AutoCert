import { app } from "./firebase.js";

const db = firebase.firestore();

const eventSelect = document.getElementById("eventSelect");
const dynamicForm = document.getElementById("dynamicFeedbackForm");

// Populate event dropdown
async function populateEventDropdown() {
    eventSelect.innerHTML = '<option value="">-- Choose an event --</option>';
    try {
        const snapshot = await db.collection("events").get();
        if (snapshot.empty) {
            return;
        }
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

// Render questions for selected event
async function renderQuestions(eventId) {
    dynamicForm.innerHTML = "";
    if (!eventId) return;
    try {
        const doc = await db.collection("events").doc(eventId).get();
        if (!doc.exists) {
            return;
        }
        const data = doc.data();
        const questions = data.questions || [];
        let idx = 1;
        questions.forEach(q => {
            const div = document.createElement("div");
            div.className = "mb-4";
            div.innerHTML = `
                <label class="block text-lg font-medium mb-2">${idx++}. ${q.text}</label>
                ${
                    q.type === "rating"
                    ? `<select name="q${idx}" class="w-full p-2 border border-gray-400 rounded-xl shadow-lg">
                            <option value="">-- Select rating --</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                       </select>`
                    : `<input type="text" name="q${idx}" class="w-full p-2 border border-gray-400 rounded-xl shadow-lg" />`
                }
            `;
            dynamicForm.appendChild(div);
        });
    } catch (error) {
        console.error("Error fetching questions:", error);
    }
}

// Event listeners
eventSelect.addEventListener("change", (e) => {
    renderQuestions(e.target.value);
});

// On load
populateEventDropdown();
