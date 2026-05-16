const otaoMensagem = document.getElementById("botaoMensagem");
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
    //mensagem.textContent = "Bem-vindo ao meu portfólio! Este projeto foi criado com HTML, CSS e JavaScript"
    alert("Bem-vindo ao meu portfólio! Este projeto foi criado com HTML, CSS e JavaScript")
}

function mostrarTecnologia(tecnologia){
    const texto = document.getElementById("tecnologiaSelecionada");

    texto.textContent = "Você selecionou" + tecnologia;
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

function renderizarAprendizado(lista){
    const listaAprendizados = document.getElementById("listaAprendizados")
    const listaAprendizados = document.getElementById("contadorAprendizados")

 if (!listaAprendizados || !contadorAprendizados) {
        return;
    }

    listaAprendizados.innerHTML = "";

    for(let cont = 0; cont < lista.length; cont++){

        listaAprendizados.innerHTML += `
            <article class="aprendizado">
                <span>${lista[cont].tema}</span>
                <h3>${lista[cont].pergunta}</h3>
                <p><strong>O que entendi:</strong> ${lista[cont].entendimento}</p>
            </article>
        `;
    }

    contadorAprendizados.textContent = "Total de aprendizados: " + lista.length;
}

renderizarAprendizado.textContent{aprendizados}
