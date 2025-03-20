import * as THREE from 'three';

const texture = () => {
    // Carregar Texturas
    const textureLoader = new THREE.TextureLoader();

    const colorMap = textureLoader.load('../textures/Fabric077_2K-PNG/Fabric077_2K-PNG_Color.png');
    const roughnessMap = textureLoader.load('../textures/Fabric077_2K-PNG/Fabric077_2K-PNG_Roughness.png');
    const normalMap = textureLoader.load('../textures/Fabric077_2K-PNG/Fabric077_2K-PNG_NormalGL.png');
    const displacementMap = textureLoader.load('../textures/Fabric077_2K-PNG/Fabric077_2K-PNG_Displacement.png');

    colorMap.colorSpace = THREE.SRGBColorSpace;

    // Criar materiais com textura para o cubo
    const materialOptions = {
        map: colorMap,
        normalMap: normalMap,
        roughnessMap: roughnessMap,
        displacementMap: displacementMap,
        displacementScale: 0.05,
        roughness: 1,
        metalness: 0,
        clearcoat: 1.0,
        clearcoatRoughness: 1.0,
    };

    const materials = Array(6).fill(new THREE.MeshPhysicalMaterial(materialOptions));

    return materials;
};

const light = (callback) => {
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);

    callback(hemisphereLight, ambientLight);
};

const basics = () => {
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl') });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const scene = new THREE.Scene();

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    camera.position.set(0, 0.1, 4);

    const materials = texture();

    const boxGeometry = new THREE.BoxGeometry(2, 2, 2, 128, 128, 128);
    const box = new THREE.Mesh(boxGeometry, materials);
    scene.add(box);

    light((light1, light2) => {
        scene.add(light1);
        scene.add(light2);
    });

    const animate = (time) => {
        box.rotation.x = time / 2000;
        box.rotation.y = time / 1000;

        renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    return renderer;
};

export { basics };
