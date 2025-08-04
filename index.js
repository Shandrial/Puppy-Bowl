const API_URL = "https://fsa-puppy-bowl.herokuapp.com/api/2503-PUPPIES/players";

// Fetch and render puppies
async function fetchPuppies() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!data?.data?.players) throw new Error("Invalid API response");

        renderPuppies(data.data.players);
    } catch (error) {
        console.error("Error fetching puppies:", error);
    }
}

// Render puppy cards including player details
function renderPuppies(players) {
    const container = document.getElementById("puppy-container");
    container.innerHTML = "";

    players.forEach(player => {
        if (!player?.id || !player?.name || !player?.imageUrl || !player?.breed || !player?.status) return;

        const card = document.createElement("div");
        card.className = "puppy-card";

        const img = document.createElement("img");
        img.src = player.imageUrl;
        img.alt = player.name;
        card.appendChild(img);

        const name = document.createElement("h3");
        name.textContent = player.name;
        card.appendChild(name);

        const breed = document.createElement("p");
        breed.textContent = `Breed: ${player.breed}`;
        card.appendChild(breed);

        const status = document.createElement("p");
        status.textContent = `Status: ${player.status}`;
        card.appendChild(status);

        // More Info Button (Triggers Modal)
        const detailsBtn = document.createElement("button");
        detailsBtn.textContent = "More Info";
        detailsBtn.addEventListener("click", () => showPuppyDetails(player.id));
        card.appendChild(detailsBtn);

        // Remove Button
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", () => removePuppy(player.id));
        card.appendChild(removeBtn);

        container.appendChild(card);
    });
}

// Fetch and display puppy details in a **modal**
async function showPuppyDetails(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();

        console.log("Full API Response:", data); // This will confirm the nesting

        if (!data || !data.data || !data.data.player) {
            throw new Error("Unexpected API response structure");
        }

        const player = data.data.player;

        document.getElementById("modal-name").textContent = player.name;
        document.getElementById("modal-breed").textContent = player.breed;
        document.getElementById("modal-status").textContent = player.status;
        document.getElementById("modal-team").textContent = player.team?.name ?? "No team assigned";
        document.getElementById("modal-created").textContent = new Date(player.createdAt).toLocaleString();
        document.getElementById("modal-updated").textContent = new Date(player.updatedAt).toLocaleString();
        document.getElementById("modal-image").src = player.imageUrl;
        document.getElementById("modal-image").alt = player.name;

        document.getElementById("puppy-modal").style.display = "block";
    } catch (error) {
        console.error("Error fetching puppy details:", error);
        alert("Failed to load puppy details. Check the console for more info.");
    }
}


// Add a new puppy via API
async function addPuppy(event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const breed = document.getElementById("breed").value;
    const imageUrl = document.getElementById("imageUrl").value;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, breed, imageUrl })
        });

        if (!response.ok) throw new Error("Failed to add puppy");

        fetchPuppies();
    } catch (error) {
        console.error("Error adding puppy:", error);
    }
}

// Remove a puppy via API
async function removePuppy(id) {
    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        fetchPuppies();
    } catch (error) {
        console.error("Error removing puppy:", error);
    }
}

// Close modal when clicking the "X"
document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("puppy-modal").style.display = "none";
});

// Event listeners for form submission and refresh
document.getElementById("puppy-form").addEventListener("submit", addPuppy);
document.getElementById("refresh").addEventListener("click", fetchPuppies);

// Initial fetch
fetchPuppies();