function handleKeyPress(event) {
    if (event.key === 'Enter') {
        let searchTerm = document.getElementById('searchInput').value;
        searchSpotify(searchTerm);
    }
}

document.getElementById('searchInput').addEventListener('keypress', handleKeyPress);

document.getElementById('searchButton').addEventListener('click', function () {
    let searchTerm = document.getElementById('searchInput').value;
    searchSpotify(searchTerm);
    getSongLyrics();
});

// -------------------------------------------------------------------------------------------------

function searchSpotify(query) {
    const clientSecret = 'e1c9bffa0ed44bd4a69cb5e45b2e6ab6';
    const clientId = 'd980cc9583b2403baaf826a983a1e539';
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const tokenData = 'grant_type=client_credentials';

    // ------------------- Acess Token ---------------------------------------------

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
            console.log("acess token.........................................")
            console.log(data);
            const accessToken = data.access_token;
            const searchUrl = 'https://api.spotify.com/v1/search?q=' + encodeURIComponent(query) + '&type=track' + `&limit=10`;

    // ----------------------------- Music List -----------------------------------------------------

            fetch(searchUrl, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Music list ......................")
                    console.log(data);
                    let musicList = document.getElementById('musicList');
                    musicList.innerHTML = '';

                    // ------ Update UI ------------------------------

                    data.tracks.items.forEach(function (item) {
                        let li = document.createElement('li');
                        li.textContent = item.name + ' - ' + item.artists[0].name;

                        let playButton = document.createElement('button');
                        playButton.textContent = 'Play';
                        playButton.setAttribute("style", "margin: 0 10px;")

                        playButton.addEventListener('click', function () {
                            playTrack(item.preview_url);
                        });

                        // li.appendChild(playButton);
                        li.insertBefore(playButton, li.firstChild)
                        musicList.appendChild(li);
                    });
                })
                .catch(error => console.error('Error:', error));
        })
        .catch(error => console.error('Error:', error));
}

// -----------------------------------------------------------------

function getSongLyrics() {

    let testArtist = 'Gojira';
    let testSong = 'Magma'
    let lyricsApiUrl = `https://api.lyrics.ovh/v1/${testArtist}/${testSong}`;

    fetch(lyricsApiUrl, {
        method: 'GET'
    }) 
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })

}

// -----------------------------------------------------------------

function playTrack(previewUrl) {
    var audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = previewUrl;
    audioPlayer.play();
}