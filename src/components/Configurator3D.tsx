import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Html, OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Fabric, Wood } from '@/data/store';

export type Part = 'fabric' | 'wood' | null;

/* ---------- texturas procedurais (sem arquivos externos) ---------- */

function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void, repeat: [number, number]) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  draw(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

function fabricBump(kind: Fabric['kind']) {
  return canvasTexture(512, (ctx, s) => {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, s, s);
    if (kind === 'boucle') {
      for (let i = 0; i < 9000; i++) {
        const x = Math.random() * s, y = Math.random() * s, r = 2 + Math.random() * 5;
        ctx.strokeStyle = `rgba(${Math.random() > 0.5 ? 255 : 20},${Math.random() > 0.5 ? 255 : 20},${Math.random() > 0.5 ? 255 : 20},0.35)`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(x, y, r, Math.random() * 6, Math.random() * 6 + 2.5);
        ctx.stroke();
      }
    } else if (kind === 'linho') {
      for (let i = 0; i < s; i += 2) {
        ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},0,0,${0.05 + Math.random() * 0.12})`;
        ctx.fillRect(i, 0, 1, s);
        ctx.fillRect(0, i, s, 1);
      }
    } else if (kind === 'veludo') {
      for (let i = 0; i < 40000; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`;
        ctx.fillRect(Math.random() * s, Math.random() * s, 1, 1);
      }
    } else {
      for (let i = 0; i < 26000; i++) {
        const v = Math.random() > 0.5 ? 255 : 0;
        ctx.fillStyle = `rgba(${v},${v},${v},${Math.random() * 0.12})`;
        ctx.beginPath();
        ctx.arc(Math.random() * s, Math.random() * s, 1 + Math.random() * 2, 0, 7);
        ctx.fill();
      }
    }
  }, kind === 'boucle' ? [3, 3] : kind === 'linho' ? [5, 5] : [4, 4]);
}

function woodMap(hex: string) {
  return canvasTexture(512, (ctx, s) => {
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * s;
      const w = 0.6 + Math.random() * 2.4;
      ctx.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.11})`;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + (Math.random() - 0.5) * 22, s * 0.3, x + (Math.random() - 0.5) * 22, s * 0.7, x + (Math.random() - 0.5) * 8, s);
      ctx.lineTo(x + w, s);
      ctx.lineTo(x + w, 0);
      ctx.fill();
    }
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
      ctx.fillRect(Math.random() * s, 0, 1, s);
    }
  }, [1, 1]);
}

/* ---------- a poltrona ---------- */

interface ChairProps {
  fabric: Fabric;
  wood: Wood;
  active: Part;
  onSelect: (p: Part) => void;
}

function Chair({ fabric, wood, active, onSelect }: ChairProps) {
  const bump = useMemo(() => fabricBump(fabric.kind), [fabric.kind]);
  const grain = useMemo(() => woodMap(wood.hex), [wood.hex]);
  const [hover, setHover] = useState<Part>(null);

  useEffect(() => () => bump.dispose(), [bump]);
  useEffect(() => () => grain.dispose(), [grain]);

  const glow = (p: Part) => (active === p || hover === p ? 0.14 : 0);
  const over = (p: Part) => (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHover(p);
    document.body.style.cursor = 'pointer';
  };
  const out = () => {
    setHover(null);
    document.body.style.cursor = '';
  };
  const click = (p: Part) => (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onSelect(p);
  };

  const fabricMat = (
    <meshPhysicalMaterial
      color={fabric.hex}
      roughness={fabric.kind === 'couro' ? 0.5 : fabric.kind === 'veludo' ? 0.85 : 0.95}
      sheen={fabric.kind === 'veludo' ? 1 : fabric.kind === 'couro' ? 0 : 0.6}
      sheenRoughness={0.45}
      sheenColor={new THREE.Color(fabric.hex).offsetHSL(0, 0, 0.18)}
      clearcoat={fabric.kind === 'couro' ? 0.35 : 0}
      clearcoatRoughness={0.4}
      bumpMap={bump}
      bumpScale={fabric.kind === 'boucle' ? 2.2 : fabric.kind === 'couro' ? 0.8 : 1}
      emissive="#C7A26A"
      emissiveIntensity={glow('fabric')}
    />
  );

  const woodMat = (
    <meshPhysicalMaterial
      color="#ffffff"
      map={grain}
      roughness={0.52}
      clearcoat={0.22}
      clearcoatRoughness={0.35}
      emissive="#C7A26A"
      emissiveIntensity={glow('wood')}
    />
  );

  const fabricHandlers = { onPointerOver: over('fabric'), onPointerOut: out, onClick: click('fabric') };
  const woodHandlers = { onPointerOver: over('wood'), onPointerOut: out, onClick: click('wood') };

  const legs: [number, number, number][] = [
    [-0.46, 0.2, -0.36],
    [0.46, 0.2, -0.36],
    [-0.46, 0.2, 0.36],
    [0.46, 0.2, 0.36],
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* estrutura inferior em madeira */}
      <RoundedBox args={[1.18, 0.1, 0.98]} radius={0.03} smoothness={4} position={[0, 0.42, 0]} castShadow {...woodHandlers}>
        {woodMat}
      </RoundedBox>

      {/* pés torneados */}
      {legs.map((p, i) => (
        <group key={i} position={p} rotation={[p[2] > 0 ? 0.08 : -0.08, 0, p[0] > 0 ? -0.07 : 0.07]}>
          <mesh castShadow {...woodHandlers}>
            <cylinderGeometry args={[0.04, 0.026, 0.4, 32]} />
            {woodMat}
          </mesh>
          <mesh position={[0, -0.19, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.025, 32]} />
            <meshStandardMaterial color="#B08D57" metalness={1} roughness={0.22} />
          </mesh>
        </group>
      ))}

      {/* assento */}
      <RoundedBox args={[0.92, 0.22, 0.86]} radius={0.09} smoothness={6} position={[0, 0.58, 0.04]} castShadow receiveShadow {...fabricHandlers}>
        {fabricMat}
      </RoundedBox>

      {/* braços */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.2, 0.5, 0.98]} radius={0.09} smoothness={6} position={[s * 0.63, 0.72, 0]} castShadow receiveShadow {...fabricHandlers}>
          {fabricMat}
        </RoundedBox>
      ))}

      {/* encosto */}
      <RoundedBox args={[1.06, 0.78, 0.24]} radius={0.11} smoothness={6} position={[0, 1.02, -0.4]} rotation={[-0.16, 0, 0]} castShadow receiveShadow {...fabricHandlers}>
        {fabricMat}
      </RoundedBox>

      {/* almofada */}
      <RoundedBox args={[0.5, 0.42, 0.14]} radius={0.06} smoothness={5} position={[0.18, 0.96, -0.2]} rotation={[-0.2, -0.25, 0.05]} castShadow {...fabricHandlers}>
        {fabricMat}
      </RoundedBox>

      {/* pontos de interação */}
      <Html position={[0, 1.18, -0.3]} center zIndexRange={[10, 0]}>
        <button className={`hotspot ${active === 'fabric' ? 'on' : ''}`} onClick={() => onSelect('fabric')} aria-label="Personalizar tecido">
          <i />
          <span>Tecido</span>
        </button>
      </Html>
      <Html position={[-0.52, 0.16, 0.42]} center zIndexRange={[10, 0]}>
        <button className={`hotspot ${active === 'wood' ? 'on' : ''}`} onClick={() => onSelect('wood')} aria-label="Personalizar madeira">
          <i />
          <span>Madeira</span>
        </button>
      </Html>
    </group>
  );
}

/* ---------- câmera ---------- */

const presets: Record<'idle' | 'fabric' | 'wood', { pos: [number, number, number]; look: [number, number, number] }> = {
  idle: { pos: [2.6, 1.35, 3.5], look: [0, 0.78, 0] },
  fabric: { pos: [1.6, 1.7, 2.4], look: [0, 0.9, 0] },
  wood: { pos: [1.9, 0.55, 2.4], look: [0, 0.3, 0] },
};

function Rig({ part, controls }: { part: Part; controls: React.MutableRefObject<any> }) {
  const { size } = useThree();
  const until = useRef(0);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    until.current = performance.now() + 1500;
  }, [part]);

  useFrame((state, dt) => {
    if (performance.now() > until.current || !controls.current) return;
    const p = presets[part ?? 'idle'];
    const narrow = size.width < 640;
    const k = narrow ? 1.3 : 1;
    a.set(p.pos[0] * k, p.pos[1], p.pos[2] * k);
    // no celular a barra de opções cobre a base: sobe a poltrona no quadro
    b.set(p.look[0], p.look[1] - (narrow ? 0.2 : 0), p.look[2]);
    const t = 1 - Math.pow(0.0008, dt);
    state.camera.position.lerp(a, t);
    controls.current.target.lerp(b, t);
    controls.current.update();
  });
  return null;
}

/* ---------- cena ---------- */

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return <div className="scene-fallback">Seu aparelho não conseguiu abrir o visualizador 3D. As opções ao lado continuam funcionando.</div>;
    return this.props.children;
  }
}

interface Props extends ChairProps {
  running: boolean;
}

export default function Configurator3D({ fabric, wood, active, onSelect, running }: Props) {
  const controls = useRef<any>(null);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    const el = controls.current?.domElement as HTMLElement | undefined;
    // permite rolar a página na vertical com o dedo; gira só no horizontal
    if (el) el.style.touchAction = 'pan-y';
  });

  return (
    <Boundary>
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop={running ? 'always' : 'never'}
        camera={{ position: presets.idle.pos, fov: 30 }}
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        style={{ background: 'transparent' }}
        onPointerMissed={() => onSelect(null)}
      >
        <Suspense fallback={null}>
          <Environment preset="apartment" environmentIntensity={0.9} />
          <directionalLight
            position={[3, 5, 2]}
            intensity={1.6}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0004}
            shadow-camera-left={-3}
            shadow-camera-right={3}
            shadow-camera-top={3}
            shadow-camera-bottom={-3}
          />
          <Chair fabric={fabric} wood={wood} active={active} onSelect={onSelect} />
          <ContactShadows position={[0, 0.002, 0]} opacity={0.42} scale={7} blur={2.8} far={2.2} />
        </Suspense>
        <OrbitControls
          ref={controls}
          makeDefault
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.08}
          autoRotate={auto && !active}
          autoRotateSpeed={0.9}
          minPolarAngle={0.55}
          maxPolarAngle={Math.PI / 2.02}
          target={presets.idle.look}
          onStart={() => setAuto(false)}
        />
        <Rig part={active} controls={controls} />
      </Canvas>
    </Boundary>
  );
}