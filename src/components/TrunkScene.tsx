import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { PlacedBag, BoxDims } from '../utils/packing';

// Loaded lazily from Dashboard so three.js stays out of the main bundle.

/** A single coloured box representing a bag */
function BagBox({ dims, position, color }: { dims: BoxDims; position: [number, number, number]; color: string }) {
    const [hovered, setHovered] = useState(false);

    return (
        <mesh
            position={position}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <boxGeometry args={[dims.l, dims.h, dims.w]} />
            <meshStandardMaterial
                color={hovered ? '#ffffff' : color}
                opacity={hovered ? 0.95 : 0.85}
                transparent
                metalness={0.1}
                roughness={0.6}
            />
            <Edges scale={1.002} renderOrder={1} threshold={10}>
                <lineBasicMaterial color={color} transparent opacity={0.5} />
            </Edges>
        </mesh>
    );
}

/** Wireframe trunk outline */
function TrunkWireframe({ dims }: { dims: [number, number, number] }) {
    return (
        <mesh position={[dims[0] / 2, dims[1] / 2, dims[2] / 2]}>
            <boxGeometry args={dims} />
            <meshStandardMaterial
                color="#8ab4f8"
                transparent
                opacity={0.04}
                side={THREE.BackSide}
            />
            <Edges scale={1.0} threshold={1}>
                <lineBasicMaterial color="#8ab4f8" transparent opacity={0.5} />
            </Edges>
        </mesh>
    );
}

// ---- Grid floor helper ----
function GridFloor({ size }: { size: number }) {
    return <gridHelper args={[size * 2, 20, '#333', '#222']} position={[0, 0, 0]} />;
}

interface TrunkSceneProps {
    trunk: [number, number, number]; // [L, W, H] in meters, as in CARS_DATA
    placed: PlacedBag[];
}

export default function TrunkScene({ trunk, placed }: TrunkSceneProps) {
    const [l, w, h] = trunk;

    return (
        <Canvas
            camera={{ position: [l * 2.5, h * 2.5, w * 2.5], fov: 45 }}
            style={{ background: '#0d1117', width: '100%', height: '100%' }}
        >
            <ambientLight intensity={0.6} />
            <pointLight position={[2, 3, 2]} intensity={1.5} />
            <pointLight position={[-2, 2, -2]} intensity={0.6} />
            <OrbitControls makeDefault enablePan enableZoom target={[l / 2, h / 2, w / 2]} />
            <GridFloor size={Math.max(l, w, h)} />

            {/* Trunk outline; Three.js axes are [L, H, W] */}
            <TrunkWireframe dims={[l, h, w]} />

            {/* Placed bag boxes rendered with 1:1 world-space mapping */}
            {placed.map(bag => (
                <BagBox key={bag.id} dims={bag.dims} position={bag.position} color={bag.color} />
            ))}
        </Canvas>
    );
}
