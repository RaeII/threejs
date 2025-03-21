import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Função para limpar recursos adequadamente
const dispose = (textures, mergedGeometry, material) => {
    // Remover manipulador de redimensionamento
    window.removeEventListener('resize', handleResize);
    
    // Limpar texturas para evitar vazamentos de memória e conflitos
    textures.forEach(texture => {
        texture.dispose();
    });

    // Limpar geometrias e materiais
    mergedGeometry.dispose();
    material.dispose();
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
    
    // Renderizar novamente
    renderer.render(scene, camera);
};

const texture = () => {
    return new Promise((resolve) => {
        // Criar o LoadingManager antes de carregar as texturas
        const loadingManager = new THREE.LoadingManager();
        
        // Criar o loader de texturas usando o LoadingManager
        const textureLoader = new THREE.TextureLoader(loadingManager);
        textureLoader.flipY = false;
        
        // Carregar as texturas usando o TextureLoader com o LoadingManager
        const colorMap = textureLoader.load('../textures/Fabric077_2K-PNG/Fabric077_2K-PNG_Color.png');
        const roughnessMap = textureLoader.load('../textures/Fabric077_2K-PNG/Fabric077_2K-PNG_Roughness.png');
        const normalMap = textureLoader.load('../textures/Fabric077_2K-PNG/Fabric077_2K-PNG_NormalGL.png');
        const displacementMap = textureLoader.load('../textures/Fabric077_2K-PNG/Fabric077_2K-PNG_Displacement.png');

        // Configurar texturas
        [colorMap, roughnessMap, normalMap, displacementMap].forEach(texture => {
            texture.flipY = false;
            texture.needsUpdate = true;
        });

        colorMap.colorSpace = THREE.SRGBColorSpace;

        // Definir as opções do material
        const materialOptions = {
            map: colorMap,
            normalMap: normalMap,
            roughnessMap: roughnessMap,
            displacementMap: displacementMap,
            displacementScale: 0,
            roughness: 0.4,
            metalness: 0,
            clearcoat: 1.0,
            clearcoatRoughness: 1.0,
         
        };
        
        // Definir callbacks do LoadingManager APÓS definir todas as variáveis
        loadingManager.onLoad = () => {
            const material = new THREE.MeshPhysicalMaterial(materialOptions);
            resolve({
                material: material,
                textures: [colorMap, roughnessMap, normalMap, displacementMap]
            });
        };
    
        
        loadingManager.onError = (url) => {
            console.error(`Erro ao carregar textura: ${url}`);
        };
    });
};

const light = (callback) => {
    const hemisphereLight = new THREE.PointLight('rgb(255, 255, 255)', 100, 100,);
    hemisphereLight.position.set(3, 5, 2);

    const ambientLight = new THREE.AmbientLight('rgb(255, 255, 255)', 0.3);

    callback(hemisphereLight, ambientLight);
};

const planeGeometry = (callback) => {

    const textureLoader = new THREE.TextureLoader();

    // Carregar as texturas usando o TextureLoader com o LoadingManager
    const colorMap = textureLoader.load('../textures/Wood092_1K-JPG/Wood092_1K-JPG_Color.jpg');
    const roughnessMap = textureLoader.load('../textures/Wood092_1K-JPG/Wood092_1K-JPG_Roughness.jpg');
    const normalMap = textureLoader.load('../textures/Wood092_1K-JPG/Wood092_1K-JPG_NormalGL.jpg');
    const displacementMap = textureLoader.load('../textures/Wood092_1K-JPG/Wood092_1K-JPG_Displacement.jpg');
    

    const material = new THREE.MeshStandardMaterial({
        map: colorMap,           // Textura de cor
        roughnessMap: roughnessMap, // Rugosidade
        displacementMap: displacementMap,  // Adiciona relevo real
        displacementScale: 1, // Aumentando a intensidade do relevo para destacar mais as costuras
        normalMap: normalMap,    // Normal Map para relevo
        normalScale: new THREE.Vector2(2, 2), // Intensificar o efeito do normal map
        metalness: 0.6,          // Reduzindo o aspecto metálico para parecer mais com couro
        roughness: 0.6      // Aumentando a rugosidade para parecer mais com couro
       
    });

    const planeGeo = new THREE.PlaneGeometry(30,30);
    const plane = new THREE.Mesh(planeGeo, material); 
    plane.position.set(0, -2, 0);
    plane.rotation.x = -Math.PI / 2;

    callback(plane);
};

const addSphere = (callback) => {
    const sphere = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 'rgb(107, 1, 194)',
        roughness: 0.6,
        metalness: 0.6,
        wireframe: false
    });
    
    const sphereMesh = new THREE.Mesh(sphere, material);
   
    callback(sphereMesh);
};

const basics = async () => {
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl') });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Não adicionar ao DOM, pois o main.js já faz isso

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    const scene = new THREE.Scene();

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    camera.position.set(0, 0.1, 4);
    orbitControls.update();

    // Importante: Merge Vertices corretamente aplicado
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2, 128, 128, 128);
    const mergedGeometry = mergeVertices(boxGeometry, 0.0002);

    // Aguardar carregamento das texturas
    const { material, textures } = await texture();

    const box = new THREE.Mesh(mergedGeometry, material);
    scene.add(box);

    // Adicionar a luz ao cenário
    light((light1, light2) => {
        scene.add(light1);
        scene.add(light2);
    });

    // Adicionar o plano ao cenário
    planeGeometry((plane) => {
        scene.add(plane);
    });

    addSphere((sphere) => {
        scene.add(sphere);
        sphere.position.set(-5, 3, 0);
    });

    // Renderizando a cena somente depois que as texturas estão carregadas
    renderer.render(scene, camera);

    // Criar uma variável para armazenar o listener
    const changeListener = () => {
        renderer.render(scene, camera);
    };

    // Mantendo os controles de órbita funcionais
    orbitControls.addEventListener('change', changeListener);
    
    // Adicionar manipulador de redimensionamento
    window.addEventListener('resize', () => handleResize(renderer, camera, scene));


    // Retornar tanto o renderer quanto os controles para gerenciamento adequado
    return {
        renderer: renderer,
        controls: orbitControls,
        stopAnimation: () => {
            // Remover o listener de change para evitar chamadas após troca
            orbitControls.removeEventListener('change', changeListener);
            window.removeEventListener('resize', () => handleResize(renderer, camera, scene));
            dispose(textures, mergedGeometry, material);
        }
    };
};

export { basics };
