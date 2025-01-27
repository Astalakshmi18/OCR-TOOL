const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const filePicker = document.getElementById("filePicker");
const previewImage = document.getElementById("previewImage");
const extractButton = document.getElementById("extractButton");
const resultTable = document.getElementById("resultTable");

let selectedImage = null;

// Handle file selection
filePicker.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (event) => {
  handleFile(event.target.files[0]);
});

dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("hover");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("hover");
});

dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.classList.remove("hover");
  handleFile(event.dataTransfer.files[0]);
});

function handleFile(file) {
  if (file && file.type.startsWith("image/")) {
    selectedImage = file;
    const reader = new FileReader();
    reader.onload = () => {
      previewImage.src = reader.result;
      previewImage.style.display = "block";
      extractButton.disabled = false;
    };
    reader.readAsDataURL(file);
  } else {
    alert("Please upload a valid image file.");
  }
}

// Perform OCR and format data
extractButton.addEventListener("click", () => {
  if (!selectedImage) return;

  extractButton.disabled = true;
  Tesseract.recognize(previewImage.src, "eng", {
    logger: (info) => console.log(info), // Logs OCR progress
  })
    .then(({ data: { text } }) => {
      console.log("Raw OCR Output:", text); // Log raw OCR output
      const formattedData = parseOCRText(text);
      console.log("Parsed Data:", formattedData); // Log parsed data
      populateTable(formattedData);
      extractButton.disabled = false;
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to extract text. Try again.");
      extractButton.disabled = false;
    });
});

function parseOCRText(text) {
    const lines = text.split("\n").filter((line) => line.trim() !== ""); // Split by line and filter empty lines
    const formattedData = [];
  
    // Regex pattern to match rows dynamically
    const rowPattern = /^(\d+\s+[A-Z]\.\s)([A-Za-z\s,'\-\.]+)\s(\d+)\.\s(.+)$/;
  
    lines.forEach((line, index) => {
      const match = line.match(rowPattern);
  
      // Debugging: Log lines and regex matches
      console.log(`Line ${index + 1}:`, line);
      if (match) {
        console.log("Match:", match);
  
        // Push the parsed fields into the formattedData array
        formattedData.push({
          serial: match[1].trim(),
          name: match[2].trim(),
          soldierNo: match[3].trim(),
          details: match[4].trim(),
        });
      } else {
        console.log("No match for line:", line);
      }
    });
  
    return formattedData;
  }
  
function populateTable(data) {
    const resultTable = document.getElementById("resultTable");
    resultTable.innerHTML = ""; // Clear previous data
  
    // Create table rows
    data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.serial}</td>
        <td>${row.name}</td>
        <td>${row.soldierNo}</td>
        <td>${row.details}</td>
      `;
      resultTable.appendChild(tr);
    });
}
