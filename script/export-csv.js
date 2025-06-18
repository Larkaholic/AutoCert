async function exportToCSV(eventName) {
    try {
        // Fetch event data and responses
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

        // Build CSV Header
        let csvContent = "Event Name: " + eventName + "\n";
        csvContent += "Export Date: " + new Date().toLocaleString() + "\n\n";

        // Add main data headers
        let headers = ["Participant Name", "Timestamp"];
        questions.forEach((q, idx) => headers.push(`Question ${idx + 1}`));
        csvContent += headers.join(",") + "\n";

        // Add response rows
        responses.forEach(response => {
            let row = [
                response.participantName || "Anonymous",
                response.timestamp ? new Date(response.timestamp.toDate()).toLocaleString() : ""
            ];

            // Add answers
            questions.forEach((_, idx) => {
                const answer = response.responses[idx]?.answer || "";
                // Escape quotes and commas in answers
                row.push(`"${answer.toString().replace(/"/g, '""')}"`);
            });

            csvContent += row.join(",") + "\n";
        });

        // Add question details section
        csvContent += "\nQuestion Details:\n";
        questions.forEach((q, idx) => {
            csvContent += `Question ${idx + 1}: ${q.text} (${q.type})\n`;
        });

        // Add response summary
        csvContent += "\nResponse Summary:\n";
        csvContent += `Total Responses: ${responses.length}\n`;

        // Calculate averages for rating questions
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

        // Create and trigger download
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

// Make function available globally
window.exportToCSV = exportToCSV;
