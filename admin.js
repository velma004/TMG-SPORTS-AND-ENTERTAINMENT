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

async function saveUpdate(category, content, imageData, caption, clearInputs = {}) {
    try {
        const response = await fetch('/api/updates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ category, text: content, image: imageData, caption })
        });
        if (!response.ok) {
            // Try to get error message from response body
            let errorMessage = 'Failed to post update';
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch (e) {
                // ignore JSON parse errors
            }
            throw new Error(errorMessage);
        }
        alert("Update posted successfully!");

        // Fetch latest updates from server to sync localStorage and UI
        const updatesResponse = await fetch('/api/updates');
        if (!updatesResponse.ok) {
            throw new Error('Failed to fetch updates after posting');
        }
        const updatesData = await updatesResponse.json();
        localStorage.setItem("updates", JSON.stringify(updatesData));

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
    } catch (error) {
        alert("Error posting update: " + error.message);
    }
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

    renderUpdatesList();
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
