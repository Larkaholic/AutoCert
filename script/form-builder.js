// This file is now replaced by inline JavaScript in form-builder.html
// Keeping this file for reference only
console.log("This file is no longer used. See form-builder.html for the updated code.");

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get form elements
  const form = document.getElementById('questionForm');
  const addBtn = document.getElementById('addQuestionBtn');
  const eventTitleInput = document.getElementById('eventTitle');
  const saveBtn = document.getElementById('saveFormBtn');
  const output = document.getElementById('output');
  
  let questionCount = 0;
  
  // Add question button
  addBtn.addEventListener('click', function() {
    const title = eventTitleInput.value.trim();
    
    if (!title) {
      alert("Please enter an event title first.");
      return;
    }
    
    questionCount++;
    
    const questionDiv = document.createElement('div');
    questionDiv.className = "flex items-start gap-4";
    questionDiv.innerHTML = `
      <input type="text" name="question" placeholder="Question #${questionCount}" 
          class="flex-1 p-2 border border-gray-300 bg-transparent text-white rounded-xl shadow-lg" />
      <select name="type" class="p-2 border border-gray-300 bg-transparent text-white rounded-xl shadow-lg">
          <option value="text" style="background-color: #232b2b;">Text</option>
          <option value="rating" style="background-color: #232b2b;">Rating (1-5)</option>
      </select>
      <button type="button" class="remove-btn text-red-600 hover:underline">Remove</button>
    `;
    
    form.appendChild(questionDiv);
  });
  
  // Remove button handler
  form.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-btn')) {
      const questionDiv = e.target.closest('div');
      questionDiv.remove();
    }
  });
  
  // Save form handler
  saveBtn.addEventListener('click', function() {
    const eventTitle = eventTitleInput.value.trim();
    if (!eventTitle) {
      alert("Please enter an event title before saving.");
      return;
    }
    
    const questionDivs = form.querySelectorAll('div');
    const questions = [];
    
    questionDivs.forEach(div => {
      const input = div.querySelector('input[name="question"]');
      const select = div.querySelector('select[name="type"]');
      
      if (input && input.value.trim()) {
        questions.push({
          text: input.value.trim(),
          type: select ? select.value : "text",
          createdAt: new Date().toISOString()
        });
      }
    });
    
    if (questions.length === 0) {
      alert("Please add at least one question.");
      return;
    }
    
    // Save to Firebase
    db.collection("events").doc(eventTitle).set({
      questions: questions
    }, { merge: true })
    .then(() => {
      output.classList.remove("hidden");
      output.textContent = JSON.stringify(questions, null, 2) + "\n\nQuestions saved to Firebase!";
      
      // Show attendee form link
      const attendeeFormUrl = `feedback-form-User.html?event=${encodeURIComponent(eventTitle)}`;
      output.innerHTML += `\n\n<a href="${attendeeFormUrl}" target="_blank" class="text-blue-600 underline">Open attendee feedback form</a>`;
      const qrUrl = `qr.html?event=${encodeURIComponent(eventTitle)}`;
      output.innerHTML += `<br/><a href="${qrUrl}" target="_blank" class="text-green-600 underline">Open QR code for this event</a>`;
    })
    .catch((error) => {
      output.classList.remove("hidden");
      output.textContent = `Error saving to Firebase: ${error.message}`;
    });
  });

  // Fetch existing questions when page loads or event title changes
  function fetchQuestions() {
    const eventTitle = eventTitleInput.value.trim();
    if (!eventTitle || eventTitle.length < 3) return;
    
    form.innerHTML = "";
    questionCount = 0;
    
    db.collection("events").doc(eventTitle).get()
      .then(doc => {
        if (doc.exists) {
          const data = doc.data();
          const questions = data.questions || [];
          
          questions.forEach(q => {
            questionCount++;
            const questionDiv = document.createElement('div');
            questionDiv.className = "flex items-start gap-4";
            questionDiv.innerHTML = `
              <input type="text" name="question" value="${q.text}" placeholder="Question #${questionCount}" 
                  class="flex-1 p-2 border border-gray-300 bg-transparent text-white rounded-xl shadow-lg" />
              <select name="type" class="p-2 border border-gray-300 bg-transparent text-white rounded-xl shadow-lg">
                  <option value="text" style="background-color: #232b2b;"${q.type === "text" ? " selected" : ""}>Text</option>
                  <option value="rating" style="background-color: #232b2b;"${q.type === "rating" ? " selected" : ""}>Rating (1-5)</option>
              </select>
              <button type="button" class="remove-btn text-red-600 hover:underline">Remove</button>
            `;
            form.appendChild(questionDiv);
          });
        }
      })
      .catch(error => {
        output.classList.remove("hidden");
        output.textContent = `Error fetching from Firebase: ${error.message}`;
      });
  }
  
  // Call fetchQuestions when event title changes
  if (eventTitleInput) {
    eventTitleInput.addEventListener('input', fetchQuestions);
  }
  
  // Initial fetch attempt
  fetchQuestions();
});