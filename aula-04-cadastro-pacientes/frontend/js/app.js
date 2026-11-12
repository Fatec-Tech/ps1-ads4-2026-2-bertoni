
const pacientes = [];

let quantidadeJson = 0;

const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const mensagemCarregando = document.getElementById('carregando');
const mensagem = document.getElementById('mensagem');

const campoId = document.getElementById('id');
const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoNascimento = document.getElementById('nascimento');

const botaoSalvar = document.getElementById('btn-salvar');
const botaoCancelar = document.getElementById('btn-cancelar');

// EndereÃ§o da API criada na Aula 03
const URL_API = 'http://localhost:3000/pacientes';

function criarCelula(texto) {
        const celula = document.createElement('td');
        celula.textContent = texto;
        return celula;
        }

function renderizarTabela() {
    tabela.innerHTML = '';

    pacientes.forEach((paciente) => {
        const linha = document.createElement('tr');

        linha.appendChild(criarCelula(paciente.nome));
        linha.appendChild(criarCelula(paciente.email));
        linha.appendChild(
            criarCelula(formatarData(paciente.nascimento))
        );

        const celulaAcoes = document.createElement('td');

        const botaoEditar = document.createElement('button');
        botaoEditar.type = 'button';
        botaoEditar.textContent = 'Editar';
        botaoEditar.className = 'btn btn-sm btn-outline-primary me-2';

        botaoEditar.addEventListener('click', () => {
            iniciarEdicao(paciente);
        });

        const botaoExcluir = document.createElement('button');
        botaoExcluir.type = 'button';
        botaoExcluir.textContent = 'Excluir';
        botaoExcluir.className = 'btn btn-sm btn-outline-danger';

        botaoExcluir.addEventListener('click', () => {
            excluirPaciente(paciente.id);
        });

        celulaAcoes.appendChild(botaoEditar);
        celulaAcoes.appendChild(botaoExcluir);
        linha.appendChild(celulaAcoes);    

        tabela.appendChild(linha);      
    });
}

function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

function iniciarEdicao(paciente) {
    campoId.value = paciente.id;
    campoNome.value = paciente.nome;
    campoEmail.value = paciente.email;
    campoNascimento.value = paciente.nascimento;

    botaoSalvar.textContent = 'Atualizar';
    botaoCancelar.classList.remove('d-none');

    campoNome.focus();
}

function limparFormulario() {
    formulario.reset();
    campoId.value = '';

    botaoSalvar.textContent = 'Salvar';
    botaoCancelar.classList.add('d-none');
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

        pacientes.length = 0;
        pacientes.push(...dados);

        renderizarTabela();

        tabela.closest('table').style.display = '';

        if (quantidadeJson === 0) {
            mensagemCarregando.textContent =
                'Nenhum paciente cadastrado ainda.';
            return;
        }

    } catch (erro) {
        console.error('NÃ£o foi possÃ­vel carregar os pacientes:', erro);

        mensagemCarregando.textContent =
            'Erro ao carregar pacientes. O servidor estÃ¡ rodando?';

        return;
    }

    mensagemCarregando.textContent =
    `Total de pacientes cadastrados: ${quantidadeJson}`;
}

function mostrarMensagem(texto, tipo = 'danger') {
    mensagem.innerHTML = '';

    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = texto;

    mensagem.appendChild(alerta);
}

async function salvarPaciente(dados, id) {
    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${URL_API}/${id}` : URL_API;

    const resposta = await fetch(url, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
        const erro = await resposta.json();
        throw new Error(erro.erro || `Erro HTTP: ${resposta.status}`);
    }
}

async function excluirPaciente(id) {
    if (!confirm('Deseja realmente excluir este paciente?')) {
        return;
    }

    try {
        const resposta = await fetch(`${URL_API}/${id}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(
                erro.erro || `Erro HTTP: ${resposta.status}`
            );
        }

        if (campoId.value === String(id)) {
            limparFormulario();
        }

        mostrarMensagem('Paciente excluÃ­do com sucesso.', 'success');
        await carregarPacientesIniciais();
    } catch (erro) {
        mostrarMensagem(erro.message);
    }
}
// Cadastro ou atualizaÃ§Ã£o pela API
formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    const dados = {
        nome: campoNome.value,
        email: campoEmail.value,
        nascimento: campoNascimento.value
    };

    try {
        await salvarPaciente(dados, campoId.value);

        mostrarMensagem('Paciente salvo com sucesso.', 'success');
        limparFormulario();

        await carregarPacientesIniciais();
    } catch (erro) {
        mostrarMensagem(erro.message);
    }
});

// Carrega os pacientes ao abrir a pÃ¡gina
carregarPacientesIniciais();

botaoCancelar.addEventListener('click', limparFormulario);
