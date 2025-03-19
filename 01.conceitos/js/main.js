import { basics } from './basics';
import { cube } from './cube';
import { sphereRender } from './sphere';

// Objeto para armazenar instâncias ativas
let activeInstance = null;
let activeRenderer = null;
let activeAnimationId = null;

// Map com as funções de renderização
const renderers = new Map()
    .set("basics", basics)
    .set("cube", cube)
    .set("sphere", sphereRender);

// Função para limpar a renderização atual
const clearCurrentRendering = () => {
    if (activeRenderer) {
        // Parar as animações atuais
        activeRenderer.setAnimationLoop(null);
        
        // Cancelar qualquer requestAnimationFrame
        if (activeAnimationId) {
            cancelAnimationFrame(activeAnimationId);
            activeAnimationId = null;
        }
        
        // Descartar a instância do renderer
        activeRenderer.dispose();
        activeRenderer = null;
    }
    
    // Remover listeners de resize para evitar vazamento de memória
    window.removeEventListener('resize', window.lastResizeHandler);
    window.lastResizeHandler = null;
};

// Função para iniciar uma nova renderização
const startRendering = (renderType) => {
    // Limpar renderização atual
    clearCurrentRendering();
    
    // Obter a função de renderização correspondente
    const renderFunction = renderers.get(renderType);
    
    if (renderFunction) {
        // Salvar a escolha no localStorage
        localStorage.setItem('lastRenderType', renderType);
        
        // Executar a renderização e obter o renderer
        activeRenderer = renderFunction();
    }
};

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const elementSizeSelect = document.getElementById("elementSize");
    if (elementSizeSelect) {
        // Recuperar a última renderização do localStorage
        const lastRenderType = localStorage.getItem('lastRenderType') || 'basics';
        elementSizeSelect.value = lastRenderType;
        
        // Iniciar a renderização salva
        startRendering(lastRenderType);
        
        // Configurar o evento de mudança
        elementSizeSelect.onchange = (e) => {
            startRendering(elementSizeSelect.value);
        };
    }
});

// Inicialização imediata (para compatibilidade)
const init = () => {
    const elementSizeSelect = document.getElementById("elementSize");
    if (elementSizeSelect) {
        const lastRenderType = localStorage.getItem('lastRenderType') || 'basics';
        elementSizeSelect.value = lastRenderType;
        startRendering(lastRenderType);
    }
};

// Executar inicialização
init();
