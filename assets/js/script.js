// Function to handle search when Enter key is pressed
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        var searchTerm = document.getElementById('searchInput').value;
        searchSpotify(searchTerm);
    }
}

// Event listener for Enter key press on the search input field
document.getElementById('searchInput').addEventListener('keypress', handleKeyPress);

// Function to handle Spotify API search
function searchSpotify(query) {
    // Replace 'YOUR_CLIENT_SECRET' with your actual Spotify client secret
    var clientSecret = 'e1c9bffa0ed44bd4a69cb5e45b2e6ab6';
    var clientId = 'd980cc9583b2403baaf826a983a1e539'; // Replace 'YOUR_CLIENT_ID' with your actual Spotify client ID

    // Construct the request URL for obtaining access token
    var tokenUrl = 'https://accounts.spotify.com/api/token';
    var tokenData = 'grant_type=client_credentials';

    // Make a POST request to obtain access token
    fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: tokenData
    })
    .then(response => response.json())
    .then(data => {
        // Extract access token from the response
        var accessToken = data.access_token;

        // Construct the request URL for searching tracks
        var searchUrl = 'https://api.spotify.com/v1/search?q=' + encodeURIComponent(query) + '&type=track';

        // Make a GET request to search tracks
        fetch(searchUrl, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
        .then(response => response.json())
        .then(data => {
            // Clear previous search results
            var musicList = document.getElementById('musicList');
            musicList.innerHTML = '';

            // Append new search results
            data.tracks.items.forEach(function(item) {
                var li = document.createElement('li');
                li.textContent = item.name + ' - ' + item.artists[0].name;
                musicList.appendChild(li);
            });
        })
        .catch(error => console.error('Error:', error));
    })
    .catch(error => console.error('Error:', error));
}
