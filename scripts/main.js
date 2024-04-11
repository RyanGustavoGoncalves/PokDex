const pokemonListE1 = document.getElementById("pokemons");
const modal = document.getElementById("modal");
let loading = false;
let offSet = 0;
let count = 0;

fetch(`https://pokeapi.co/api/v2/pokemon?limit=35`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar dados da API');
        }
        return response.json();
    })
    .then(loadPokemons)
    .catch(error => console.error(error))

async function loadPokemons(response) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
    try {
        let pokemons = response.results;
        count = response.count;
        pokemons = await Promise.all(pokemons.map(async (pokemon) => {
            const pokeResponse = await fetch(pokemon.url);
            if (!pokeResponse.ok) {
                throw new Error('Erro ao carregar dados do Pokémon');
            }
            pokemon = await pokeResponse.json();
            const specieResponse = await fetch(pokemon.species.url);
            if (!specieResponse.ok) {
                throw new Error('Erro ao carregar dados da espécie do Pokémon');
            }
            pokemon.species = await specieResponse.json();
            return pokemon;
        }));
        
        for (let i in pokemons) {
            showPokemons(pokemons[i])
        }
        
        offSet += response.results.length;
        loading = false;
    } catch (error) {
        console.error(error);
    } finally {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}


function showPokemons(pokemon) {
    try {
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

        const text = flavor_text.flavor_text.replace("\n", "");

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
        `;
    } catch (error) {
        console.error(error);
    }
}

window.addEventListener('scroll', async () => {
    const max = document.body.scrollHeight - window.innerHeight;
    const current = window.scrollY;
    const percent = current / max

    if (percent > 0.8 && loading == false) {
        loading = true;
        if (offSet > count) {
            return;
        }
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offSet}`);
            if (!response.ok) {
                throw new Error('Erro ao carregar dados da API');
            }
            const data = await response.json();
            await loadPokemons(data);
        } catch (error) {
            console.error(error);
        }
    }
});
