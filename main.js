/**
 * NEURAL LIBRARIAN // ENGINE v1.0
 * KNOWLEDGE MAPPING & SYNTHESIS
 */

let scene, camera, renderer, nodes = [], edges = [];
let time = 0, lastSynthesis = 0;
const insightData = [
    { a: "MARINE BIOLOGY", b: "ARCHITECTURE", r: "HYDRO-RESILIENT URBANISM" },
    { a: "MYCOLOGY", b: "DATA ROUTING", r: "MYCELIAL NETWORK TOPOLOGY" },
    { a: "STOICISM", b: "AI ALIGNMENT", r: "VIRTUE-BASED LOGIC GATES" },
    { a: "QUANTUM PHYSICS", b: "FINANCE", r: "STOCHASTIC WEALTH SUPERPOSITION" },
    { a: "LINGUISTICS", b: "GENETICS", r: "SEMANTIC DNA SEQUENCING" }
];

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 12;

    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('lounge-canvas'), 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create Initial Knowledge Web
    for (let i = 0; i < 20; i++) {
        spawnNode(
            new THREE.Vector3((Math.random()-0.5)*20, (Math.random()-0.5)*20, (Math.random()-0.5)*10),
            0x00ffcc
        );
    }

    window.addEventListener('resize', onWindowResize);
    document.getElementById('evolve-btn').addEventListener('click', manualInput);
    animate();
}

function spawnNode(pos, color) {
    const geo = new THREE.IcosahedronGeometry(0.3, 1);
    const mat = new THREE.MeshPhongMaterial({ 
        color: color, 
        emissive: color, 
        emissiveIntensity: 0.5,
        wireframe: true 
    });
    const node = new THREE.Mesh(geo, mat);
    node.position.copy(pos);
    
    // Random velocity for floating effect
    node.userData = { 
        velocity: new THREE.Vector3((Math.random()-0.5)*0.01, (Math.random()-0.5)*0.01, (Math.random()-0.5)*0.01) 
    };
    
    nodes.push(node);
    scene.add(node);
}

function performSynthesis() {
    const data = insightData[Math.floor(Math.random() * insightData.length)];
    
    // Update UI
    document.getElementById('node-a').innerText = data.a;
    document.getElementById('node-b').innerText = data.b;
    document.getElementById('node-result').innerText = data.r;
    document.getElementById('current-insight').innerText = `SYNTHESIZING: ${data.r}`;
    
    // Visual Pulse
    const n1 = nodes[Math.floor(Math.random() * nodes.length)];
    const n2 = nodes[Math.floor(Math.random() * nodes.length)];
    createEdge(n1.position, n2.position);
}

function createEdge(p1, p2) {
    const material = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 1 });
    const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    
    // Fade out the connection over time
    gsap.to(material, { opacity: 0, duration: 4, onComplete: () => scene.remove(line) });
}

function manualInput() {
    const input = document.getElementById('query-input').value;
    if (!input) return;
    
    document.getElementById('system-state').innerText = `ANALYZING: ${input}...`;
    document.getElementById('current-insight').innerText = `COLLIDING "${input}" WITH GLOBAL DATA...`;
    
    // Spawn new node for the input
    spawnNode(new THREE.Vector3(0,0,5), 0xff3366);
    setTimeout(performSynthesis, 1500);
}

function animate() {
    requestAnimationFrame(animate);
    time += 0.005;

    // Movement Logic
    nodes.forEach(node => {
        node.position.add(node.userData.velocity);
        node.rotation.x += 0.01;
        node.rotation.y += 0.01;
        
        // Boundary Check
        if (Math.abs(node.position.x) > 15) node.userData.velocity.x *= -1;
        if (Math.abs(node.position.y) > 10) node.userData.velocity.y *= -1;
    });

    // Auto-Synthesis every 8 seconds
    if (Date.now() - lastSynthesis > 8000) {
        performSynthesis();
        lastSynthesis = Date.now();
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// System Clock
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

init();
