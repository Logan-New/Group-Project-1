// Global variables to store the current track URI, shuffle state, repeat state, and queue of songs
var currentTrackUri = '';
var isShuffleEnabled = false;
var isRepeatEnabled = false;
var songQueue = [];

// Global variable to store the AudioContext
var audioContext;

// Function to create or resume AudioContext
function createOrResumeAudioContext() {
    // Check if audioContext already exists and is suspended
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(function() {
            console.log('AudioContext resumed successfully.');
            // Call your audio-related functions here
        }).catch(function(err) {
            console.error('Failed to resume AudioContext:', err);
        });
    } else {
        // Create new AudioContext
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('AudioContext created successfully.');
        // Call your audio-related functions here
    }
}

// Event listener to create or resume AudioContext on user interaction
document.addEventListener('click', createOrResumeAudioContext);

// Function to populate the search history dropdown without duplicates
function populateSearchHistoryDropdown() {
    var searches = JSON.parse(localStorage.getItem('searches')) || [];
    var uniqueSearches = [...new Set(searches)]; // Remove duplicates
    var dropdown = document.getElementById('searchHistoryDropdown');
    dropdown.innerHTML = ''; // Clear previous dropdown options
    uniqueSearches.forEach(function(search) {
        var option = document.createElement('option');
        option.value = search;
        option.textContent = search;
        dropdown.appendChild(option);
    });
}

// Function to handle search and store search history
function handleSearch(query) {
    // Store search term in local storage
    var searches = JSON.parse(localStorage.getItem('searches')) || [];
    searches.push(query);
    localStorage.setItem('searches', JSON.stringify(searches));
    
    // Perform Spotify search
    searchSpotify(query);
}

// Function to play a random song from the generated list or queue
function playRandomSong(userInitiated = false) {
    if (isShuffleEnabled || userInitiated) {
        // If shuffle is enabled or initiated by the user, play songs from the queue
        if (songQueue.length > 0) {
            var randomIndex = Math.floor(Math.random() * songQueue.length);
            var trackUri = songQueue[randomIndex];
            createSpotifyPlayer(trackUri, true); // Pass shuffle state
        } else {
            console.log("No songs available in the queue.");
        }
    } else {
        // If shuffle is not enabled and not initiated by the user, play a random song from the generated list
        var musicList = document.getElementById('musicList').getElementsByTagName('li');
        if (musicList.length > 0) {
            var randomIndex = Math.floor(Math.random() * musicList.length);
            var randomSong = musicList[randomIndex];
            var trackUri = randomSong.getAttribute('data-uri');
            createSpotifyPlayer(trackUri, false); // Pass shuffle state
        } else {
            console.log("No songs available to play.");
        }
    }
}

// Function for creating Spotify player with shuffle and repeat options
function createSpotifyPlayer(trackUri, shuffle = false, repeat = false) {
    // Call function to create or resume AudioContext
    createOrResumeAudioContext();

    var playerContainer = document.getElementById('spotifyPlayer');
    playerContainer.innerHTML = ''; // Clear previous player

    // Save the current track URI
    currentTrackUri = trackUri;

    var iframeSrc = 'https://open.spotify.com/embed/track/' + trackUri.split(':')[2];
    if (shuffle) {
        // Shuffle mode doesn't require additional URL parameters
        isShuffleEnabled = true;
        isRepeatEnabled = false; // Deactivate repeat if shuffle is enabled
        document.getElementById('repeatButton').classList.remove('active'); // Remove active class from repeat button
    }
    if (repeat) {
        iframeSrc += (shuffle ? '&' : '?') + 'autoplay=1';
        isRepeatEnabled = true;
        isShuffleEnabled = false; // Deactivate shuffle if repeat is enabled
        document.getElementById('shuffleButton').classList.remove('active'); // Remove active class from shuffle button
    }

    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', iframeSrc);
    iframe.setAttribute('width', '900');
    iframe.setAttribute('height', '380');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('allow', 'encrypted-media');

    playerContainer.appendChild(iframe);

    // If shuffle is enabled, add event listener to reload iframe when ended
    if (shuffle) {
        iframe.addEventListener('load', function() {
            // When the iframe is loaded, add the 'ended' event listener to it
            iframe.contentWindow.document.querySelector('audio').addEventListener('ended', function() {
                // If shuffle is enabled, play another song from the queue
                playRandomSong();
            });
        });
    } else if (repeat) {
        // If repeat is enabled, add event listener to play the same song again
        iframe.addEventListener('load', function() {
            // When the iframe is loaded, restart the song if repeat is enabled
            if (isRepeatEnabled) {
                iframe.contentWindow.document.querySelector('audio').currentTime = 0;
            }
        });
    } else {
        // If neither shuffle nor repeat, add event listener to play the next song in the queue
        iframe.addEventListener('load', function() {
            // When the iframe is loaded, add the 'ended' event listener to it
            iframe.contentWindow.document.querySelector('audio').addEventListener('ended', function() {
                // Play the next song in the queue
                playRandomSong(true); // Pass true to indicate user-initiated shuffle
            });
        });
    }
}

// Event listener for shuffle button
document.getElementById('shuffleButton').addEventListener('click', function() {
    // Toggle shuffle state
    isShuffleEnabled = !isShuffleEnabled;
    // Toggle active class for styling
    this.classList.toggle('active');
    // Deactivate repeat if shuffle is enabled
    if (isShuffleEnabled) {
        isRepeatEnabled = false;
        document.getElementById('repeatButton').classList.remove('active');
    }
    // Play a random song if shuffle is enabled
    if (isShuffleEnabled) {
        playRandomSong(true); // Pass true to indicate user-initiated shuffle
    }
});

// Event listener for repeat button
document.getElementById('repeatButton').addEventListener('click', function() {
    // Toggle repeat state
    isRepeatEnabled = !isRepeatEnabled;
    // Toggle active class for styling
    this.classList.toggle('active');
    // Deactivate shuffle if repeat is enabled
    if (isRepeatEnabled) {
        isShuffleEnabled = false;
        document.getElementById('shuffleButton').classList.remove('active');
    }
    // If repeat is enabled, restart the current song
    if (isRepeatEnabled) {
        createSpotifyPlayer(currentTrackUri, false, true); // Pass true for repeat
    }
});

// Event listener for search button click and Enter key press in search input
function submitSearchInputVal() {
        var searchTerm = document.getElementById('searchInput').value;
        handleSearch(searchTerm);
        document.getElementById('searchInput').value = "";
}

document.getElementById('searchButton').addEventListener('click', submitSearchInputVal);

document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        submitSearchInputVal();
    }
});

// Event listener for dropdown selection
document.getElementById('searchHistoryDropdown').addEventListener('change', function() {
    var selectedValue = this.value;
    document.getElementById('searchInput').value = selectedValue;
    // Automatically trigger search when a dropdown option is selected
    searchSpotify(selectedValue);
});

// Function to be called on page load to populate the dropdown initially
window.onload = function() {
    populateSearchHistoryDropdown();
};

// Function for Spotify search
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

            songQueue = []; // Clear previous queue
            data.tracks.items.forEach(function(item) {
                var li = document.createElement('li');
                li.textContent = item.name + ' - ' + item.artists[0].name;
                li.setAttribute('data-uri', item.uri); // Add URI attribute

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

                // Add each track URI to the songQueue
                songQueue.push(item.uri);
            });

            // Play a random song automatically if shuffle is enabled
            playRandomSong();
        })
        .catch(error => console.error('Error:', error));
    })
    .catch(error => console.error('Error:', error));
}

// Function for getting song lyrics
function getSongLyrics(artist, song) {
    var lyricsContainer = document.getElementById('lyrics-container');
    lyricsContainer.innerHTML = ''; // Clear previous lyrics

    var lyricsApiUrl = `https://api.lyrics.ovh/v1/${artist}/${song}`;

    fetch(lyricsApiUrl)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        var lyricsText = document.createElement('pre');
        if (data.lyrics) {
            lyricsText.textContent = data.lyrics;
        } else {
            lyricsText.textContent = 'Lyrics not found.';
        }
        lyricsContainer.appendChild(lyricsText);
    })
    .catch(error => console.error('Error:', error));
}

// ------------------ Open & Close Modal----------------------------------------------------
document.getElementById('activate-modal-button').addEventListener('click', function() {
    document.getElementById('search-modal').setAttribute('class', 'modal is-active');
})

function closeModal() {
    document.getElementById('search-modal').removeAttribute('class');
    console.log("close button pressed");
    document.getElementById('search-modal').setAttribute('class', 'modal');
}

document.getElementById('close-modal-button').addEventListener('click', closeModal);

document.getElementById('searchButton').addEventListener('click', closeModal);
