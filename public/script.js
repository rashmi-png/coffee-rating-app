const coffeeGrid = document.getElementById("coffeeGrid");
const leaderboard = document.getElementById("leaderboard");

async function loadCoffees() {
    try {
        const response = await fetch("/api/coffees");
        const coffees = await response.json();

        displayCoffees(coffees);
        displayLeaderboard(coffees);
    } catch (error) {
        console.error("Error loading coffees:", error);
        coffeeGrid.innerHTML = "<p>Unable to load coffees.</p>";
    }
}

function displayCoffees(coffees) {
    coffeeGrid.innerHTML = "";

    coffees.forEach(coffee => {
        const card = document.createElement("div");
        card.className = "coffee-card";

        card.innerHTML = `
            <div class="coffee-icon">☕</div>
            <h3>${coffee.name}</h3>
            <p>${coffee.description}</p>
            <div class="vote-count">
                ⭐ Votes: ${coffee.votes}
            </div>
            <button class="vote-btn" onclick="vote(${coffee.id})">
                Vote ⭐
            </button>
        `;

        coffeeGrid.appendChild(card);
    });
}

function displayLeaderboard(coffees) {
    leaderboard.innerHTML = "";

    const topCoffees = [...coffees]
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 5);

    topCoffees.forEach((coffee, index) => {
        const item = document.createElement("div");
        item.className = "leaderboard-item";

        item.innerHTML = `
            <span>
                <span class="rank">#${index + 1}</span>
                ${coffee.name}
            </span>
            <strong>⭐ ${coffee.votes}</strong>
        `;

        leaderboard.appendChild(item);
    });
}

async function vote(id) {
    try {
        const response = await fetch(`/api/coffees/${id}/vote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Vote failed");
        }

        // Reload the coffee data without refreshing the page
        await loadCoffees();

    } catch (error) {
        console.error("Error voting:", error);
        alert("Something went wrong while voting.");
    }
}

// Load coffees when the page opens
loadCoffees();