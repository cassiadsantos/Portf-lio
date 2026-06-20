const statusCodeEl = document.getElementById('statusCode');
const statusTextEl = document.getElementById('statusText');
const statusDetailEl = document.getElementById('statusDetail');
const responseOutput = document.getElementById('responseOutput');
const dataOutput = document.getElementById('dataOutput');

const loadBtn = document.getElementById('loadBtn');
const getByIdBtn = document.getElementById('getByIdBtn');
const createBtn = document.getElementById('createBtn');
const updateBtn = document.getElementById('updateBtn');
const deleteBtn = document.getElementById('deleteBtn');
const resetBtn = document.getElementById('resetBtn');

const userIdInput = document.getElementById('userId');
const userNameInput = document.getElementById('userName');
const userEmailInput = document.getElementById('userEmail');
const userRoleInput = document.getElementById('userRole');

let apiData = [];
let nextId = 1;

async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      return showStatus(500, 'Erro interno', 'Falha ao carregar data.json.');
    }
    const data = await response.json();
    apiData = data.usuarios || [];
    nextId = apiData.length ? Math.max(...apiData.map(u => u.id)) + 1 : 1;
    dataOutput.textContent = JSON.stringify({ usuarios: apiData }, null, 2);
    showStatus(200, 'OK', 'Dados carregados com sucesso.');
    showResponse({ sucesso: true, total: apiData.length });
  } catch (error) {
    showStatus(500, 'Erro interno', 'Não foi possível ler o arquivo JSON.');
    showResponse({ erro: error.message });
  }
}

function showStatus(code, title, detail) {
  statusCodeEl.textContent = code;
  statusTextEl.textContent = title;
  statusDetailEl.textContent = detail;
  if (code >= 500) {
    statusCodeEl.style.background = '#dc2626';
  } else if (code >= 400) {
    statusCodeEl.style.background = '#f59e0b';
  } else if (code >= 300) {
    statusCodeEl.style.background = '#2563eb';
  } else {
    statusCodeEl.style.background = '#16a34a';
  }
}

function showResponse(data) {
  responseOutput.textContent = JSON.stringify(data, null, 2);
}

function getAll() {
  showStatus(200, 'OK', 'Listando todos os usuários.');
  showResponse({ sucesso: true, total: apiData.length, dados: apiData });
}

function getById() {
  const id = Number(userIdInput.value);
  if (!id) {
    showStatus(400, 'Bad Request', 'ID é obrigatório para esta consulta.');
    return showResponse({ erro: 'ID inválido' });
  }
  const user = apiData.find(item => item.id === id);
  if (!user) {
    showStatus(404, 'Not Found', `Usuário com ID ${id} não encontrado.`);
    return showResponse({ sucesso: false, erro: 'Usuário não encontrado', id });
  }
  showStatus(200, 'OK', 'Usuário encontrado.');
  showResponse({ sucesso: true, dados: user });
}

function createUser() {
  const nome = userNameInput.value.trim();
  const email = userEmailInput.value.trim();
  const cargo = userRoleInput.value.trim();
  if (!nome || !email) {
    showStatus(400, 'Bad Request', 'Nome e email são obrigatórios.');
    return showResponse({ sucesso: false, erro: 'Campos obrigatórios faltando' });
  }
  const novo = {
    id: nextId++,
    nome,
    email,
    cargo: cargo || 'Não informado'
  };
  apiData.push(novo);
  dataOutput.textContent = JSON.stringify({ usuarios: apiData }, null, 2);
  showStatus(201, 'Created', 'Usuário criado com sucesso.');
  showResponse({ sucesso: true, dados: novo });
}

function updateUser() {
  const id = Number(userIdInput.value);
  if (!id) {
    showStatus(400, 'Bad Request', 'ID é obrigatório para atualizar.');
    return showResponse({ erro: 'ID inválido' });
  }
  const user = apiData.find(item => item.id === id);
  if (!user) {
    showStatus(404, 'Not Found', `Usuário com ID ${id} não encontrado.`);
    return showResponse({ sucesso: false, erro: 'Usuário não encontrado', id });
  }
  const nome = userNameInput.value.trim();
  const email = userEmailInput.value.trim();
  const cargo = userRoleInput.value.trim();
  if (!nome || !email) {
    showStatus(400, 'Bad Request', 'Nome e email são obrigatórios.');
    return showResponse({ erro: 'Campos obrigatórios faltando' });
  }
  user.nome = nome;
  user.email = email;
  user.cargo = cargo || user.cargo;
  dataOutput.textContent = JSON.stringify({ usuarios: apiData }, null, 2);
  showStatus(200, 'OK', 'Usuário atualizado com sucesso.');
  showResponse({ sucesso: true, dados: user });
}

function deleteUser() {
  const id = Number(userIdInput.value);
  if (!id) {
    showStatus(400, 'Bad Request', 'ID é obrigatório para deletar.');
    return showResponse({ erro: 'ID inválido' });
  }
  const index = apiData.findIndex(item => item.id === id);
  if (index === -1) {
    showStatus(404, 'Not Found', `Usuário com ID ${id} não encontrado.`);
    return showResponse({ sucesso: false, erro: 'Usuário não encontrado', id });
  }
  const deleted = apiData.splice(index, 1)[0];
  dataOutput.textContent = JSON.stringify({ usuarios: apiData }, null, 2);
  showStatus(200, 'OK', 'Usuário removido com sucesso.');
  showResponse({ sucesso: true, dados: deleted });
}

function resetForm() {
  userIdInput.value = '';
  userNameInput.value = '';
  userEmailInput.value = '';
  userRoleInput.value = '';
  showStatus(204, 'No Content', 'Formulário limpo.');
  showResponse({ mensagem: 'Formulário limpo' });
}

loadBtn.addEventListener('click', getAll);
getByIdBtn.addEventListener('click', getById);
createBtn.addEventListener('click', createUser);
updateBtn.addEventListener('click', updateUser);
deleteBtn.addEventListener('click', deleteUser);
resetBtn.addEventListener('click', resetForm);

window.addEventListener('load', loadData);
