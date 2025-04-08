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

const geometry = new THREE.PlaneGeometry(10, 10, 30, 30);

// Variáveis para rastreamento do mouse
const mouse = new THREE.Vector2(0, 0);
let raycaster = new THREE.Raycaster();

// Tratamento do movimento do mouse
window.addEventListener('mousemove', (event) => {
    // Convertendo coordenadas do mouse para coordenadas normalizadas (-1 a 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

// Cores para o efeito de hover
const corBase = new THREE.Color(0x005588);
const corHover = new THREE.Color(0xff0066);
 
const material = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    wireframe: true,
    uniforms: {
        uMouse: { value: new THREE.Vector2(0, 0) },
        uTime: { value: 0 },
        uCorBase: { value: corBase },
        uCorHover: { value: corHover },
        uRaio: { value: 0.5 }
    }
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

//POSIÇÃO DA CAMERA
camera.position.set(0, 0, 20);
orbitControls.update();
// Adicionar a luz ao cenário
light()

const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();
    
    // Atualizar o tempo no shader
    material.uniforms.uTime.value = elapsedTime;
    
    // Converter coordenadas do mouse normalizadas para coordenadas do mundo
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects([mesh]);
    if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point;
        material.uniforms.uMouse.value.x = intersectionPoint.x;
        material.uniforms.uMouse.value.y = intersectionPoint.y;
    }
    
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

