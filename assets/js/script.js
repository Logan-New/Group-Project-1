function handleKeyPress(event) {
    if (event.key === 'Enter') {
        var searchTerm = document.getElementById('searchInput').value;
        searchSpotify(searchTerm);
    }
}

document.getElementById('searchInput').addEventListener('keypress', handleKeyPress);

document.getElementById('searchButton').addEventListener('click', function() {
    var searchTerm = document.getElementById('searchInput').value;
    searchSpotify(searchTerm);
});

function searchSpotify(query) {
    var clientSecret = 'e1c9bffa0ed44bd4a69cb5e45b2e6ab6';
    var clientId = 'd980cc9583b2403baaf826a983a1e539';
    var tokenUrl = 'https://accounts.spotify.com/api/token';
    var tokenData = 'grant_type=client_credentials';

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
        var accessToken = data.access_token;
        var searchUrl = 'https://api.spotify.com/v1/search?q=' + encodeURIComponent(query) + '&type=track';

        fetch(searchUrl, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
        .then(response => response.json())
        .then(data => {
            var musicList = document.getElementById('musicList');
            musicList.innerHTML = '';

            data.tracks.items.forEach(function(item) {
                var li = document.createElement('li');
                li.textContent = item.name + ' - ' + item.artists[0].name;

                var playButton = document.createElement('button');
                playButton.textContent = 'Play';

                playButton.addEventListener('click', function() {
                    createSpotifyPlayer(item.uri);
                });

                var lyricsButton = document.createElement('button');
                lyricsButton.textContent = 'Lyrics';
                lyricsButton.addEventListener('click', function() {
                    getSongLyrics(item.artists[0].name, item.name);
                });

                li.appendChild(playButton);
                li.appendChild(lyricsButton);
                musicList.appendChild(li);
            });
        })
        .catch(error => console.error('Error:', error));
    })
    .catch(error => console.error('Error:', error));
}

function createSpotifyPlayer(trackUri) {
    var playerContainer = document.getElementById('spotifyPlayer');
    playerContainer.innerHTML = ''; // Clear previous player

    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', 'https://open.spotify.com/embed/track/' + trackUri.split(':')[2]);
    iframe.setAttribute('width', '300');
    iframe.setAttribute('height', '380');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('allow', 'encrypted-media');

    playerContainer.appendChild(iframe);
}

function getSongLyrics(artist, song) {
    var lyricsContainer = document.getElementById('lyrics-container');
    lyricsContainer.innerHTML = ''; // Clear previous lyrics

    var lyricsApiUrl = `https://api.lyrics.ovh/v1/${artist}/${song}`;

    fetch(lyricsApiUrl)
    .then(response => response.json())
    .then(data => {
        var lyricsText = document.createElement('p');
        if (data.lyrics) {
            lyricsText.textContent = data.lyrics;
        } else {
            lyricsText.textContent = 'Lyrics not found.';
        }
        lyricsContainer.appendChild(lyricsText);
    })
    .catch(error => console.error('Error:', error));
}
