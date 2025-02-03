<?php
header('Content-Type: application/json');

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$player_name = $data['player_name'] ?? '';
$position = $data['position'] ?? '';

// Gemini API configuration
$api_key = 'AIzaSyA5qbuqTBFfDxZYeS57h4MwlzBIYmJU0X8';
$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Construct the prompt with structured sections
$prompt = "Provide a detailed analysis of {$player_name} who plays as {$position}. 
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

Please keep the response professional and factual, with clear section breaks.";

// Prepare the request
$data = [
    'contents' => [
        [
            'parts' => [
                ['text' => $prompt]
            ]
        ]
    ],
    'generationConfig' => [
        'temperature' => 0.7,
        'maxOutputTokens' => 1024,
    ]
];

// Make the API request
$ch = curl_init($url . '?key=' . $api_key);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Process and return the response
if ($http_code === 200) {
    $result = json_decode($response, true);
    
    if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        $text = $result['candidates'][0]['content']['parts'][0]['text'];
        
        // Clean up the text: remove multiple spaces and normalize line breaks
        $text = preg_replace('/\*+/', '', $text); // Remove asterisks
        $text = preg_replace('/~+/', '', $text); // Remove tildes
        $text = preg_replace('/"{2,}/', '', $text); // Remove multiple quotes
        $text = preg_replace('/\s+/', ' ', $text); // Normalize spaces
        $text = preg_replace('/\n\s*\n/', "\n", $text); // Normalize line breaks
        
        // Convert the sections into HTML for better formatting
        $text = str_replace('PLAYER OVERVIEW', '<h3>Player Overview</h3>', $text);
        $text = str_replace('CURRENT PERFORMANCE', '<h3>Current Performance</h3>', $text);
        $text = str_replace('PLAYING STYLE', '<h3>Playing Style</h3>', $text);
        $text = str_replace('STRENGTHS', '<h3>Strengths</h3>', $text);
        $text = str_replace('AREAS FOR IMPROVEMENT', '<h3>Areas for Improvement</h3>', $text);
        $text = str_replace('FUTURE PROSPECTS', '<h3>Future Prospects</h3>', $text);
        $text = str_replace('STATISTICAL HIGHLIGHTS', '<h3>Statistical Highlights</h3>', $text);
        
        // Convert bullet points
        $text = preg_replace('/•\s*([^•\n]+)/', '<li>$1</li>', $text);
        $text = preg_replace('/<li>/', '<ul><li>', $text, 1);
        $text = preg_replace('/<\/li>\s*(?!<li>)/', '</li></ul>', $text);
        
        // Add paragraph tags for better spacing
        $text = preg_replace('/([^>])\n\n([^<])/', '$1</p><p>$2', $text);
        $text = '<div class="player-analysis">' . $text . '</div>';
        
        echo json_encode([
            'success' => true,
            'response' => $text,
            'player_name' => $player_name,
            'position' => $position
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'response' => 'Invalid response structure',
            'error' => 'Response format error'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'response' => 'Sorry, unable to fetch insights at this time.',
        'error' => $http_code
    ]);
}