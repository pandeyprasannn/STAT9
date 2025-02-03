document.addEventListener('DOMContentLoaded', () => {
    // Team page CTA button (if exists)
    const ctabutton = document.getElementById('cta-button');
    if (ctabutton) {
        ctabutton.addEventListener('click', () => {
            window.location.href = 'teams.html';
        });
    }

    // Team cards navigation
    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(card => {
        card.addEventListener('click', () => {
            const teamId = card.getAttribute('data-team-id');
            window.location.href = `players.php?team_id=${teamId}`;
        });
    });

    // Player cards navigation
    const playerCards = document.querySelectorAll('.player-card');
    playerCards.forEach(card => {
        card.addEventListener('click', () => {
            const playerId = card.getAttribute('data-player-id');
            window.location.href = `player_profile.php?player_id=${playerId}`;
        });
    });

    // Gemini insights functionality
    const geminiButton = document.querySelector('.gemini-button');
    if (geminiButton) {
        geminiButton.addEventListener('click', async () => {
            const responseDiv = document.getElementById('gemini-response');
            const playerName = geminiButton.getAttribute('data-player-name');
            const position = geminiButton.getAttribute('data-position');

            // Show loading state
            geminiButton.disabled = true;
            geminiButton.innerHTML = 'Loading... <span class="loading">⚪</span>';
            responseDiv.style.display = 'block';
            responseDiv.innerHTML = 'Fetching insights...';

            try {
                const response = await fetch('get_gemini_insights.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        player_name: playerName,
                        position: position
                    })
                });

                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }

                responseDiv.innerHTML = `
                    <h3>Gemini's Insights</h3>
                    <p>${data.response}</p>
                `;
            } catch (error) {
                responseDiv.innerHTML = `
                    <div style="color: #ff6b6b;">
                        Sorry, unable to fetch insights at this time. Please try again later.
                    </div>
                `;
                console.error('Gemini API Error:', error);
            } finally {
                geminiButton.disabled = false;
                geminiButton.innerHTML = 'Ask Gemini About This Player';
            }
        });
    }
});