const botaoMensagem = document.getElementById("botaoMensagem");
const mensagem = document.getElementById("mensagem");

const aprendizados = [
    {
        tema: 'HTML',
        pergunta: 'Qual é a diferença entre id e class?',
        resposta: 'O id identifica um único elemento. A class pode ser usada em vários elementos.',
        entendimento: 'Entendi que id é único e class é reutilizável para estilos e estrutura.'
    },
    {
        tema: 'CSS',
        pergunta: 'O que é flexbox?',
        resposta: 'É um modelo de layout para organizar elementos em linha ou coluna.',
        entendimento: 'Entendi que flexbox ajuda a alinhar elementos de forma mais fácil e responsiva.'
    },
    {
        tema: 'JavaScript',
        pergunta: 'O que é uma função?',
        resposta: 'É um bloco de código que executa uma tarefa quando chamado.',
        entendimento: 'Entendi que funções evitam repetição de código e deixam o sistema organizado.'
    }
];

function alterarTexto() {

    // mensagem.textContent = "Bem-vindo ao meu portfólio! Este projeto foi criado com HTML, CSS e JavaScript";

    alert("Bem-vindo ao meu portfólio! Este projeto foi criado com HTML, CSS e JavaScript");
}

function mostrarTecnologia(tecnologia){

    const texto = document.getElementById("tecnologiaSelecionada");

    texto.textContent = "Você selecionou " + tecnologia;
}

const botaoTema = document.getElementById("toggleTema");

function alternarTema(){

    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){

        botaoTema.textContent = "☀️ Modo Claro";

    } else {

        botaoTema.textContent = "🌙 Modo Escuro";
    }
}

function renderizarAprendizados(lista){

    const listaAprendizados = document.getElementById("listaAprendizados");

    const contadorAprendizados = document.getElementById("contadorAprendizados");

    if (!listaAprendizados || !contadorAprendizados) {
        return;
    }

    listaAprendizados.innerHTML = "";

    for(let cont = 0; cont < lista.length; cont++){

        listaAprendizados.innerHTML += `
        
        <article class="aprendizado">

            <span>${lista[cont].tema}</span>

            <h3>${lista[cont].pergunta}</h3>

            <p>
                <strong>Resposta:</strong> ${lista[cont].resposta}
            </p>

            <p>
                <strong>O que entendi:</strong> ${lista[cont].entendimento}
            </p>

        </article>
        
        `;
    }

    contadorAprendizados.textContent =
        "Total de Aprendizados: " + lista.length;
}

renderizarAprendizados(aprendizados);
// marcar botão 'Todos' como ativo por padrão após carregamento do DOM
document.addEventListener('DOMContentLoaded', function(){
    const existeFiltros = document.querySelector('.filtros');
    if (existeFiltros) marcarBotaoAtivo('Todos');
});

function filtrarAprendizado(tema){

    if (tema == "Todos"){

        renderizarAprendizados(aprendizados);
        marcarBotaoAtivo(tema);
        return;
    }

    const filtrados = aprendizados.filter(function(item){

        return item.tema == tema;
    });

    renderizarAprendizados(filtrados);
    marcarBotaoAtivo(tema);
}

function marcarBotaoAtivo(tema){
    const botoes = document.querySelectorAll('.filtros button');
    if(!botoes || !botoes.length) return;
    botoes.forEach(function(btn){
        const valor = btn.getAttribute('data-tema') || btn.textContent.trim();
        if(valor === tema){
            btn.classList.add('ativo');
        } else {
            btn.classList.remove('ativo');
        }
    });
}

function mostrarOcultarAprendizados(){
    const listaAprendizados = document.getElementById("listaAprendizados");
    const botaoAprendizados = document.getElementById("botaoAprendizados");
    const filtros = document.querySelector('.filtros');

    listaAprendizados.classList.toggle("oculto");
    if (filtros) {
        filtros.classList.toggle("oculto");
    }

    if(listaAprendizados.classList.contains("oculto")){
        botaoAprendizados.textContent = "👁️ Mostrar Aprendizados";
    } else {
        botaoAprendizados.textContent = "🙈 Ocultar Aprendizados";
    }
}

function adicionarAprendizados(evento){
    evento.preventDefault()

    const campoTema = document.getElementById("tema")
    const campoPergunta = document.getElementById("pergunta")
    const campoResposta = document.getElementById("resposta")
    const campoEntendimento = document.getElementById("entendimento")

    if(
        campoTema.value == "" ||
        campoPergunta.value == "" ||
        campoResposta.value == "" ||
        campoEntendimento.value == "" 
    )
    {
        alert("Preencha todos os campos antes de adicionar.")
        return false;
    }
    const novoApendizado = {
        tema: campoTema.value, 
        pergunta: campoPergunta.value,
        resposta: campoResposta.value,
        entendimento: campoEntendimento.value,
    }

    aprendizados.push(novoApendizado)
    renderizarAprendizados(aprendizados)
    campoTema.value = ""
    campoPergunta.value = ""
    campoResposta.value = ""
    campoEntendimento.value = ""

    
    return
}