# Simulador de API CRUD

Projeto estático que simula um consumo de API usando **Fetch API** em um arquivo JSON local.

## Funcionalidades

- `GET /` - Carrega todos os usuários
- `GET /:id` - Busca usuário por ID
- `POST /` - Cria um novo usuário
- `PUT /:id` - Atualiza usuário existente
- `DELETE /:id` - Remove usuário existente
- Exibe **status codes** simulados e resposta em JSON

## Como usar

1. Abra `Simulador-API/index.html` no navegador.
2. Use os botões para executar operações.
3. Veja o JSON atualizado na seção de dados locais.

## Estrutura

- `index.html` - interface do simulador
- `style.css` - estilos da página
- `app.js` - lógica CRUD e simulação de status
- `data.json` - dados de exemplo
