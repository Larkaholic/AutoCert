import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp, collectionGroup, getDocs } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.querySelector('#certTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    try {
        // Query all 'responses' subcollections under any document in 'events'
        const responsesSnapshot = await getDocs(collectionGroup(db, 'responses'));
        if (responsesSnapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">No responses found.</td></tr>`;
            return;
        }

        // Cache for event main documents to avoid redundant fetches
        const eventDocCache = {};

        for (const docSnap of responsesSnapshot.docs) {
            const data = docSnap.data();
            const name = data.participantName || '';
            const dateIssued = data.timestamp && data.timestamp.toDate
                ? data.timestamp.toDate().toString()
                : '';

            // Get the parent event document ID
            const eventDocRef = docSnap.ref.parent.parent;
            let eventName = '';
            if (eventDocRef) {
                const eventId = eventDocRef.id;
                // Fetch event main document if not cached
                if (!eventDocCache[eventId]) {
                    const eventDocSnap = await getDoc(eventDocRef);
                    eventDocCache[eventId] = eventDocSnap.exists() ? (eventDocSnap.data().eventName || eventId) : eventId;
                }
                eventName = eventDocCache[eventId];
            }

            // Get the response document ID
            const responseId = docSnap.id;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-4 py-2 border-b">${name}</td>
                <td class="px-4 py-2 border-b">${eventName}</td>
                <td class="px-4 py-2 border-b">${dateIssued}</td>
                <td class="px-4 py-2 border-b">${responseId}</td>
            `;
            tableBody.appendChild(row);
        }
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500">Error loading data.</td></tr>`;
        console.error("Error fetching responses:", err);
    }
});


