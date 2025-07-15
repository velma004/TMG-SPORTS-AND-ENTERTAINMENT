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

async function addUpdate() {
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
        reader.onload = async function(e) {
            imageData = e.target.result;
            await saveUpdate(category, content, imageData, caption);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        await saveUpdate(category, content, imageData, caption);
    }
}

async function saveUpdate(category, content, imageData, caption, clearInputs = {}) {
    try {
        const response = await fetch('/.netlify/functions/postUpdates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ category, text: content, image: imageData, caption })
        });

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) {
                console.error('Error parsing error response JSON:', e);
            }
            alert('Failed to save update: ' + (errorData.error || 'Unknown error'));
            return;
        }

        alert("Update saved successfully!");

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

        // Refresh the updates list from backend
        await fetchAndRenderUpdates();

    } catch (error) {
        console.error('Error in saveUpdate:', error);
        alert('Error saving update: ' + (error.message || 'Unknown error'));
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

    // Fetch and render updates from backend on load
    fetchAndRenderUpdates();
});

async function fetchAndRenderUpdates() {
    try {
        const response = await fetch('/.netlify/functions/getUpdates');
        const updates = await response.json();

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
    } catch (error) {
        console.error('Error fetching updates:', error);
    }
}

async function deleteUpdate(index, category) {
    try {
        const response = await fetch('/.netlify/functions/getUpdates');
        let updates = await response.json();

        if (category === "sports") {
            updates.sports.splice(index, 1);
        } else if (category === "entertainment") {
            updates.entertainment.splice(index, 1);
        }

        // Save updated list back to updates.json via postUpdates function
        const saveResponse = await fetch('/.netlify/functions/postUpdates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (!saveResponse.ok) {
            alert('Failed to delete update.');
            console.error('Failed to save updates after deletion');
            return;
        }

        // Refresh the updates list
        await fetchAndRenderUpdates();
    } catch (error) {
        console.error('Error deleting update:', error);
        alert('Error deleting update: ' + (error.message || 'Unknown error'));
    }
}
