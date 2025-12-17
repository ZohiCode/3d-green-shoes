import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, MeshDistortMaterial, PerspectiveCamera, Stars, useGLTF, ScrollControls, Scroll, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { useTransition, animated, config } from '@react-spring/three';
import { Product } from '../types';

// Declare intrinsic elements for React Three Fiber to fix TypeScript errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      primitive: any;
      ambientLight: any;
      spotLight: any;
      pointLight: any;
      icosahedronGeometry: any;
    }
  }
}

// --- Types & Interfaces ---
interface ErrorBoundaryProps { fallback: React.ReactNode; children?: React.ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  props!: Readonly<ErrorBoundaryProps> & Readonly<{ children?: React.ReactNode }>;
  static getDerivedStateFromError(error: any) { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("3D Error:", error, errorInfo); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

const Blob = (props: any) => {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });
  return (
    <mesh ref={mesh} {...props}>
      <icosahedronGeometry args={[1, 15]} />
      <MeshDistortMaterial color={props.color || "#39e75f"} envMapIntensity={1} clearcoat={1} distort={0.4} speed={3} />
    </mesh>
  );
};

// --- Shoe Instance (Visuals Only) ---
const ShoeModel = ({ product }: { product: Product }) => {
    const { scene } = useGLTF('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF/MaterialsVariantsShoe.gltf');
    // Important: We clone specifically to ensure materials can be swapped per instance during transitions
    const clone = useMemo(() => scene.clone(), [scene]);

    useEffect(() => {
        clone.traverse((o: any) => {
            if (o.isMesh) {
                o.material = o.material.clone();
                o.material.side = THREE.DoubleSide;
                const colorPrimary = new THREE.Color(product.colorTheme.primary);
                const colorSecondary = new THREE.Color(product.colorTheme.secondary);

                if (product.materialStyle === 'wireframe') {
                    o.material.wireframe = true;
                    o.material.color = colorPrimary;
                    o.material.emissive = colorSecondary;
                    o.material.emissiveIntensity = 0.5;
                } else if (product.materialStyle === 'glass') {
                    o.material.roughness = 0.1;
                    o.material.metalness = 0.9;
                    o.material.transmission = 0.6;
                    o.material.thickness = 1.5;
                    o.material.color = colorPrimary;
                    o.material.transparent = true;
                    o.material.opacity = 0.7;
                } else if (product.materialStyle === 'metallic') {
                    o.material.metalness = 1.0;
                    o.material.roughness = 0.2;
                    o.material.color = o.material.name.includes('laces') ? colorSecondary : colorPrimary;
                    o.material.emissive = new THREE.Color('#000000');
                } else {
                    o.material.metalness = 0.4;
                    o.material.roughness = 0.6;
                    if (o.material.name.toLowerCase().includes('laces')) {
                        o.material.color = colorSecondary;
                    } else if (o.material.name.toLowerCase().includes('mesh') || o.material.name.toLowerCase().includes('inner')) {
                        o.material.color = colorPrimary;
                    } else {
                        o.material.color.set('#ffffff');
                    }
                }
            }
        });
    }, [clone, product]);

    return <primitive object={clone} />;
}

// --- Scrollytelling Logic Component ---
// This component reads the scroll position and applies it to the group.
// It is wrapped BY the transition component, so it inherits the "Enter/Leave" animation position
// and ADDS the scroll position to it.
const ScrollyShoe = ({ product }: { product: Product }) => {
    const scroll = useScroll();
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        if (!groupRef.current) return;
        
        // --- SCROLL RANGES ---
        const r1 = scroll.range(0, 1/3);
        const r2 = scroll.range(1/3, 1/3);
        const r3 = scroll.range(2/3, 1/3);

        // --- SCROLL ANIMATION LOGIC ---
        // These calculations determine where the shoe SHOULD be based on the page scroll.
        
        // Rotation
        const targetRotY = -0.5 + (r1 * Math.PI) + (r2 * Math.PI * 0.5) + (r3 * Math.PI * 0.5);
        const targetRotX = (r2 * -0.5) + (r3 * 0.5);

        // Position (X-axis movement for layout)
        const targetPosX = 0 + (r1 * 2) - (r2 * 4) + (r3 * 2);

        // Scale Breathing
        const targetScale = 6 + (r2 * 1.5) - (r3 * 1);

        const damp = 4 * delta;
        
        // We apply these changes to the groupRef, which is INSIDE the Transition wrapper.
        // This means: Transition moves the whole container, Scroll moves the internal object.
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, damp);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, damp);
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, damp);
        // We add a subtle float here, distinct from the transition vertical movement
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, damp));
    });

    return (
        <group ref={groupRef}>
            <ShoeModel product={product} />
        </group>
    );
}

// --- HTML Content for Scroll Sections ---
const HtmlContent = ({ product }: { product: Product }) => {
    return (
        <Scroll html style={{ width: '100%' }}>
            {/* SECTION 1: HERO */}
            <section className="h-screen w-full flex flex-col justify-center items-center pointer-events-none">
                <h1 className="text-[15vw] font-display leading-none text-white mix-blend-overlay opacity-30">
                    {product.name.split(' ')[0]}
                </h1>
                <h2 className="text-4xl md:text-6xl font-display text-white mt-4" style={{ color: product.colorTheme.primary }}>
                    {product.name.split(' ')[1]}
                </h2>
                <p className="mt-4 text-white/60 tracking-widest text-sm">SCROLL TO DISCOVER</p>
                <div className="animate-bounce mt-8 text-white/30">↓</div>
            </section>

            {/* SECTION 2: LEFT TEXT */}
            <section className="h-screen w-full flex items-center px-10 md:px-20 pointer-events-none">
                <div className="w-full md:w-1/3 space-y-6">
                    <h3 className="text-5xl font-display text-white">
                        ADVANCED<br/>
                        <span style={{ color: product.colorTheme.primary }}>MATERIALS</span>
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-lg">
                        {product.description}
                        <br/><br/>
                        Designed for the urban nomad, the {product.materialStyle} chassis provides structural integrity without the weight.
                    </p>
                    <div className="flex gap-4 text-xs font-mono text-white/50">
                        <span>WEIGHT: 210G</span>
                        <span>•</span>
                        <span>DROP: 8MM</span>
                    </div>
                </div>
            </section>

            {/* SECTION 3: RIGHT TEXT */}
            <section className="h-screen w-full flex items-center justify-end px-10 md:px-20 pointer-events-none">
                <div className="w-full md:w-1/3 space-y-6 text-right">
                    <h3 className="text-5xl font-display text-white">
                        KINETIC<br/>
                        <span style={{ color: product.colorTheme.secondary }}>RESPONSE</span>
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-lg">
                        Reactive sole technology returns 85% of energy with every stride. 
                        The pattern is algorithmically generated for maximum grip on wet city streets.
                    </p>
                    <ul className="inline-block text-left text-sm text-white/70 space-y-2">
                         <li>+ Hydro-Grip Tread</li>
                         <li>+ Carbon Fiber Shank</li>
                         <li>+ Memory Foam Collar</li>
                    </ul>
                </div>
            </section>

            {/* SECTION 4: CENTER (Buy) */}
            <section className="h-screen w-full flex flex-col justify-center items-center pointer-events-none">
                <h2 className="text-6xl md:text-8xl font-display text-white mb-8 text-center">
                    OWN THE<br/>FUTURE
                </h2>
                <div className="pointer-events-auto bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 flex flex-col items-center gap-6">
                    <div className="text-3xl font-bold text-white">{product.price}</div>
                    <button 
                        className="px-12 py-4 text-black font-bold tracking-widest text-lg hover:scale-105 transition-transform"
                        style={{ backgroundColor: product.colorTheme.primary }}
                    >
                        ADD TO CART
                    </button>
                    <p className="text-xs text-white/40">Free shipping worldwide • 30 Day Returns</p>
                </div>
            </section>
        </Scroll>
    );
};


const Experience: React.FC<{ active: boolean; product: Product }> = ({ active, product }) => {
  
  // Transitions Configuration
  // We use react-spring to animate the Enter/Leave state of the product ID.
  const transitions = useTransition([product], {
      keys: (item) => item.id,
      from: { 
          // Start from above and rotated
          position: [0, 5, 0], 
          rotation: [0, Math.PI, 0], 
          scale: 0 
      },
      enter: { 
          // Land at center (0,0,0) - The ScrollyShoe inside will add its own offset to this
          position: [0, 0, 0], 
          rotation: [0, 0, 0], 
          scale: 1,
          config: config.molasses // Slow, heavy, premium feel
      },
      leave: { 
          // Fly out downwards
          position: [0, -5, 0], 
          rotation: [0, -Math.PI, 0], 
          scale: 0,
          config: config.stiff 
      }
  });

  return (
    <Canvas className="w-full h-full" shadows dpr={[1, 2]} camera={{ position: [0, 0, 7], fov: 35 }}>
      <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={35} />
      
      {/* Lights */}
      <ambientLight intensity={0.2} />
      <spotLight position={[5, 5, 5]} angle={0.25} penumbra={1} intensity={2} castShadow color="#ffffff" />
      <spotLight position={[-5, 5, -5]} angle={0.5} penumbra={1} intensity={5} color={product.colorTheme.primary} />
      <pointLight position={[0, -5, 2]} intensity={0.5} color={product.colorTheme.secondary} />
      
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      
      <ScrollControls pages={4} damping={0.2}>
          
          <ErrorBoundary fallback={<Blob scale={1} />}>
            <React.Suspense fallback={null}>
                {/* 
                   KEY CHANGE: We wrap the ScrollyShoe in the Transition group.
                   Float handles random floating.
                   animated.group handles the Transition (Enter/Exit).
                   ScrollyShoe handles the Scroll movement.
                */}
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                    {transitions((style, item) => (
                         // @ts-ignore
                        <animated.group position={style.position} rotation={style.rotation} scale={style.scale}>
                             <ScrollyShoe product={item} />
                        </animated.group>
                    ))}
                </Float>
            </React.Suspense>
          </ErrorBoundary>

          {/* Background Blobs */}
          <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
            <Blob position={[-3, 2, -5]} scale={0.4} color={product.colorTheme.secondary} />
          </Float>
          <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
             <Blob position={[3, -2, -6]} scale={0.6} color={product.colorTheme.primary} />
          </Float>

          {/* HTML Overlay */}
          <HtmlContent product={product} />

      </ScrollControls>

      <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={15} blur={2.5} far={5} color="#000000" />
      <Environment preset="city" />
    </Canvas>
  );
};

export default Experience;