"use client";

import {
  Bounds,
  Center,
  Html,
  OrbitControls,
  Text3D,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";

const FONT_PATH = "/fonts/helvetiker_regular.typeface.json";

interface ProductViewer3DProps {
  modelUrl: string;
  customText?: string;
  className?: string;
}

function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-xs font-medium">3D model yükleniyor…</span>
      </div>
    </Html>
  );
}

function CustomTextLabel({ text }: { text: string }) {
  if (!text.trim()) return null;

  return (
    <Text3D
      font={FONT_PATH}
      position={[0, 0.85, 0.35]}
      rotation={[-0.15, 0, 0]}
      size={0.14}
      height={0.035}
      curveSegments={12}
      bevelEnabled
      bevelThickness={0.008}
      bevelSize={0.004}
      bevelOffset={0}
      bevelSegments={4}
    >
      {text}
      <meshStandardMaterial color="#1e293b" metalness={0.35} roughness={0.45} />
    </Text3D>
  );
}

function ProductModel({
  modelUrl,
  customText,
}: {
  modelUrl: string;
  customText?: string;
}) {
  const { scene } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
  }, [clonedScene]);

  return (
    <Bounds fit clip observe margin={1.2}>
      <Center>
        <group>
          <primitive object={clonedScene} />
          {customText && <CustomTextLabel text={customText} />}
        </group>
      </Center>
    </Bounds>
  );
}

function Scene({
  modelUrl,
  customText,
}: {
  modelUrl: string;
  customText?: string;
}) {
  return (
    <>
      <color attach="background" args={["#f1f5f9"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1} />
      <directionalLight position={[-4, 4, -3]} intensity={0.35} />
      <directionalLight position={[0, -4, 2]} intensity={0.25} />

      <Suspense fallback={<CanvasLoader />}>
        <ProductModel modelUrl={modelUrl} customText={customText} />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.7}
        minDistance={1.5}
        maxDistance={30}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI - 0.2}
        target={[0, 0, 0]}
      />
    </>
  );
}

export default function ProductViewer3D({
  modelUrl,
  customText = "",
  className = "",
}: ProductViewer3DProps) {
  return (
    <div
      className={`relative h-full w-full select-none ${className}`}
      onDragStart={(e) => e.preventDefault()}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 2, 8], fov: 40, near: 0.1, far: 200 }}
        className="!absolute inset-0 h-full w-full touch-none"
        style={{ touchAction: "none" }}
      >
        <Scene modelUrl={modelUrl} customText={customText} />
      </Canvas>
    </div>
  );
}
