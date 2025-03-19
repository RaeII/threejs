import * as THREE from './three';

const basics = () => {
    
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl') });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const scene = new THREE.Scene();

    //eixos de coordenadas de ajuda para visualizar o espaço
    const axesHelper = new THREE.AxesHelper(5)
    scene.add(axesHelper)

    //posição da camera
    //x,y,z
    camera.position.set(0,0.1,5)

    const BoxGeometry = new THREE.BoxGeometry();
    const boxMaterial = new THREE.MeshBasicMaterial({color:"rgb(18, 128, 201)"})
    const box = new THREE.Mesh(BoxGeometry, boxMaterial)
    scene.add(box)

   //animação
    const animate = (time) => {
        renderer.render(scene,camera)
        box.rotation.x = time / 2000
        box.rotation.y = time / 1000
    }

    //executa a função animate a cada frame
    renderer.setAnimationLoop(animate)
    
    // Adicionar função para parar a animação
    const stopAnimation = () => {
        renderer.setAnimationLoop(null);
        renderer.dispose();
    };
    
    // Adicionar evento para redimensionar a janela
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Retornar o renderer para que possa ser gerenciado externamente
    return renderer;
}

export {basics}