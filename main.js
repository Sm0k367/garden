// HYPERDIMENSIONAL AUDIO MESH - EXTREME VISUAL EFFECTS
let scene, camera, renderer;
let audioContext, analyser, dataArray;
let audioElement = null;
let videoElement = null;
let isPlaying = false;
let demoMode = false;
let demoTime = 0;
let isVideoMode = false;
let composer, renderPass, bloomPass;

// Advanced objects
let meshes = [];
let particles = [];
let lights = [];
let shaderMaterials = [];

// Custom Shader Material
const vertexShader = `
    uniform float time;
    uniform float frequency;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vWave;
    
    void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        
        vec3 pos = position;
        float wave = sin(pos.x * 5.0 + time * 0.01) * cos(pos.y * 5.0 + time * 0.01);
        wave += sin(pos.z * 5.0 + time * 0.015) * frequency * 0.1;
        vWave = wave;
        
        pos += normal * wave * 0.5;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

const fragmentShader = `
    uniform float time;
    uniform float frequency;
    uniform float amplitude;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vWave;
    
    void main() {
        vec3 color = vec3(0.0);
        
        // Rainbow based on position and time
        float r = sin(vPosition.x * 2.0 + time * 0.01) * 0.5 + 0.5;
        float g = sin(vPosition.y * 2.0 + time * 0.01 + 2.0) * 0.5 + 0.5;
        float b = sin(vPosition.z * 2.0 + time * 0.01 + 4.0) * 0.5 + 0.5;
        
        color = vec3(r, g, b);
        
        // Add frequency influence
        color += vec3(frequency * 0.001, frequency * 0.0005, frequency * 0.0002);
        
        // Add glow
        float glow = abs(vWave) * amplitude;
        color += vec3(glow * 0.5, glow * 0.3, glow * 0.8);
        
        gl_FragColor = vec4(color, 1.0);
    }
`;

function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 50, 200);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('canvas'), 
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    
    // Post-processing
    composer = new THREE.EffectComposer(renderer);
    renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, 0.4, 0.85
    );
    composer.addPass(bloomPass);
    
    // Multiple lights with different colors
    const lightColors = [
        { color: 0x00ff00, pos: [15, 15, 15] },
        { color: 0x00ffff, pos: [-15, -15, 15] },
        { color: 0xff00ff, pos: [15, -15, -15] },
        { color: 0xffff00, pos: [-15, 15, -15] },
        { color: 0xff0080, pos: [0, 20, 0] },
        { color: 0x00ff80, pos: [0, -20, 0] }
    ];
    
    lightColors.forEach(l => {
        const light = new THREE.PointLight(l.color, 2, 100);
        light.position.set(...l.pos);
        scene.add(light);
        lights.push(light);
    });
    
    // Create multiple meshes
    createMeshes();
    createParticles();
    createGeometries();
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });
    
    animate();
}

function createMeshes() {
    // Main icosphere with shader
    const geometry1 = new THREE.IcosahedronGeometry(3, 7);
    const material1 = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            time: { value: 0 },
            frequency: { value: 0 },
            amplitude: { value: 0 }
        }
    });
    const mesh1 = new THREE.Mesh(geometry1, material1);
    scene.add(mesh1);
    meshes.push({ mesh: mesh1, material: material1, type: 'shader' });
    shaderMaterials.push(material1);
    
    // Wireframe sphere
    const geometry2 = new THREE.IcosahedronGeometry(4, 5);
    const material2 = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.3,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    const mesh2 = new THREE.Mesh(geometry2, material2);
    scene.add(mesh2);
    meshes.push({ mesh: mesh2, material: material2, type: 'wireframe' });
    
    // Octahedron
    const geometry3 = new THREE.OctahedronGeometry(2.5, 4);
    const material3 = new THREE.MeshPhongMaterial({
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 0.4
    });
    const mesh3 = new THREE.Mesh(geometry3, material3);
    scene.add(mesh3);
    meshes.push({ mesh: mesh3, material: material3, type: 'solid' });
    
    // Tetrahedron
    const geometry4 = new THREE.TetrahedronGeometry(3, 3);
    const material4 = new THREE.MeshPhongMaterial({
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.3,
        wireframe: true
    });
    const mesh4 = new THREE.Mesh(geometry4, material4);
    scene.add(mesh4);
    meshes.push({ mesh: mesh4, material: material4, type: 'wireframe' });
    
    // Dodecahedron
    const geometry5 = new THREE.DodecahedronGeometry(2, 2);
    const material5 = new THREE.MeshPhongMaterial({
        color: 0xff0080,
        emissive: 0xff0080,
        emissiveIntensity: 0.35
    });
    const mesh5 = new THREE.Mesh(geometry5, material5);
    scene.add(mesh5);
    meshes.push({ mesh: mesh5, material: material5, type: 'solid' });
}

function createParticles() {
    // Multiple particle systems
    const particleCounts = [5000, 3000, 2000];
    const colors = [0x00ff00, 0x00ffff, 0xff00ff];
    
    particleCounts.forEach((count, idx) => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        
        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 50;
            positions[i + 1] = (Math.random() - 0.5) * 50;
            positions[i + 2] = (Math.random() - 0.5) * 50;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ 
            color: colors[idx], 
            size: 0.1 + idx * 0.05,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        const points = new THREE.Points(geometry, material);
        scene.add(points);
        particles.push({ points, geometry, material });
    });
}

function createGeometries() {
    // Torus knot
    const geometry1 = new THREE.TorusKnotGeometry(2, 0.8, 100, 16);
    const material1 = new THREE.MeshPhongMaterial({
        color: 0x00ff80,
        emissive: 0x00ff80,
        emissiveIntensity: 0.4,
        wireframe: true
    });
    const torusKnot = new THREE.Mesh(geometry1, material1);
    scene.add(torusKnot);
    meshes.push({ mesh: torusKnot, material: material1, type: 'wireframe' });
    
    // Multiple tori
    for (let i = 0; i < 3; i++) {
        const geometry = new THREE.TorusGeometry(5 + i * 2, 0.5, 16, 100);
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(i * 0.3, 1, 0.5),
            emissive: new THREE.Color().setHSL(i * 0.3, 1, 0.5),
            emissiveIntensity: 0.3,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        const torus = new THREE.Mesh(geometry, material);
        scene.add(torus);
        meshes.push({ mesh: torus, material, type: 'wireframe' });
    }
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
    const isVideo = file.type.includes('video');
    
    // Remove old elements
    if (audioElement) {
        audioElement.pause();
        audioElement.remove();
    }
    if (videoElement) {
        videoElement.pause();
        videoElement.remove();
    }
    
    isVideoMode = isVideo;
    
    if (isVideo) {
        // Video mode
        videoElement = document.createElement('video');
        videoElement.src = url;
        videoElement.crossOrigin = 'anonymous';
        videoElement.volume = 1.0;
        videoElement.style.display = 'none';
        document.body.appendChild(videoElement);
        
        try {
            const source = audioContext.createMediaElementAudioSource(videoElement);
            source.connect(analyser);
        } catch (e) {
            console.error('Video connection error:', e);
        }
        
        videoElement.play().catch(e => console.error('Play error:', e));
        isPlaying = true;
        demoMode = false;
        
        document.getElementById('status').innerText = 'VIDEO: ' + file.name;
    } else {
        // Audio mode
        audioElement = document.createElement('audio');
        audioElement.src = url;
        audioElement.crossOrigin = 'anonymous';
        audioElement.volume = 1.0;
        document.body.appendChild(audioElement);
        
        try {
            const source = audioContext.createMediaElementAudioSource(audioElement);
            source.connect(analyser);
        } catch (e) {
            console.error('Audio connection error:', e);
        }
        
        audioElement.play().catch(e => console.error('Play error:', e));
        isPlaying = true;
        demoMode = false;
        
        document.getElementById('status').innerText = 'AUDIO: ' + file.name;
    }
});

// Demo Mode
document.getElementById('demoBtn').addEventListener('click', () => {
    demoMode = true;
    isPlaying = true;
    isVideoMode = false;
    demoTime = 0;
    document.getElementById('status').innerText = 'DEMO MODE';
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    // Analyze audio
    let frequency = 0;
    let amplitude = 0;
    
    if (isPlaying) {
        if (demoMode) {
            // Generate demo data
            for (let i = 0; i < dataArray.length; i++) {
                dataArray[i] = Math.sin(demoTime * 0.01 + i * 0.01) * 100 + 50;
            }
            demoTime++;
        } else if ((audioElement && !audioElement.paused) || (videoElement && !videoElement.paused)) {
            // Get real audio data
            analyser.getByteFrequencyData(dataArray);
        }
    }
    
    // Calculate frequency and amplitude
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    amplitude = sum / dataArray.length;
    frequency = amplitude * 2;
    
    // Update UI
    document.getElementById('freq').innerText = Math.floor(frequency);
    document.getElementById('amp').innerText = Math.floor((amplitude / 255) * 100);
    
    // Update shader uniforms
    shaderMaterials.forEach(mat => {
        mat.uniforms.time.value += 0.016;
        mat.uniforms.frequency.value = frequency;
        mat.uniforms.amplitude.value = amplitude / 255;
    });
    
    // Update meshes with extreme effects
    meshes.forEach((obj, idx) => {
        const mesh = obj.mesh;
        
        // Rotation
        mesh.rotation.x += 0.001 + (frequency * 0.00001) * (idx + 1);
        mesh.rotation.y += 0.002 + (frequency * 0.00002) * (idx + 1);
        mesh.rotation.z += 0.0005 + (frequency * 0.000005) * (idx + 1);
        
        // Scale
        const scale = 1 + (amplitude / 255) * 0.3 * (idx + 1) * 0.1;
        mesh.scale.set(scale, scale, scale);
        
        // Position oscillation
        mesh.position.x = Math.sin(demoTime * 0.001 + idx) * (amplitude / 255) * 3;
        mesh.position.y = Math.cos(demoTime * 0.001 + idx) * (amplitude / 255) * 3;
        mesh.position.z = Math.sin(demoTime * 0.0005 + idx) * (amplitude / 255) * 2;
    });
    
    // Update particles with extreme motion
    particles.forEach((p, idx) => {
        p.points.rotation.x += 0.0005 + (frequency * 0.000005);
        p.points.rotation.y += 0.0008 + (frequency * 0.000008);
        p.points.rotation.z += 0.0003 + (frequency * 0.000003);
        
        const positions = p.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += Math.sin(demoTime * 0.001 + i) * amplitude * 0.0002;
            positions[i + 1] += Math.cos(demoTime * 0.001 + i) * amplitude * 0.0002;
            positions[i + 2] += Math.sin(demoTime * 0.0005 + i) * amplitude * 0.0001;
        }
        p.geometry.attributes.position.needsUpdate = true;
        
        // Scale particles
        p.points.scale.set(
            1 + (amplitude / 255) * 0.5,
            1 + (amplitude / 255) * 0.5,
            1 + (amplitude / 255) * 0.5
        );
    });
    
    // Update lights
    lights.forEach((light, idx) => {
        light.intensity = 1 + (amplitude / 255) * 2;
        light.distance = 100 + (amplitude / 255) * 100;
    });
    
    // Camera effects
    camera.position.x = Math.sin(demoTime * 0.0005) * (amplitude / 255) * 5;
    camera.position.y = Math.cos(demoTime * 0.0005) * (amplitude / 255) * 5;
    camera.lookAt(scene.position);
    
    // Bloom intensity
    bloomPass.strength = 0.5 + (amplitude / 255) * 2;
    bloomPass.radius = 0.5 + (amplitude / 255) * 1;
    bloomPass.threshold = 0.1 - (amplitude / 255) * 0.05;
    
    // Render with post-processing
    composer.render();
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    initThree();
    initAudio();
    document.getElementById('status').innerText = 'Ready';
});