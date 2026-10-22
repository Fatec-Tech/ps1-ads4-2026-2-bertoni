const API_URL = 'https://pokeapi.co/api/v2/pokemon';

const pokemonGrid = document.getElementById('pokemonGrid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Função para buscar os detalhes individuais de um Pokémon
async function fetchPokemonData(urlOrName) {
	const url = urlOrName.startsWith('http')
		? urlOrName
		: `${API_URL}/${urlOrName.toLowerCase().trim()}`;

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('Pokémon não encontrado');
  }
  console.log('Response:', response); // Log da resposta para depuração
	return await response.json();
}

// Função para carregar a lista inicial (ex: primeiros 20)
async function loadInitialPokemon(limit = 20) {
	showLoading(true);
	pokemonGrid.innerHTML = '';

	try {
		const response = await fetch(`${API_URL}?limit=${limit}`);
		const data = await response.json();

		// Faz requisição paralela dos detalhes de cada um dos itens listados
		const pokemonPromises = data.results.map((item) =>
			fetchPokemonData(item.url)
		);
		const pokemonList = await Promise.all(pokemonPromises);

		// Renderiza cada card
		pokemonList.forEach(renderPokemonCard);
	} catch (error) {
		showError('Erro ao carregar a lista de Pokémon.');
		console.error(error);
	} finally {
		showLoading(false);
	}
}

// Função para criar a estrutura visual do Card no Bootstrap
function renderPokemonCard(pokemon) {
  console.log('Rendering Pokémon:', pokemon); // Log do Pokémon para depuração
	// Pega a imagem oficial de alta qualidade (dream_world ou official-artwork)
	const imageUrl =
		pokemon.sprites.other['official-artwork'].front_default ||
		pokemon.sprites.front_default;

	// Mapeia os tipos para Badges do Bootstrap
	const typesBadges = pokemon.types
		.map(
			(t) =>
				`<span class="badge bg-secondary badge-type">${t.type.name}</span>`
		)
		.join('');

	// Formata peso (em kg) e altura (em m)
	const heightInMeters = (pokemon.height / 10).toFixed(1);
	const weightInKg = (pokemon.weight / 10).toFixed(1);

	const cardHTML = `
        <div class="col">
          <div class="card h-100 shadow-sm pokemon-card border-0"
		       style="cursor: pointer;"
  			   onclick="openPokemonModal(${pokemon.id})">
		
            <div class="text-center p-3 bg-white rounded-top">
              <img src="${imageUrl}" class="card-img-top img-fluid" style="max-height: 160px; object-fit: contain;" alt="${pokemon.name}">
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title text-capitalize fw-bold m-0">${pokemon.name}</h5>
                <small class="text-muted">#${String(pokemon.id).padStart(3, '0')}</small>
              </div>
              <div class="mb-3">
                ${typesBadges}
              </div>
              <div class="row text-center border-top pt-2">
                <div class="col-6 border-end">
                  <small class="text-muted d-block">Altura</small>
                  <strong>${heightInMeters} m</strong>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block">Peso</small>
                  <strong>${weightInKg} kg</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

	pokemonGrid.insertAdjacentHTML('beforeend', cardHTML);
}

async function openPokemonModal(id) {
	const modalElement = document.getElementById('pokemonModal');
	const modal = new bootstrap.Modal(modalElement);

	const modalTitle = document.getElementById('pokemonModalTitle');
	const modalBody = document.getElementById('pokemonModalBody');

	// Abre o modal e mostra loading
	modalTitle.textContent = 'Carregando...';

	modalBody.innerHTML = `
		<div class="text-center py-4">
			<div class="spinner-border text-danger" role="status">
				<span class="visually-hidden">Carregando...</span>
			</div>
		</div>
	`;

	modal.show();

	try {
		const pokemon = await fetchPokemonData(String(id));

		modalTitle.textContent = pokemon.name;

		const statNames = {
			hp: 'HP',
			attack: 'Ataque',
			defense: 'Defesa',
			speed: 'Velocidade'
		};

		const statsHTML = pokemon.stats
			.filter((item) => statNames[item.stat.name])
			.map((item) => {
				const valor = item.base_stat;

				return `
					<div class="mb-2">
						<small class="fw-bold">
							${statNames[item.stat.name]}: ${valor}
						</small>

						<div class="progress" style="height: 10px;">
							<div
								class="progress-bar bg-danger"
								style="width: ${Math.min(valor, 100)}%;">
							</div>
						</div>
					</div>
				`;
			})
			.join('');

		const spritesHTML = `
			<div class="row text-center">
				<div class="col-6 col-md-3">
					<p class="mb-1">Frente Normal</p>
					<img src="${pokemon.sprites.front_default}" class="img-fluid">
				</div>

				<div class="col-6 col-md-3">
					<p class="mb-1">Costas Normal</p>
					<img src="${pokemon.sprites.back_default}" class="img-fluid">
				</div>

				<div class="col-6 col-md-3">
					<p class="mb-1">Frente<br>Shiny</p>
					<img src="${pokemon.sprites.front_shiny}" class="img-fluid">
				</div>

				<div class="col-6 col-md-3">
					<p class="mb-1">Costas<br>Shiny</p>
					<img src="${pokemon.sprites.back_shiny}" class="img-fluid">
				</div>
			</div>
		`;

		const cryUrl = pokemon.cries.latest || pokemon.cries.legacy;

		modalBody.innerHTML = `
			<div class="text-center">
				<img
					src="${pokemon.sprites.other['official-artwork'].front_default}"
					class="img-fluid mb-3"
					style="max-height: 200px; object-fit: contain;"
					alt="${pokemon.name}"
				>

				<h6>Habilidades</h6>
				<p>
					${pokemon.abilities
						.map((item) => item.ability.name)
						.join(', ')}
				</p>

				<hr>

				<h6>Status Base</h6>
				${statsHTML}

				<hr>

				<h6>Sprites</h6>
				${spritesHTML}

				<hr>

				<h6>Som do Pokémon</h6>

				${
					cryUrl
						? `<audio controls class="w-100">
								<source src="${cryUrl}">
						   </audio>`
						: `<p class="text-muted">Áudio não disponível.</p>`
				}
			</div>
		`;

	} catch (error) {
		modalTitle.textContent = 'Erro';

		modalBody.innerHTML = `
			<div class="alert alert-warning text-center">
				Não foi possível carregar os detalhes deste Pokémon.
			</div>
		`;

		console.error(error);
	}
}

// Busca específica por nome ou ID
async function handleSearch() {
	const query = searchInput.value.trim();
	if (!query) {
		loadInitialPokemon();
		return;
	}

	showLoading(true);
	pokemonGrid.innerHTML = '';

	try {
		const pokemon = await fetchPokemonData(query);
		renderPokemonCard(pokemon);
	} catch (error) {
		showError(`Nenhum Pokémon encontrado com o termo "${query}".`);
	} finally {
		showLoading(false);
	}
}

// Utilitários de UI
function showLoading(state) {
	if (state) {
		loading.classList.remove('d-none');
	} else {
		loading.classList.add('d-none');
	}
}

function showError(message) {
	pokemonGrid.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning text-center" role="alert">
            ${message}
          </div>
        </div>
      `;
}

// Eventos
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
	if (e.key === 'Enter') handleSearch();
});

// Inicialização
loadInitialPokemon();
