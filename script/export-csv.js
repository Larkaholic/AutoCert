async function exportToCSV(eventName) {
    try {
        // fucking fetching
        const eventDoc = await firebase.firestore().collection("events").doc(eventName).get();
        const responsesSnapshot = await firebase.firestore().collection("events").doc(eventName)
            .collection("responses").get();

        if (!eventDoc.exists || responsesSnapshot.empty) {
            alert("No data to export");
            return;
        }

        const eventData = eventDoc.data();
        const responses = responsesSnapshot.docs.map(doc => doc.data());
        const questions = eventData.questions || [];

        // build CSV Header
        let csvContent = "Event Name: " + eventName + "\n";
        csvContent += "Export Date: " + new Date().toLocaleString() + "\n\n";

        // add main data headers
        let headers = ["Participant Name", "Timestamp"];
        questions.forEach((q, idx) => headers.push(`Question ${idx + 1}`));
        csvContent += headers.join(",") + "\n";

        // add response rows
        responses.forEach(response => {
            let row = [
                response.participantName || "Anonymous",
                response.timestamp ? new Date(response.timestamp.toDate()).toLocaleString() : ""
            ];

            // add answers by matching question text
            questions.forEach((q, idx) => {
                let answer = "";
                if (Array.isArray(response.responses)) {
                    // responses as array of {question, answer, type}
                    const found = response.responses.find(r => (r.question || "") === q.text);
                    answer = found ? found.answer : "";
                } else if (typeof response.responses === 'object' && response.responses !== null) {
                    // responses as object (for older data)
                    answer = response.responses[`question${idx}`] || "";
                }
                row.push(`"${answer.toString().replace(/"/g, '""')}"`);
            });

            csvContent += row.join(",") + "\n";
        });

        // add question details section
        csvContent += "\nQuestion Details:\n";
        questions.forEach((q, idx) => {
            csvContent += `Question ${idx + 1}: ${q.text} (${q.type})\n`;
        });

        // add response summary
        csvContent += "\nResponse Summary:\n";
        csvContent += `Total Responses: ${responses.length}\n`;

        // calculate averages for rating questions
        questions.forEach((q, idx) => {
            if (q.type === 'rating') {
                const ratings = responses
                    .map(r => parseInt(r.responses[idx]?.answer))
                    .filter(r => !isNaN(r));
                
                const average = ratings.length > 0 
                    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                    : 'N/A';
                
                csvContent += `Average Rating for Question ${idx + 1}: ${average}\n`;
            }
        });

        // create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${eventName}_feedback_results.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("Error exporting CSV:", error);
        alert("Error exporting data. Please try again.");
    }
}

window.exportToCSV = exportToCSV;
