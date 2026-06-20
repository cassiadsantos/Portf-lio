// ===== Tema Claro/Escuro =====
const temaBotao = document.getElementById('tema-btn');
const html = document.documentElement;

// Verificar preferência salva ou padrão do sistema
function initializarTema() {
    const temaSalvo = localStorage.getItem('tema');
    
    if (temaSalvo) {
        aplicarTema(temaSalvo);
    } else {
        // Verificar preferência do sistema
        const prefereDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        aplicarTema(prefereDark ? 'dark' : 'light');
    }
}

function aplicarTema(tema) {
    if (tema === 'dark') {
        html.classList.add('dark-mode');
        temaBotao.textContent = '☀️';
        localStorage.setItem('tema', 'dark');
    } else {
        html.classList.remove('dark-mode');
        temaBotao.textContent = '🌙';
        localStorage.setItem('tema', 'light');
    }
}

function alternarTema() {
    const temaCurrent = html.classList.contains('dark-mode') ? 'dark' : 'light';
    const novoTema = temaCurrent === 'dark' ? 'light' : 'dark';
    aplicarTema(novoTema);
}

// Event Listener para o botão de tema
temaBotao.addEventListener('click', alternarTema);

// Inicializar tema ao carregar a página
document.addEventListener('DOMContentLoaded', initializarTema);

// ===== Suavizar Scroll de Links Internos =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Animação ao Rolar a Página =====
const observador = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observador.observe(section);
});

// ===== Adicionar Animação aos Cards =====
const cards = document.querySelectorAll('.skill-card, .ia-card, .feature');
cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
});

console.log('🚀 Site de Jornada de Aprendizado carregado com sucesso!');
console.log('✨ Recursos implementados: Tema claro/escuro, animações, scroll suave');
