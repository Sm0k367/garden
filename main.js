// HYPERDIMENSIONAL AUDIO MESH - SIMPLE VERSION
let scene, camera, renderer;
let audioContext, analyser, dataArray;
let audioElement = null;
let isPlaying = false;
let demoMode = false;
let demoTime = 0;

// Three.js Setup
function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;
    
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Lights
    const light1 = new THREE.PointLight(0x00ff00, 2, 100);
    light1.position.set(10, 10, 10);
    scene.add(light1);
    
    const light2 = new THREE.PointLight(0x00ffff, 1.5, 100);
    light2.position.set(-10, -10, 10);
    scene.add(light2);
    
    // Main mesh
    const geometry = new THREE.IcosahedronGeometry(3, 6);
    const material = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.5,
        wireframe: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 30;
        positions[i + 1] = (Math.random() - 0.5) * 30;
        positions[i + 2] = (Math.random() - 0.5) * 30;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.1});
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Torus
    const torusGeometry = new THREE.TorusGeometry(5, 1, 16, 100);
    const torusMaterial = new THREE.MeshPhongMaterial({
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 0.3,
        wireframe: true
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    scene.add(torus);
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    animate(mesh, particles, torus);
}

// Audio Setup
function initAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.connect(audioContext.destination);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

// File Input
document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    
    // Remove old audio element
    if (audioElement) {
        audioElement.pause();
        audioElement.remove();
    }
    
    // Create new audio element
    audioElement = document.createElement('audio');
    audioElement.src = url;
    audioElement.crossOrigin = 'anonymous';
    audioElement.volume = 1.0;
    document.body.appendChild(audioElement);
    
    // Connect to analyser
    try {
        const source = audioContext.createMediaElementAudioSource(audioElement);
        source.connect(analyser);
    } catch (e) {
        console.error('Audio connection error:', e);
    }
    
    // Play
    audioElement.play().catch(e => console.error('Play error:', e));
    isPlaying = true;
    demoMode = false;
    
    document.getElementById('status').innerText = file.name;
});

// Demo Mode
document.getElementById('demoBtn').addEventListener('click', () => {
    demoMode = true;
    isPlaying = true;
    demoTime = 0;
    document.getElementById('status').innerText = 'DEMO MODE';
});

// Animation Loop
function animate(mesh, particles, torus) {
    requestAnimationFrame(() => animate(mesh, particles, torus));
    
    // Analyze audio
    if (isPlaying) {
        if (demoMode) {
            // Generate demo data
            for (let i = 0; i < dataArray.length; i++) {
                dataArray[i] = Math.sin(demoTime * 0.01 + i * 0.01) * 100 + 50;
            }
            demoTime++;
        } else if (audioElement && !audioElement.paused) {
            // Get real audio data
            analyser.getByteFrequencyData(dataArray);
        }
    }
    
    // Calculate frequency and amplitude
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    const frequency = average * 2;
    const amplitude = (average / 255) * 100;
    
    // Update UI
    document.getElementById('freq').innerText = Math.floor(frequency);
    document.getElementById('amp').innerText = Math.floor(amplitude);
    
    // Update mesh
    mesh.rotation.x += 0.001 + average * 0.00001;
    mesh.rotation.y += 0.002 + average * 0.00001;
    mesh.scale.set(1 + average * 0.001, 1 + average * 0.001, 1 + average * 0.001);
    
    // Update particles
    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.0008;
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(demoTime * 0.001 + i) * average * 0.0001;
        positions[i + 1] += Math.cos(demoTime * 0.001 + i) * average * 0.0001;
        positions[i + 2] += Math.sin(demoTime * 0.0005 + i) * average * 0.00005;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    
    // Update torus
    torus.rotation.x += 0.001;
    torus.rotation.y += 0.002;
    torus.scale.set(1 + average * 0.002, 1 + average * 0.002, 1 + average * 0.002);
    
    // Render
    renderer.render(scene, camera);
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    initThree();
    initAudio();
    document.getElementById('status').innerText = 'Ready';
});