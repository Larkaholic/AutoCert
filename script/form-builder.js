// This file is now replaced by inline JavaScript in form-builder.html
// Keeping this file for reference only
console.log("This file is no longer used. See form-builder.html for the updated code.");

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
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
          <option value="college" style="background-color: #232b2b;">College/Department</option>
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
      // Redirect to certificate builder after saving
      window.location.href = `certificate-builder.html?event=${encodeURIComponent(eventTitle)}`;
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
                  <option value="college" style="background-color: #232b2b;"${q.type === "college" ? " selected" : ""}>College/Department</option>
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

function createQuestionCard(question, index) {
    let answerPreview = '';

    // Generate answer preview based on question type
    switch (question.type) {
        case 'text':
            answerPreview = `<p class="text-white">${question.answer}</p>`;
            break;
        case 'rating':
            const stars = '★'.repeat(question.answer) + '☆'.repeat(5 - question.answer);
            answerPreview = `<p class="text-yellow-400">${stars}</p>`;
            break;
        case 'college':
            answerPreview = `
                <select class="w-full p-3 border border-gray-400 rounded-xl shadow-lg bg-[#232b2b] text-white" disabled>
                    <option>-- Select College/Department --</option>
                    <option>SHS</option>
                    <option>CITCS</option>
                    <option>CEA</option>
                    <option>CCJE</option>
                    <option>CBA</option>
                    <option>COA</option>
                    <option>CHTM</option>
                    <option>CAS</option>
                    <option>CTE</option>
                    <option>CON</option>
                    <option>Non-UCian</option>
                </select>
            `;
            break;
    }

    return `
        <div class="question-card mb-4 p-4 rounded-xl shadow-lg" style="background-color: #1e1e2e;">
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-semibold text-white">Question ${index + 1}</h3>
                <button class="remove-question text-red-600 hover:underline" onclick="removeQuestion(this)">Remove</button>
            </div>
            <div class="mb-2">
                <label class="block text-sm text-gray-400">Question Text</label>
                <input type="text" value="${question.text}" class="w-full p-3 border border-gray-400 rounded-xl bg-[#232b2b] text-white" disabled />
            </div>
            <div class="mb-2">
                <label class="block text-sm text-gray-400">Question Type</label>
                <select class="w-full p-3 border border-gray-400 rounded-xl bg-[#232b2b] text-white" disabled>
                    <option value="text"${question.type === 'text' ? ' selected' : ''}>Text</option>
                    <option value="rating"${question.type === 'rating' ? ' selected' : ''}>Rating (1-5)</option>
                    <option value="college"${question.type === 'college' ? ' selected' : ''}>College/Department</option>
                </select>
            </div>
            <div>
                <label class="block text-sm text-gray-400">Answer Preview</label>
                <div class="p-3 border border-gray-400 rounded-xl bg-[#232b2b]">
                    ${answerPreview}
                </div>
            </div>
        </div>
    `;
}

function saveQuestionToFirestore(question) {
    const questionType = question.type;
    let questionData = {
        text: question.text,
        type: questionType,
        createdAt: new Date().toISOString()
    };

    // Add options for college/department question type
    if (questionType === 'college') {
        questionData.options = [
            'SHS',
            'CITCS',
            'CEA',
            'CCJE',
            'CBA',
            'COA',
            'CHTM',
            'CAS',
            'CTE',
            'CON',
            'Non-UCian'
        ];
    }

    // Save to Firestore (merge with existing document)
    db.collection("events").doc(eventTitle).set({
        questions: firebase.firestore.FieldValue.arrayUnion(questionData)
    }, { merge: true })
    .then(() => {
        console.log("Question saved successfully!");
        // Optionally, refresh the question list or provide feedback to the user
    })
    .catch((error) => {
        console.error("Error saving question: ", error);
    });
}