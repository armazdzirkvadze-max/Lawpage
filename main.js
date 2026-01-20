// Initialize WebGL scene
let scene, camera, renderer, mesh;
const canvas = document.getElementById('canvas');
const fallback = document.querySelector('.fallback');

try {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Custom shader with grain/dither effect - Navy Blue + Light Matt Green
    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vPos;
        uniform float uTime;
        
        void main() {
            vUv = uv;
            vPos = position;
            vec3 pos = position;
            pos.z += sin(pos.x * 2.0 + uTime * 0.3) * 0.1;
            pos.z += cos(pos.y * 2.0 + uTime * 0.2) * 0.1;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `;

    const fragmentShader = `
        varying vec2 vUv;
        varying vec3 vPos;
        uniform float uTime;
        uniform vec2 uResolution;
        
        // Dither pattern
        float dither(vec2 uv) {
            float d = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
            return d;
        }
        
        // Grain noise
        float noise(vec2 uv) {
            return fract(sin(dot(uv, vec2(12.9898, 78.233) + uTime * 0.1)) * 43758.5453);
        }
        
        void main() {
            vec2 uv = vUv;
            
            // Create flowing patterns
            float pattern = sin(uv.x * 8.0 + uTime * 0.2) * cos(uv.y * 8.0 + uTime * 0.15);
            pattern += sin(length(uv - 0.5) * 10.0 - uTime * 0.3) * 0.5;
            
            // Navy Blue to Light Matt Green gradient
            vec3 navyBlue = vec3(0.059, 0.102, 0.180); // #0f1a2e
            vec3 mattGreen = vec3(0.659, 0.835, 0.729); // #a8d5ba
            vec3 deepNavy = vec3(0.102, 0.161, 0.259); // #1a2942
            
            float mixValue = pattern * 0.5 + 0.5;
            vec3 color = mix(navyBlue, mattGreen, mixValue * 0.25);
            color = mix(color, deepNavy, sin(uTime * 0.1 + length(uv - 0.5)) * 0.5 + 0.5);
            
            // Add dither grain (matt texture)
            float grain = noise(uv * uResolution * 0.5) * 0.12;
            float ditherVal = dither(uv * uResolution) * 0.06;
            color += grain + ditherVal;
            
            // Vignette
            float vignette = smoothstep(1.2, 0.3, length(uv - 0.5));
            color *= vignette;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const geometry = new THREE.PlaneGeometry(8, 8, 64, 64);
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        }
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        material.uniforms.uTime.value += 0.01;
        renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    });

} catch (error) {
    console.error('WebGL not supported:', error);
    fallback.style.display = 'block';
}

// GSAP animations
gsap.registerPlugin(ScrollTrigger);

gsap.to('.hero h1', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    delay: 0.3,
    ease: 'power3.out'
});

gsap.to('.hero p', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    delay: 0.6,
    ease: 'power3.out'
});

gsap.to('.cta-button', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    delay: 0.9,
    ease: 'power3.out'
});

// Practice cards scroll animation
gsap.utils.toArray('.practice-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: i * 0.1
    });
});
