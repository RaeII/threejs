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

// Referências aos objetos para manipulá-los posteriormente
const sceneObjects = {
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

const planet = (callback) => {

    const textureLoader = new THREE.TextureLoader();

    const planet = new THREE.SphereGeometry(3.2,30,30);
    const planetMaterial = new THREE.MeshStandardMaterial({
        map: textureLoader.load(mercuryTexture)
    });

    const planetMesh = new THREE.Mesh(planet, planetMaterial);

    // Lançar sombra
    planetMesh.castShadow = true;

    sceneObjects.planet = planetMesh

    return planetMesh;
};

const sun = (callback) => {

    const textureLoader = new THREE.TextureLoader();

    const sun = new THREE.SphereGeometry(16,30,30);
    const sunMaterial = new THREE.MeshStandardMaterial({
        map: textureLoader.load(sunTexture)
    });

    const sunMesh = new THREE.Mesh(sun, sunMaterial);

    // Lançar sombra
    sunMesh.castShadow = true;

    const planetRender = planet()
    sunMesh.add(planetRender)
    planetRender.position.x = 28
   
    callback(sunMesh);
};

const light = (callback) => {
    const hemisphereLight = new THREE.PointLight('rgb(255, 255, 255)', 100, 100,);
    hemisphereLight.position.set(3, 5, 2);
    hemisphereLight.castShadow = true;

    const ambientLight = new THREE.AmbientLight('rgb(255, 255, 255)', 1.2);

    const directionalLight = new THREE.DirectionalLight('rgb(255, 255, 255)', 2);
    directionalLight.position.set(100, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.radius = 20;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
 
    const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);

    const dLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera);

    callback([directionalLight, directionalLightHelper,ambientLight, dLightHelper]);
};

const solarSystem = async () => {

    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl') });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras mais suaves

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    const scene = new THREE.Scene();

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

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    //POSIÇÃO DA CAMERA
    camera.position.set(0, 10, 50);
    orbitControls.update();


    // Adicionar a luz ao cenário
    light((lights) => {
        lights.forEach(light => {
            scene.add(light);
        });
        renderer.render(scene, camera); // Renderizar após adicionar luzes
    });

    sun((sun) => {
        scene.add(sun);
        sun.position.set(-5, 3, 0); 
        sceneObjects.sun = sun; // Guardar referência
    });

    function animate() {
    
        renderer.render(scene, camera);
        sceneObjects.sun.rotateY(0.004)
        sceneObjects.planet.rotateY(0.004)
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

    sceneObjects = null

};

solarSystem();
