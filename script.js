// Slideshow automático
let slideIndex = 0;
showSlides();

function showSlides() {
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    slideIndex++;
    
    if (slideIndex > slides.length) {slideIndex = 1}
    
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " active";
    
    setTimeout(showSlides, 5000); // Muda a cada 5 segundos
}

// Controles manuais
function plusSlides(n) {
    slideIndex += n;
    let slides = document.getElementsByClassName("mySlides");
    if (slideIndex > slides.length) {slideIndex = 1}
    if (slideIndex < 1) {slideIndex = slides.length}
    showSlides();
}

function currentSlide(n) {
    slideIndex = n;
    showSlides();
}

// Scroll suave para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Configurações da Planilha Google
const SHEET_ID = 'SUA_ID_DA_PLANILHA'; // Substitua pelo ID da sua planilha
const SHEET_NAME = 'Noticias'; // Nome da aba da planilha
const API_KEY = 'SUA_CHAVE_API_GOOGLE'; // Chave da API Google (restringida por domínio)

// URL da API do Google Sheets
const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

// Carrega as notícias
async function carregarNoticias() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.values) {
            throw new Error('Formato de dados inválido');
        }
        
        const noticias = processarDadosPlanilha(data.values);
        exibirNoticias(noticias);
        configurarBotaoVerMais(noticias);
        
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
        document.getElementById('lista-noticias').innerHTML = 
            '<div class="erro-carregamento">Não foi possível carregar as notícias no momento. Tente novamente mais tarde.</div>';
    }
}

// Processa os dados da planilha para o formato desejado
function processarDadosPlanilha(dados) {
    if (!dados || dados.length < 2) return [];
    
    const cabecalhos = dados[0];
    const linhas = dados.slice(1);
    
    return linhas.map(linha => {
        const noticia = {};
        cabecalhos.forEach((cabecalho, index) => {
            noticia[cabecalho.toLowerCase()] = linha[index] || '';
        });
        return noticia;
    }).filter(noticia => noticia.titulo); // Filtra linhas vazias
}

// Exibe as primeiras 3 notícias
function exibirNoticias(noticias, limite = 3) {
    const container = document.getElementById('lista-noticias');
    
    if (!noticias.length) {
        container.innerHTML = '<div class="sem-noticias">Nenhuma notícia disponível no momento.</div>';
        return;
    }
    
    const noticiasExibir = noticias.slice(0, limite);
    let html = '';
    
    noticiasExibir.forEach(noticia => {
        html += `
            <div class="noticia-item">
                <div class="noticia-data">${formatarData(noticia.data)}</div>
                <h3 class="noticia-titulo">${noticia.titulo}</h3>
                <p class="noticia-resumo">${noticia.resumo}</p>
                ${noticia.imagem ? `<img src="${noticia.imagem}" alt="${noticia.titulo}" class="noticia-imagem">` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Configura o botão "Ver mais"
function configurarBotaoVerMais(noticias) {
    const btnVerMais = document.getElementById('ver-mais');
    
    if (noticias.length > 3) {
        btnVerMais.style.display = 'block';
        let mostrandoTodas = false;
        
        btnVerMais.addEventListener('click', () => {
            mostrandoTodas = !mostrandoTodas;
            
            if (mostrandoTodas) {
                exibirNoticias(noticias, noticias.length);
                btnVerMais.textContent = 'Mostrar menos';
            } else {
                exibirNoticias(noticias, 3);
                btnVerMais.textContent = 'Ver mais notícias';
            }
        });
    }
}

// Formata a data para exibição
function formatarData(dataString) {
    if (!dataString) return '';
    
    try {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dataString).toLocaleDateString('pt-BR', options);
    } catch {
        return dataString; // Retorna o valor original se não for uma data válida
    }
}

// Inicia o carregamento das notícias quando a página carregar
document.addEventListener('DOMContentLoaded', carregarNoticias);