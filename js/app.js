// Array que guarda os pacientes cadastrados.
// Se houver dados salvos no localStorage, eles serão carregados.
const pacientes = JSON.parse(localStorage.getItem('pacientes')) || [];

// Referências aos elementos do DOM que vamos usar várias vezes
const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');

const totalPacientes = document.getElementById('total-pacientes');
const busca = document.getElementById('busca');
const ordenarNome = document.getElementById('ordenar-nome');

// Controla se a ordenação será crescente ou decrescente
let ordemCrescente = true;


// Função responsável por adicionar um paciente ao array
function adicionarPaciente(nome, email, telefone, nascimento) {

	const novoPaciente = {
		nome,
		email,
		telefone,
		nascimento
	};

	pacientes.push(novoPaciente);

	salvarPacientes();
}


// Função responsável por desenhar a tabela inteira a partir do array
function renderizarTabela(lista = pacientes) {

	tabela.innerHTML = ''; // limpa a tabela antes de redesenhar

	lista.forEach((paciente) => {

		const linha = document.createElement('tr');

		linha.innerHTML = `
			<td>${paciente.nome}</td>
			<td>${paciente.email}</td>
			<td>${paciente.telefone}</td>
			<td>${formatarData(paciente.nascimento)}</td>
			<td>${calcularIdade(paciente.nascimento)}</td>
			<td></td>
		`;

		// Cria o botão remover
		const botaoRemover = document.createElement('button');

		botaoRemover.textContent = 'Remover';

		botaoRemover.classList.add(
			'btn',
			'btn-danger',
			'btn-sm'
		);


		// Evento do botão remover
		botaoRemover.addEventListener('click', () => {

			removerPaciente(paciente.email);

		});


		// Coloca o botão na última coluna
		linha.lastElementChild.appendChild(botaoRemover);


		tabela.appendChild(linha);

	});


	// Atualiza o contador
	totalPacientes.textContent =
		`Total de pacientes: ${pacientes.length}`;
}


// Função utilitária só para formatar a data no padrão dd/mm/aaaa
function formatarData(dataISO) {

	const [ano, mes, dia] = dataISO.split('-');

	return `${dia}/${mes}/${ano}`;
}


// Função para calcular a idade do paciente
function calcularIdade(dataNascimento) {

	const hoje = new Date();

	const [ano, mes, dia] =
		dataNascimento.split('-').map(Number);


	let idade =
		hoje.getFullYear() - ano;


	// Verifica se o aniversário já aconteceu neste ano
	if (
		hoje.getMonth() + 1 < mes ||
		(
			hoje.getMonth() + 1 === mes &&
			hoje.getDate() < dia
		)
	) {

		idade--;

	}


	return idade;
}


// Função para verificar se o e-mail já existe
function emailJaExiste(email) {

	return pacientes.some((paciente) => {

		return paciente.email.toLowerCase()
			=== email.toLowerCase();

	});

}


// Função responsável por remover um paciente
function removerPaciente(email) {

	const indice = pacientes.findIndex((paciente) => {

		return paciente.email === email;

	});


	if (indice !== -1) {

		pacientes.splice(indice, 1);

		salvarPacientes();

		renderizarTabela();

	}

}


// Função responsável por salvar os pacientes no navegador
function salvarPacientes() {

	localStorage.setItem(
		'pacientes',
		JSON.stringify(pacientes)
	);

}


// Evento disparado quando o formulário é enviado
formulario.addEventListener('submit', (event) => {

	event.preventDefault(); // evita o recarregamento da página


	const nome =
		document.getElementById('nome').value;

	const email =
		document.getElementById('email').value;

	const telefone =
		document.getElementById('telefone').value;

	const nascimento =
		document.getElementById('nascimento').value;


	// Validação de e-mail duplicado
	if (emailJaExiste(email)) {

		alert('Este e-mail já está cadastrado!');

		return;

	}


	adicionarPaciente(
		nome,
		email,
		telefone,
		nascimento
	);


	renderizarTabela();


	formulario.reset(); // limpa os campos do formulário

});


// Busca em tempo real
busca.addEventListener('input', () => {

	const textoBusca =
		busca.value.toLowerCase();


	const pacientesFiltrados =
		pacientes.filter((paciente) => {

			return paciente.nome
				.toLowerCase()
				.includes(textoBusca);

		});


	renderizarTabela(pacientesFiltrados);

});


// Ordenação pelo nome
ordenarNome.addEventListener('click', () => {

	pacientes.sort((a, b) => {

		if (ordemCrescente) {

			return a.nome.localeCompare(b.nome);

		} else {

			return b.nome.localeCompare(a.nome);

		}

	});


	ordemCrescente = !ordemCrescente;


	salvarPacientes();

	renderizarTabela();

});


// Renderiza os pacientes quando a página abrir
renderizarTabela();