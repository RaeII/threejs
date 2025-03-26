import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import sky from '../textures/NightSkyHDRI008_4K-TONEMAPPED.jpg';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Função para limpar recursos adequadamente
const dispose = (material=false,textures=false) => {
    // Remover manipulador de redimensionamento
    window.removeEventListener('resize', handleResize);
    
    // Limpar texturas para evitar vazamentos de memória e conflitos
    if(textures){
        textures.forEach(texture => {
            texture.dispose();
        });
    }

    if(material){
        material.dispose();
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

    callback([directionalLight, directionalLightHelper,ambientLight, /* dLightHelper */]);
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

    // Receber sombra
    plane.receiveShadow = true;

    callback(plane);
};

const loadGLTF = (callback) => {

    const building = new URL("../assets/batatinha.glb", import.meta.url).href;

    const loader = new GLTFLoader();
    loader.load(building, (gltf) => {
        const model = gltf.scene;
        // Ajustar a escala do modelo (valores menores diminuem, maiores aumentam)
        model.scale.set(50,50,50);
        
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
        
        callback(model);
    });
};

const building = async () => {

    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl') });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    renderer.shadowMap.enabled = true;

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
        renderer.render(scene, camera); // Re-renderiza após carregar
    });

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    camera.position.set(0, 0.1, 4);
    orbitControls.update();


    // Adicionar a luz ao cenário
    light((lights) => {
        lights.forEach(light => {
            scene.add(light);
        });
    });

    // Adicionar o plano ao cenário
    planeGeometry((plane) => {
        scene.add(plane);
    });

    loadGLTF((model) => {
        scene.add(model);
        model.position.set(10, -3, 10);
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
            dispose();
        }
    };
};

export { building };
