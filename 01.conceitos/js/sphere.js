import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const sphereRender = () => {
    // Configuração básica da cena
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl') });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Não adicionar ao DOM, pois o main.js já faz isso
    
    // Adicionar OrbitControls
    const orbitControls = new OrbitControls(camera, renderer.domElement);

    // Criar geometria cubo
    //const geometry = new THREE.BoxGeometry();

    // TESTE: Altere os materiais aqui 👇

    // Material sem iluminação
    //const material = new THREE.MeshBasicMaterial({ color: '#0835ff' });

    // Material com iluminação difusa
    //  const material = new THREE.MeshLambertMaterial({ color: '#ee5ecf' });

    // Material com brilho especular
    //const material = new THREE.MeshPhongMaterial({ color: 'rgb(255, 8, 234)', shininess: 100 });

    // Material realista com PBR (Physically Based Rendering)
    //const material = new THREE.MeshStandardMaterial({ color: 'rgb(237, 61, 243)', metalness: 0.5, roughness: 0.3 });

    /* 
    Leather034C_1K-JPG_Color.jpg	Textura de cor (Albedo/Diffuse).
    Leather034C_1K-JPG_AmbientOcclusion.jpg	Sombras realistas em vincos e depressões (AO).
    Leather034C_1K-JPG_Roughness.jpg	Define se a superfície é lisa ou áspera.
    Leather034C_1K-JPG_Displacement.jpg	Cria relevo empurrando partes da malha.
    Leather034C_1K-JPG_NormalGL.jpg	Adiciona detalhes de relevo sem modificar a geometria.
    Leather034C_1K-JPG_NormalDX.jpg	Similar ao NormalGL, mas para DirectX (não usamos no Three.js).
    */

    //const cube = new THREE.Mesh(geometry, material);
    //scene.add(cube);

    // Carregar Texturas - modificado para evitar erros de FLIP_Y
    const textureLoader = new THREE.TextureLoader();
    
    // Desativar FLIP_Y para compatibilidade
    textureLoader.flipY = false;
    
    //Leather034A_4K-PNG
    const colorMap = textureLoader.load('../textures/Leather034C_1K-JPG/Leather034C_1K-JPG_Color.jpg'); 
    const aoMap = textureLoader.load('../textures/Leather034C_1K-JPG/Leather034C_1K-JPG_AmbientOcclusion.jpg');
    const roughnessMap = textureLoader.load('../textures/Leather034C_1K-JPG/Leather034C_1K-JPG_Roughness.jpg');
    const normalMap = textureLoader.load('../textures/Leather034C_1K-JPG/Leather034C_1K-JPG_NormalGL.jpg');
    const displacementMap = textureLoader.load('../textures/Leather034C_1K-JPG/Leather034C_1K-JPG_Displacement.jpg');

    // Configurar texturas para evitar problemas
    [colorMap, aoMap, roughnessMap, normalMap, displacementMap].forEach(texture => {
        texture.flipY = false;
        texture.needsUpdate = true;
    });

    // Configurar repetição das texturas para criar mais gomos
    colorMap.wrapS = THREE.RepeatWrapping;
    colorMap.wrapT = THREE.RepeatWrapping;
    aoMap.wrapS = THREE.RepeatWrapping;
    aoMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    displacementMap.wrapS = THREE.RepeatWrapping;
    displacementMap.wrapT = THREE.RepeatWrapping;

    // Repetir a textura para criar mais gomos
    const repeats = 2; // Aumentar este valor cria mais gomos
    colorMap.repeat.set(repeats, repeats);
    aoMap.repeat.set(repeats, repeats);
    roughnessMap.repeat.set(repeats, repeats);
    normalMap.repeat.set(repeats, repeats);
    displacementMap.repeat.set(repeats, repeats);

    // Criar material PBR
    const material = new THREE.MeshStandardMaterial({
        map: colorMap,           // Textura de cor
        aoMap: aoMap,            // Ambient Occlusion
        roughnessMap: roughnessMap, // Rugosidade
        displacementMap: displacementMap,  // Adiciona relevo real
        displacementScale: 0.01, // Aumentando a intensidade do relevo para destacar mais as costuras
        normalMap: normalMap,    // Normal Map para relevo
        normalScale: new THREE.Vector2(2, 2), // Intensificar o efeito do normal map
        metalness: 0.6,          // Reduzindo o aspecto metálico para parecer mais com couro
        roughness: 0.6,          // Aumentando a rugosidade para parecer mais com couro
        color: 'rgb(95, 60, 39)'  // Cor base do material (marrom couro)
    });

    // Criar geometria da esfera com mais segmentos para capturar melhor os detalhes
    const geometry = new THREE.SphereGeometry(1, 256, 256); // Aumentando os segmentos para 256x256

    // Adicionar coordenadas UV para o mapa de ambiente oclusão (aoMap)
    geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Melhorar a iluminação para destacar as costuras
    const light = new THREE.PointLight('rgb(255, 255, 255)', 60, 100);
    light.position.set(2, 2, 2);
    scene.add(light);

    // Adicionar uma segunda luz para iluminar de outro ângulo
    const light2 = new THREE.PointLight('rgb(255, 255, 255)', 40, 100);
    light2.position.set(-2, -1, 2);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight('rgb(255, 255, 255)', 0.9); // Reduzindo a luz ambiente para aumentar o contraste
    scene.add(ambientLight);

    // Posicionar câmera
    camera.position.z = 3;
    orbitControls.update();

    // Função para alterar a cor do objeto
    function alterarCor(cor) {
        sphere.material.color.set(cor);
    }

    // Exemplos de como alterar a cor:
    // alterarCor('rgb(255, 0, 0)');    // Vermelho
    // alterarCor('#00ff00');           // Verde
    // alterarCor(0x0000ff);            // Azul

    // Você pode chamar a função alterarCor() no console do navegador
    // para mudar a cor dinamicamente durante a execução

    // Variável para controlar se a animação deve continuar
    let isAnimating = true;

    // Função de animação modificada para verificar se deve continuar
    function animate() {
        if (!isAnimating) return;
        
        // Armazenar o ID para que possa ser cancelado posteriormente
        window.activeAnimationId = requestAnimationFrame(animate);
        
        sphere.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    // Iniciar a animação
    animate();
    
    // Adicionar evento para redimensionar a janela
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    window.lastResizeHandler = handleResize;
        
    // Função para limpar recursos adequadamente
    const dispose = () => {
        // Limpar texturas para evitar vazamentos de memória e conflitos
        [colorMap, aoMap, roughnessMap, normalMap, displacementMap].forEach(texture => {
            texture.dispose();
        });

        // Limpar geometrias e materiais
        geometry.dispose();
        material.dispose();
    };

    // Retornar o renderer, os controles e uma função para parar a animação
    return {
        renderer: renderer,
        controls: orbitControls,
        stopAnimation: () => {
            isAnimating = false;
            if (window.activeAnimationId) {
                cancelAnimationFrame(window.activeAnimationId);
                window.activeAnimationId = null;
            }
            dispose();
        }
    };
};

export { sphereRender }