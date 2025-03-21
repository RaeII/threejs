import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const cube = () => {
  // Configuração básica da cena
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl') });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Não adicionar ao DOM, pois o main.js já faz isso
  
  // Adicionar OrbitControls
  const orbitControls = new OrbitControls(camera, renderer.domElement);

  // Carregar Texturas - modificado para evitar erros de FLIP_Y
  const textureLoader = new THREE.TextureLoader();
  
  // Desativar FLIP_Y para compatibilidade
  textureLoader.flipY = false;

  // Carregando todas as texturas disponíveis
  /* const colorMap = loadTexture('../textures/Fabric077_2K-PNG/Fabric077.png'); */
  const roughnessMap = textureLoader.load('../textures/Fabric077_2K-PNG/Fabric077_2K-PNG_Roughness.png');
  const normalMapGL = textureLoader.load('../textures/Fabric077_2K-PNG/Fabric077_2K-PNG_NormalGL.png');
  const displacementMap = textureLoader.load('../textures/Fabric077_2K-PNG/Fabric077_2K-PNG_Displacement.png');
  
  // Configurar texturas para evitar problemas
  [roughnessMap, normalMapGL, displacementMap].forEach(texture => {
    texture.flipY = false;
    texture.needsUpdate = true;
  });

  // Criar materiais para cada face do cubo
  const materialOptions = {
    roughnessMap: roughnessMap,
    normalMap: normalMapGL,
    displacementMap: displacementMap,
    displacementScale:0,
    normalScale: new THREE.Vector2(1, 1),
    metalness: 0.6,
    roughness: 0.6,
    color: new THREE.Color('rgb(20, 60, 94)')
  };

  // Criar um array de materiais (um para cada face do cubo)
  const materials = [
    new THREE.MeshStandardMaterial({...materialOptions}), // direita
    new THREE.MeshStandardMaterial({...materialOptions}), // esquerda
    new THREE.MeshStandardMaterial({...materialOptions}), // topo
    new THREE.MeshStandardMaterial({...materialOptions}), // base
    new THREE.MeshStandardMaterial({...materialOptions}), // frente
    new THREE.MeshStandardMaterial({...materialOptions})  // trás
  ];

  // Criar uma geometria de cubo
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  // Modificar as coordenadas UV para cada face para evitar a distorção circular
  const uvAttribute = geometry.attributes.uv;

  // Adicionar coordenadas UV para o mapa de ambiente oclusão (aoMap)
  geometry.setAttribute('uv2', new THREE.BufferAttribute(uvAttribute.array, 2));

  // Criar o cubo com os materiais
  const cubeElement = new THREE.Mesh(geometry, materials);
  scene.add(cubeElement);

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
    // Atualizar a cor em todos os materiais
    materials.forEach(mat => {
      mat.color.set(cor);
    });
  }

  // Exemplos de como alterar a cor:
  // alterarCor('rgb(255, 0, 0)');    // Vermelho
  // alterarCor('#00ff00');           // Verde
  // alterarCor(0x0000ff);            // Azul

  // Você pode chamar a função alterarCor() no console do navegador
  // para mudar a cor dinamicamente durante a execução

  // Função de animação
  const animate = () => {
    cubeElement.rotation.y += 0.01;
    renderer.render(scene, camera);
  };

  // Configurar a função de animação para ser chamada a cada frame
  renderer.setAnimationLoop(animate);
  
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
    [roughnessMap, normalMapGL, displacementMap].forEach(texture => {
      texture.dispose();
    });

    // Limpar geometrias e materiais
    geometry.dispose();
    materials.forEach(material => material.dispose());
  };

  // Retornar o renderer e os controles
  return {
    renderer: renderer,
    controls: orbitControls,
    stopAnimation: () => {
      renderer.setAnimationLoop(null);
      dispose();
    }
  };
};

export { cube };
