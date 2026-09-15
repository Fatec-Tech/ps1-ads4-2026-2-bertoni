const pacientes = [];

let quantidadeJson = 0;
let quantidadeSessao = 0;

const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const mensagemCarregando = document.getElementById('carregando');
function adicionarPaciente(nome, email, nascimento) {
	pacientes.push({ nome, email, nascimento });
}

function renderizarTabela() {
	tabela.innerHTML = '';

	pacientes.forEach((paciente) => {
		const linha = document.createElement('tr');
		linha.innerHTML = `
      <td>${paciente.nome}</td>
      <td>${paciente.email}</td>
      <td>${formatarData(paciente.nascimento)}</td>
    `;
		tabela.appendChild(linha);
	});
}

function formatarData(dataISO) {
	const [ano, mes, dia] = dataISO.split('-');
	return `${dia}/${mes}/${ano}`;
}

// Nova função: busca os pacientes iniciais a partir do arquivo JSON
async function carregarPacientesIniciais() {
	try {
		await new Promise(function(resolve) {
    		setTimeout(resolve, 1000);
		});// Simula atraso de 1 segundo



		const resposta = await fetch('data/pacientes.json');
		console.log(resposta);

		// Nem toda resposta é sucesso — precisamos checar antes de usar
		if (!resposta.ok) {
			throw new Error(`Erro HTTP: ${resposta.status}`);
		}

		const dados = await resposta.json(); // converte a resposta em objeto JS

		quantidadeJson = dados.length;

		if (quantidadeJson === 0) {
			mensagemCarregando.textContent =
				'Nenhum paciente cadastrado ainda.';
			tabela.closest('table').style.display = 'none';
			return; // sai da função sem tentar renderizar a tabela
		}

		// Adiciona cada paciente vindo do arquivo ao nosso array local
		dados.forEach((paciente) => {
			adicionarPaciente(paciente.nome, paciente.email, paciente.nascimento);
		});

		renderizarTabela();
	} catch (erro) {
		console.error('Não foi possível carregar os pacientes:', erro);
		mensagemCarregando.textContent =
			'Erro ao carregar pacientes. Veja o console para mais detalhes.';
		return; // sai da função sem esconder a mensagem de erro
	}

	mensagemCarregando.innerHTML =
		`Dados carregados com sucesso.
		<br>Quantidade de pacientes Json: <strong>${quantidadeJson}</strong>
		<br>Quantidade pacientes cadastrados: <strong>${quantidadeSessao}</strong>.`;
	// mensagemCarregando.style.display = 'none'; // esconde "Carregando..." em caso de sucesso
}

formulario.addEventListener('submit', (event) => {
	event.preventDefault();

	const nome = document.getElementById('nome').value;
	const email = document.getElementById('email').value;
	const nascimento = document.getElementById('nascimento').value;

	adicionarPaciente(nome, email, nascimento);

	quantidadeSessao++;

	mensagemCarregando.innerHTML =
    `Dados carregados com sucesso.
    <br>Quantidade de pacientes JSON: <strong>${quantidadeJson}</strong>
    <br>Quantidade pacientes cadastrados: <strong>${quantidadeSessao}</strong>.`;

	renderizarTabela();

	formulario.reset();
});

// Assim que o script carrega, já dispara a busca dos dados iniciais
carregarPacientesIniciais();
