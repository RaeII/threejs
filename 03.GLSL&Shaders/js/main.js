import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl') });
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const orbitControls = new OrbitControls(camera, renderer.domElement);
const scene = new THREE.Scene();


// Função para redimensionar a cena
const handleResize = (renderer, camera, scene) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Atualizar tamanho do renderer
    renderer.setSize(width, height);
    
    // Atualizar proporção da câmera
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    // Renderizar novamente na próxima frame
    if (!window.animationFrameId) {
        // Se não houver loop de animação, renderizar agora
        renderer.render(scene, camera);
    }
};

const light = () => {
    
    const pointLight = new THREE.PointLight(0xFFFFFF, 2, 300, 0);

    scene.add(pointLight);
    
};

const solarSystem = async () => {

    //POSIÇÃO DA CAMERA
    camera.position.set(-90, 140, 140);
    orbitControls.update();

    // Adicionar a luz ao cenário
    light()
    
    function animate() {    
        renderer.render(scene, camera);
    }

    // Renderizar a cena inicialmente
    renderer.setAnimationLoop(animate);

    // Função para atualizar a cena quando necessário
    const updateScene = () => {
        renderer.render(scene, camera);
    };
    
    // Configurar os controles para atualizar a cena quando alterados
    orbitControls.addEventListener('change', updateScene);
    
    // Criar uma função de referência para o redimensionamento
    const resizeHandler = () => handleResize(renderer, camera, scene);
    
    // Adicionar manipulador de redimensionamento
    window.addEventListener('resize', resizeHandler);

};

solarSystem();
