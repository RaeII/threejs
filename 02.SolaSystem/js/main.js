import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

const planet = (radius, texture, position,ring) => {

    const textureLoader = new THREE.TextureLoader();

    const geo = new THREE.SphereGeometry(radius,30,30);
    const mat = new THREE.MeshPhysicalMaterial({
        map: textureLoader.load(texture)
    });

    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.x = position

    const obj = new THREE.Object3D();
    obj.add(mesh)
    scene.add(obj)


    if (ring) {

        const ringGeo = new THREE.RingGeometry(
            ring.innerRadius, 
            ring.outerRadius, 
            32
        );

        const ringMaterial = new THREE.MeshBasicMaterial({
            map: textureLoader.load(ring.texture),
            side: THREE.DoubleSide
        });

        let ringMesh = new THREE.Mesh(ringGeo, ringMaterial);
        ringMesh.rotation.x = -0.5 * Math.PI
        ringMesh.position.x = position
        obj.add(ringMesh)
    }

    return {obj, mesh}
    
};

const sun = () => {

    const textureLoader = new THREE.TextureLoader();

    const sun = new THREE.SphereGeometry(16,30,30);
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: textureLoader.load(sunTexture)
    });

    const sunMesh = new THREE.Mesh(sun, sunMaterial);

    scene.add(sunMesh);

    return sunMesh
}; 

const light = () => {
    
    const pointLight = new THREE.PointLight(0xFFFFFF, 2, 300, 0);

    scene.add(pointLight);
    
};

const loadGLTF = () => {

    const glb = new URL("../assets/glb/nave_ronin.glb", import.meta.url).href;

    const loader = new GLTFLoader();
    loader.load(glb, (gltf) => {
        const model = gltf.scene;
        // Ajustar a escala do modelo (valores menores diminuem, maiores aumentam)
        model.scale.set(10,10,10);
        
        // Aplicar propriedades de sombra a todos os objetos filhos do modelo
        model.traverse(function(node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                
                // Se o objeto tiver materiais, ajustá-los para renderizar sombras corretamente
                if (node.material) {
                    if (Array.isArray(node.material)) {
                        node.material.forEach(material => {
                            material.shadowSide = THREE.FrontSide;
                        });
                    } else {
                        node.material.shadowSide = THREE.FrontSide;
                    }
                }
            }
        });
        
        scene.add(model);
        model.position.set(10, 0, 170);
    });

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
    const sunMesh = sun();

    // Adicionar a luz ao cenário
    light()

    // ADICIONAR
    loadGLTF()

    const mercury = planet(3.2, mercuryTexture, 28);
    const venus = planet(5.8, venusTexture, 44);
    const earth = planet(6, earthTexture, 62);
    const mars = planet(4, marsTexture, 78);
    const jupiter = planet(12, jupiterTexture, 100);
    const saturn = planet(10, saturnTexture, 138, {
        innerRadius: 10,
        outerRadius: 20,
        texture: saturnRingTexture
    });
    const uranus = planet(7, uranusTexture, 176, {
        innerRadius: 7,
        outerRadius: 12,
        texture: uranusRingTexture
    });
    const neptune = planet(7, neptuneTexture, 200);
    const pluto = planet(2.8, plutoTexture, 216);

    
    function animate() {
    
        //Self-rotation
        sunMesh.rotateY(0.004);

        mercury.mesh.rotateY(0.004);
        venus.mesh.rotateY(0.002);
        earth.mesh.rotateY(0.02);
        mars.mesh.rotateY(0.018);
        jupiter.mesh.rotateY(0.04);
        saturn.mesh.rotateY(0.038);
        uranus.mesh.rotateY(0.03);
        neptune.mesh.rotateY(0.032);
        pluto.mesh.rotateY(0.008);

        //Around-sun-rotation
        mercury.obj.rotateY(0.04);
        venus.obj.rotateY(0.015);
        earth.obj.rotateY(0.01);
        mars.obj.rotateY(0.008);
        jupiter.obj.rotateY(0.002);
        saturn.obj.rotateY(0.0009);
        uranus.obj.rotateY(0.0004);
        neptune.obj.rotateY(0.0001);
        pluto.obj.rotateY(0.00007);

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
