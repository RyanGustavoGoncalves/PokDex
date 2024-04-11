const pokemonListE1 = document.getElementById("pokemons");
let loading = false;
let offSet = 0;
let count = 0;

fetch(`https://pokeapi.co/api/v2/pokemon?limit=20`)
    .then(response => response.json())
    .then(loadPokemons)
    .catch(error => console.log(error))

async function loadPokemons(response) {
    const pokemons = response.results
    for (let i in pokemons) {
        const pokeResponse = await fetch(pokemons[i].url);
        const pokemon = await pokeResponse.json();
        const specieResponse = await fetch(pokemon.species.url);
        pokemon.species = await specieResponse.json();
        showPokemons(pokemon);
    }
    offSet += response.results.length;
    loading = false;
}


function showPokemons(pokemon) {
    const name = pokemon.name;
    const weight = pokemon.weight / 10;
    const height = pokemon.height / 10;
    const id = `${pokemon.id}`.padStart(4, '0');
    const tags = pokemon.types.map((item) => {
        return item.type.name;
    });

    const tag = tags[0];
    let image = pokemon.sprites.front_default
    if (pokemon.sprites.other["official-artwork"]) {
        image = pokemon.sprites.other["official-artwork"].front_default
    }

    const flavor_text = pokemon.species.flavor_text_entries.find(item => {
        if (item.language.name == "en") {
            return true;
        }

        return false;
    });

    const text = flavor_text.flavor_text
        .replace("\n", "")



    console.log(pokemon);
    pokemonListE1.innerHTML += `
        <article class="pokemon ${tag}">
                <div>
                    <div class="info-content">
                        <h2>${name}</h2>
                        <span>${text}</span>
                        <p><strong>Altura</strong> ${height}m</p>
                        <p><strong>Peso</strong> ${weight}kg</p>

                        <div class="element-content">
                        ${tags.map(tag =>
        `<div class="element ${tag}-element">
                                    ${tag}
                                </div>`
    ).join("")
        }
  
                        </div>
                    </div>
                </div>
                <div class="id">
                    <span>#${id}</span>
                    <img src="${image}" alt="${name}">
                </div>
        </article>
    `
}

window.addEventListener('scroll', (event) => {
    const max = document.body.scrollHeight - window.innerHeight;
    const current = window.scrollY;
    const percent = current / max

    if (percent > 0.8 && loading == false) {
        loading = true;
        console.log(offSet);
        fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offSet}`)
            .then(response => response.json())
            .then(loadPokemons)
            .catch(error => console.log(error))
    }
})