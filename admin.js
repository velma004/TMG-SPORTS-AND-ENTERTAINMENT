const ADMIN_PASSWORD = "tandao123";

// Verify the entered password
function checkPassword() {
    const enteredPassword = document.getElementById("adminPassword").value;

    if (enteredPassword === ADMIN_PASSWORD) {
        // Show post form and current updates, hide login section
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("postFormSection").style.display = "block";
        document.getElementById("currentUpdatesSection").style.display = "block";
    } else {
        alert("Incorrect password. Please try again.");
    }
}

function addUpdate() {
    const category = document.getElementById("category").value;
    const content = document.getElementById("updateContent").value;
    const imageInput = document.getElementById("updateImage");
    const captionInput = document.getElementById("imageCaption");
    let imageData = "";
    let caption = "";

    if (content.trim() === "") {
        alert("Update content cannot be empty!");
        return;
    }

    if (imageInput.files && imageInput.files[0]) {
        caption = captionInput.value.trim();
        const reader = new FileReader();
        reader.onload = function(e) {
            imageData = e.target.result;
            saveUpdate(category, content, imageData, caption);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        saveUpdate(category, content, imageData, caption);
    }
}

function saveUpdate(category, content, imageData, caption, clearInputs = {}) {
    // Save update locally in localStorage since no backend
    let updates = JSON.parse(localStorage.getItem("updates")) || { sports: [], entertainment: [] };

    if (!updates[category]) {
        updates[category] = [];
    }

    updates[category].push({ text: content, image: imageData, caption });

    localStorage.setItem("updates", JSON.stringify(updates));

    alert("Update saved locally!");

    // Clear the textarea, file input, and caption input if provided
    if (clearInputs.contentId) {
        const contentElem = document.getElementById(clearInputs.contentId);
        if (contentElem) contentElem.value = "";
    }
    if (clearInputs.imageId) {
        const imageElem = document.getElementById(clearInputs.imageId);
        if (imageElem) imageElem.value = "";
    }
    if (clearInputs.captionId) {
        const captionElem = document.getElementById(clearInputs.captionId);
        if (captionElem) captionElem.value = "";
    }

    renderUpdatesList();
}

document.addEventListener("DOMContentLoaded", () => {
    const postButton = document.querySelector("#postUpdateBtn");
    const imageInput = document.getElementById("updateImage");
    const captionInput = document.getElementById("imageCaption");

    if (postButton) {
        postButton.addEventListener("click", addUpdate);
    }

    // Show or hide caption input based on image selection
    if (imageInput && captionInput) {
        imageInput.addEventListener("change", () => {
            if (imageInput.files && imageInput.files.length > 0) {
                captionInput.style.display = "block";
            } else {
                captionInput.style.display = "none";
                captionInput.value = "";
            }
        });
    }

    // On load, if no updates in localStorage, fetch from updates.json
    if (!localStorage.getItem("updates")) {
        fetch('updates.json')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load updates.json');
                return response.json();
            })
            .then(data => {
                localStorage.setItem("updates", JSON.stringify(data));
                renderUpdatesList();
            })
            .catch(error => {
                console.error(error);
                renderUpdatesList();
            });
    } else {
        renderUpdatesList();
    }
});

function renderUpdatesList() {
    const updates = JSON.parse(localStorage.getItem("updates")) || { sports: [], entertainment: [] };
    const updatesList = document.getElementById("updatesList");
    const currentUpdatesSection = document.getElementById("currentUpdatesSection");

    if (!updatesList || !currentUpdatesSection) return;

    updatesList.innerHTML = "";

    const allUpdates = [
        ...updates.sports.map(u => ({ ...u, category: "sports" })),
        ...updates.entertainment.map(u => ({ ...u, category: "entertainment" }))
    ];

    if (allUpdates.length === 0) {
        currentUpdatesSection.style.display = "none";
        return;
    } else {
        currentUpdatesSection.style.display = "block";
    }

    allUpdates.forEach((update, index) => {
        const div = document.createElement("div");
        div.className = "update-item";

        const textP = document.createElement("p");
        textP.textContent = `[${update.category.toUpperCase()}] ${update.text}`;
        div.appendChild(textP);

        if (update.image) {
            const img = document.createElement("img");
            img.src = update.image;
            img.alt = "Update Image";
            img.style.maxWidth = "200px";
            img.style.display = "block";
            img.style.cursor = "pointer";
            // Removed image click event for enlargement
            div.appendChild(img);
        }

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", () => {
            deleteUpdate(index, update.category);
        });
        div.appendChild(delBtn);

        updatesList.appendChild(div);
    });
}

function deleteUpdate(index, category) {
    let updates = JSON.parse(localStorage.getItem("updates")) || { sports: [], entertainment: [] };

    if (category === "sports") {
        updates.sports.splice(index, 1);
    } else if (category === "entertainment") {
        updates.entertainment.splice(index, 1);
    }

    localStorage.setItem("updates", JSON.stringify(updates));
    // Immediately update the UI without delay
    renderUpdatesList();
}
