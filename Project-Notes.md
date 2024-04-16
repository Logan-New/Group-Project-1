# 4.13.24 Project Notes

## Must-Haves:
1. Audio player
2. Song lyrics

Website should have a search functionality to search for artists in order to display a list of songs. 
Website should have lyrics to songs displayed.
***
### Website components: 
- search form
- appended list with search results
	- list items as links to corresponding spotify page
	- list items with play button for audio player
- audio player widget
- div to display song lyrics
***

### API's
- Spotify:
- Lyrics.ovh

Confirm that api's work- paywalls, authorizations, call-limits.
==Autosave can use up call limits==

To avoid using up call limits, call api's on click of button while developing.
***
## Git merging

Always merge main branch into new feature branch *before creating PR*. Feature branch should always be up to date with the main branch.

https://gist.github.com/ttudorandrei/089ec9c9e0842911c70ed3630ab04909

![[Git branches.png]]


***

## Site steps
- make sure api's are working
- map out site layout
- break out into groups of two
- divide labor into site components
- everyone should 
- Either everyone uses formatting/lenting or no one uses it -prettier

### Prettier setup

- download the Prettier extension
- go to `Settings` search for 'format on save' and tick it
- got to the file you want to format, right click -> `Format Document`, `configure` and choose `Prettier` in the menu opening at the top