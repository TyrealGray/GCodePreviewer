import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import { useSelector } from "react-redux";
import GCodeObjectManager from "../threejsComponents/GCodeObjectManager";
import OrbitControls from "../threejsComponents/ObbitControls";

function Viewer3D({ className, startTransition }: { className?: string, startTransition: (callback: () => void) => void }) {

    const gcodeFile: string | null = useSelector((state: any) => state.gcodeFile.file);
    const rendererDivRef = useRef<HTMLDivElement>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const widthRef = useRef<number>(0);
    const heightRef = useRef<number>(0);
    const gcodeObjectManagerRef = useRef<GCodeObjectManager | null>(null);
    const gcodeObjectRef = useRef<THREE.Group | null>(null);
    const orbitControlsRef = useRef<OrbitControls | null>(null);

    const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);

    const onResize = useCallback(() => {
        if (!rendererDivRef.current || !renderer) {
            return;
        }
        widthRef.current = window.innerWidth * 0.7;
        heightRef.current = window.innerHeight;
        if (!cameraRef.current || !sceneRef.current) {
            return;
        }

        if (cameraRef.current && heightRef.current) {
            cameraRef.current.aspect = widthRef.current / heightRef.current;
            cameraRef.current.updateProjectionMatrix();
        }
        renderer?.setSize(widthRef.current, heightRef.current);
    }, [renderer]);

    useEffect(() => {
        if (rendererDivRef.current?.children && rendererDivRef.current?.children.length > 0) {
            return;
        }
        const renderer = new THREE.WebGLRenderer();
        rendererDivRef.current?.appendChild(renderer.domElement);
        setRenderer(renderer);
    }, []);

    useEffect(() => {
        if (!renderer) {
            return;
        }
        const camera = cameraRef.current ?? new THREE.PerspectiveCamera(75, 0, 0.01, 1000);
        camera.position.z = 150;
        const scene = sceneRef.current ?? new THREE.Scene();
        cameraRef.current = camera;
        sceneRef.current = scene;

        const animate = () => {
            requestAnimationFrame(animate);
            if (!renderer || !cameraRef.current || !sceneRef.current) {
                return;
            }
            orbitControlsRef.current?.update();
            renderer.render(sceneRef.current, cameraRef.current);
        };
        animate();

    }, [renderer]);

    useEffect(() => {
        onResize();
    }, [gcodeFile, onResize]);

    useEffect(() => {
        const handleResize = () => {
            if (!renderer) {
                return;
            }
            onResize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, [renderer, onResize]);


    useEffect(() => {
        if (!gcodeObjectManagerRef.current) {
            gcodeObjectManagerRef.current = new GCodeObjectManager();
        }

        if (gcodeObjectRef.current) {
            sceneRef.current?.remove(gcodeObjectRef.current);
            gcodeObjectRef.current = null;
        }

        if (gcodeFile) {
            startTransition(async() => {
                const gcodeObject = await gcodeObjectManagerRef.current?.loadGCode(gcodeFile);
                if (gcodeObject) {
                        gcodeObjectRef.current = gcodeObject;
                        gcodeObject.position.set(0, 0, 0);
                        const box = new THREE.Box3().setFromObject(gcodeObject);
                        const center = new THREE.Vector3();
                        box.getCenter(center);
                        gcodeObject.position.sub(center);
                        sceneRef.current?.add(gcodeObject);

                        if (!orbitControlsRef.current && rendererDivRef.current && cameraRef.current) {
                            const controls = new OrbitControls(cameraRef.current, rendererDivRef.current);
                            controls.connect(rendererDivRef.current);
                            orbitControlsRef.current = controls;
                        }

                        orbitControlsRef.current?.update();
                    }
            });
        }
    }, [gcodeFile, renderer, startTransition]);

    return (
        <div ref={rendererDivRef} className={`${className} w-full h-full h-max-100 w-max-70`}></div>
    );
}

export default Viewer3D;