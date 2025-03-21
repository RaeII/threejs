import { basics } from './basics';
import { cube } from './cube';
import { sphereRender } from './sphere';

// Objeto para armazenar instâncias ativas
let activeInstance = null;
let activeRenderer = null;
let activeAnimationId = null;
let activeControls = null; // Nova variável para rastrear os controles ativos
let activeStopAnimation = null; // Nova variável para a função de parar animação

// Map com as funções de renderização
const renderers = new Map()
    .set("basics", basics)
    .set("cube", cube)
    .set("sphere", sphereRender);

// Função para limpar a renderização atual
const clearCurrentRendering = () => {
    // Primeiro, parar qualquer animação específica se disponível
    if (activeStopAnimation && typeof activeStopAnimation === 'function') {
        activeStopAnimation();
        activeStopAnimation = null;
    }
    
    if (activeRenderer) {
        // Parar as animações padrão (setAnimationLoop)
        activeRenderer.setAnimationLoop(null);
        
        // Cancelar qualquer requestAnimationFrame
        if (activeAnimationId) {
            cancelAnimationFrame(activeAnimationId);
            activeAnimationId = null;
        }
        
        // Desativar e remover os OrbitControls ativos
        if (activeControls) {
            // Remover todos os event listeners
            activeControls.removeEventListener('change');
            activeControls.dispose();
            activeControls = null;
        }
        
        // Limpar completamente o contexto WebGL
        const gl = activeRenderer.getContext();
        if (gl) {
            // Limpar todos os buffers e texturas ativos
            const numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
            for (let unit = 0; unit < numTextureUnits; ++unit) {
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            }
            
            // Limpar outros estados WebGL
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            
            // Limpar programas ativos
            gl.useProgram(null);
        }
        
        // Descartar a instância do renderer
        activeRenderer.dispose();
        activeRenderer.forceContextLoss();
        activeRenderer.domElement.remove();
        activeRenderer = null;
    }
    
    // Remover listeners de resize para evitar vazamento de memória
    window.removeEventListener('resize', window.lastResizeHandler);
    window.lastResizeHandler = null;
    
    // Forçar coleta de lixo
    if (window.gc) window.gc();
};

// Função para iniciar uma nova renderização
const startRendering = async (renderType) => {
    // Limpar renderização atual
    clearCurrentRendering();
    
    // Remover e recriar o canvas para garantir um contexto WebGL limpo
    const container = document.getElementById('canvas-container') || document.body;
    const oldCanvas = document.getElementById('webgl');
    if (oldCanvas) {
        oldCanvas.remove();
    }
    
    // Criar um novo canvas
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'webgl';
    newCanvas.style.width = '100%';
    newCanvas.style.height = '100%';
    container.appendChild(newCanvas);
    
    // Obter a função de renderização correspondente
    const renderFunction = renderers.get(renderType);
    
    if (renderFunction) {
        // Salvar a escolha no localStorage
        localStorage.setItem('lastRenderType', renderType);
        
        try {
            // Executar a renderização e obter o renderer e possíveis controles
            // Verificar se a função é assíncrona e aguardar sua conclusão
            const result = await renderFunction();
            
            // Verificar se o resultado é um objeto com renderer e controls
            if (result && typeof result === 'object' && result.renderer) {
                activeRenderer = result.renderer;
                activeControls = result.controls || null;
                activeStopAnimation = result.stopAnimation || null;
            } else {
                // Caso contrário, assumir que apenas o renderer foi retornado
                activeRenderer = result;
            }
        } catch (error) {
            console.error(`Erro ao renderizar ${renderType}:`, error);
        }
    }
};

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    const elementSizeSelect = document.getElementById("elementSize");
    if (elementSizeSelect) {
        // Recuperar a última renderização do localStorage
        const lastRenderType = localStorage.getItem('lastRenderType') || 'basics';
        elementSizeSelect.value = lastRenderType;
        
        // Iniciar a renderização salva
        await startRendering(lastRenderType);
        
        // Configurar o evento de mudança com função assíncrona
        elementSizeSelect.onchange = async (e) => {
            await startRendering(elementSizeSelect.value);
        };
    }
});

// Inicialização imediata (para compatibilidade)
const init = async () => {
    const elementSizeSelect = document.getElementById("elementSize");
    if (elementSizeSelect) {
        const lastRenderType = localStorage.getItem('lastRenderType') || 'basics';
        elementSizeSelect.value = lastRenderType;
        await startRendering(lastRenderType);
    }
};

// Executar inicialização
init();
