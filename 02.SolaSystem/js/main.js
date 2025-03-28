import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import sky from '../assets/img/NightSkyHDRI008_4K-TONEMAPPED.jpg';
import starsTexture from '../assets/img/stars.jpg';
import sunTexture from '../assets/img/sun.jpg';
import mercuryTexture from '../assets/img/mercury.jpg';
import venusTexture from '../assets/img/venus.jpg';
import earthTexture from '../assets/img/earth.jpg';
import marsTexture from '../assets/img/mars.jpg';
import jupiterTexture from '../assets/img/jupiter.jpg';
import saturnTexture from '../assets/img/saturn.jpg';
import saturnRingTexture from '../assets/img/saturn ring.png';
import uranusTexture from '../assets/img/uranus.jpg';
import uranusRingTexture from '../assets/img/uranus ring.png';
import neptuneTexture from '../assets/img/neptune.jpg';
import plutoTexture from '../assets/img/pluto.jpg';

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl') });
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras mais suaves

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const orbitControls = new OrbitControls(camera, renderer.domElement);
const scene = new THREE.Scene();

// Referências aos objetos para manipulá-los posteriormente
let sceneObjects = {
    planet: null,
    sun: null
};

// Função para limpar recursos adequadamente
const dispose = (textures, mergedGeometry, material) => {
    // Limpar texturas para evitar vazamentos de memória e conflitos
    if (textures && Array.isArray(textures)) {
        textures.forEach(texture => {
            if (texture) texture.dispose();
        });
    }

    // Limpar geometrias e materiais
    if (mergedGeometry) mergedGeometry.dispose();
    if (material) {
        if (Array.isArray(material)) {
            material.forEach(mat => {
                if (mat) mat.dispose();
            });
        } else {
            material.dispose();
        }
    }
};

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

const planet = (radius, texture, ringTexture) => {

    const textureLoader = new THREE.TextureLoader();

    const planet = new THREE.SphereGeometry(radius,30,30);
    const planetMaterial = new THREE.MeshPhysicalMaterial({
        map: textureLoader.load(texture)
    });

    const planetMesh = new THREE.Mesh(planet, planetMaterial);

    if (ringTexture) {
        const ring = new THREE.RingGeometry(10, 20, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: textureLoader.load(ringTexture),
            side: THREE.DoubleSide
        });
        let ringMesh = new THREE.Mesh(ring, ringMaterial);
        
        return {planetMesh, ringMesh};
    }

    return {planetMesh}
    
};

const sun = () => {

    const textureLoader = new THREE.TextureLoader();

    const sun = new THREE.SphereGeometry(16,30,30);
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: textureLoader.load(sunTexture)
    });

    const sunMesh = new THREE.Mesh(sun, sunMaterial);
    
    sceneObjects.sun = sunMesh

    scene.add(sunMesh);
}; 

const light = () => {
    
    const pointLight = new THREE.PointLight(0xFFFFFF, 2, 300, 0);

    scene.add(pointLight);
    
};

const solarSystem = async () => {

    //POSIÇÃO DA CAMERA
    camera.position.set(-90, 140, 140);
    orbitControls.update();

    /* const skyTexture = new THREE.TextureLoader().load(sky);
    scene.background = skyTexture; */

    // Criando um ambiente 3D com a textura HDR
    const skyTexture = new THREE.TextureLoader().load(sky, () => {
        skyTexture.mapping = THREE.EquirectangularReflectionMapping;
        skyTexture.colorSpace = THREE.SRGBColorSpace;
        scene.background = skyTexture;
        scene.environment = skyTexture; // Também define como ambiente para reflexões
        renderer.render(scene, camera); // Renderizar após carregar o céu
    });

    // ADICIONAR SOL
    sun();

    // Adicionar a luz ao cenário
    light()

    const mercury = planet(3.2, mercuryTexture)
    const mercuryObj = new THREE.Object3D();
    mercuryObj.add(mercury.planetMesh)
    scene.add(mercuryObj)
    mercury.planetMesh.position.x = 28

    const saturn = planet(10, saturnTexture, saturnRingTexture)
    const saturnObj = new THREE.Object3D();
    scene.add(saturnObj)
    saturnObj.add(saturn.planetMesh)
    saturnObj.add(saturn.ringMesh)
 
    saturn.planetMesh.position.x = 138
    saturn.ringMesh.position.x = 138
    saturn.ringMesh.rotation.x = -0.5 * Math.PI
    function animate() {
    
        sceneObjects.sun.rotateY(0.004)
        mercury.planetMesh.rotateY(0.004)
        mercuryObj.rotateY(0.005)   

        saturn.planetMesh.rotateY(0.004)
        saturnObj.rotateY(0.009)   

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
