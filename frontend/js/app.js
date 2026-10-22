
const pacientes = [];

let quantidadeJson = 0;
let quantidadeSessao = 0;

const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const mensagemCarregando = document.getElementById('carregando');

// Endereço da API criada na Aula 03
const URL_API = 'http://localhost:3000/pacientes';

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

// Busca os pacientes diretamente do backend
async function carregarPacientesIniciais() {
    try {
        const resposta = await fetch(URL_API);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const dados = await resposta.json();

        quantidadeJson = dados.length;

        if (quantidadeJson === 0) {
            mensagemCarregando.textContent =
                'Nenhum paciente cadastrado ainda.';
            tabela.closest('table').style.display = 'none';
            return;
        }

        dados.forEach((paciente) => {
            adicionarPaciente(
                paciente.nome,
                paciente.email,
                paciente.nascimento
            );
        });

        renderizarTabela();

    } catch (erro) {
        console.error('Não foi possível carregar os pacientes:', erro);

        mensagemCarregando.textContent =
            'Erro ao carregar pacientes. O servidor está rodando?';

        return;
    }

    mensagemCarregando.innerHTML = `
        Dados carregados com sucesso.
        <br>Quantidade de pacientes da API: <strong>${quantidadeJson}</strong>
        <br>Quantidade pacientes cadastrados: <strong>${quantidadeSessao}</strong>.
    `;
}

// Cadastro manual de pacientes
formulario.addEventListener('submit', (event) => {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const nascimento = document.getElementById('nascimento').value;

    adicionarPaciente(nome, email, nascimento);

    quantidadeSessao++;

    mensagemCarregando.innerHTML = `
        Dados carregados com sucesso.
        <br>Quantidade de pacientes da API: <strong>${quantidadeJson}</strong>
        <br>Quantidade pacientes cadastrados: <strong>${quantidadeSessao}</strong>.
    `;

    renderizarTabela();

    formulario.reset();
});

// Carrega os pacientes ao abrir a página
carregarPacientesIniciais();
