// Gemini Insights Function
async function getGeminiInsights(playerName, position) {
    // Gemini API configuration
    const apiKey = 'AIzaSyA5qbuqTBFfDxZYeS57h4MwlzBIYmJU0X8';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    // Construct the prompt with structured sections
    const prompt = `Provide a detailed analysis of ${playerName} who plays as ${position}. 
Format the response in clear sections as follows:

PLAYER OVERVIEW
[Basic information about the player including team and position]

CURRENT PERFORMANCE
[Detailed analysis of current form and performance]

PLAYING STYLE
[Description of the player's style and approach to the game]

STRENGTHS
• [List key strengths with brief explanations]

AREAS FOR IMPROVEMENT
• [List areas needing development with specific details]

FUTURE PROSPECTS
[Analysis of potential and future development]

STATISTICAL HIGHLIGHTS
• [Key statistics and notable achievements]

Please keep the response professional and factual, with clear section breaks.`;

    // Prepare the request payload
    const requestData = {
        contents: [{
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
        }
    };

    try {
        // Make the API request
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Extract the text response
        if (result.candidates && result.candidates[0].content.parts[0].text) {
            let text = result.candidates[0].content.parts[0].text;

            // Clean up the text
            text = text.replace(/\*+/g, ''); // Remove asterisks
            text = text.replace(/~+/g, ''); // Remove tildes
            text = text.replace(/"{2,}/g, ''); // Remove multiple quotes
            text = text.replace(/\s+/g, ' '); // Normalize spaces
            text = text.replace(/\n\s*\n/g, '\n'); // Normalize line breaks

            // Convert the sections into HTML for better formatting
            const sections = [
                'PLAYER OVERVIEW', 'CURRENT PERFORMANCE', 'PLAYING STYLE', 
                'STRENGTHS', 'AREAS FOR IMPROVEMENT', 
                'FUTURE PROSPECTS', 'STATISTICAL HIGHLIGHTS'
            ];

            sections.forEach(section => {
                text = text.replace(
                    new RegExp(section, 'g'), 
                    `<h3>${section}</h3>`
                );
            });

            // Convert bullet points
            text = text.replace(/•\s*([^•\n]+)/g, '<li>$1</li>');
            text = text.replace(/<li>/, '<ul><li>');
            text = text.replace(/<\/li>\s*(?!<li>)/, '</li></ul>');

            // Add paragraph tags
            text = text.replace(/([^>])\n\n([^<])/g, '$1</p><p>$2');
            text = `<div class="player-analysis">${text}</div>`;

            return {
                success: true,
                response: text,
                player_name: playerName,
                position: position
            };
        } else {
            return {
                success: false,
                response: 'Invalid response structure',
                error: 'Response format error'
            };
        }
    } catch (error) {
        console.error('Error fetching Gemini insights:', error);
        return {
            success: false,
            response: 'Sorry, unable to fetch insights at this time.',
            error: error.message
        };
    }
}

// Example usage in player profile page
async function fetchGeminiInsights(playerName, position) {
    const responseDiv = document.getElementById('gemini-response');
    const button = document.querySelector('.gemini-button');
    
    button.disabled = true;
    button.innerHTML = 'Loading...' + ' <span class="loading">⚪</span>';
    responseDiv.style.display = 'block';
    responseDiv.innerHTML = 'Fetching insights...';

    try {
        const insights = await getGeminiInsights(playerName, position);
        
        if (insights.success) {
            responseDiv.innerHTML = `<h3>Gemini's Insights</h3>${insights.response}`;
        } else {
            responseDiv.innerHTML = insights.response || 'Sorry, unable to fetch insights at this time.';
        }
    } catch (error) {
        responseDiv.innerHTML = 'Sorry, unable to fetch insights at this time.';
    } finally {
        button.disabled = false;
        button.innerHTML = 'Ask Gemini About This Player';
    }
}