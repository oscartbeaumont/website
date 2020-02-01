const img = document.getElementById("dog-gif");

fetch('https://api.thedogapi.com/v1/images/search?size=full', {
    headers: {
        'x-api-key': "{{ .Site.Params.TheDogAPIKey }}"
    }
})
    .then(res => res.json())
    .then(res => {
        img.src = res[0].url
        img.alt = "Random Dog GIF from TheDogAPI"
    })
    .catch(console.error);