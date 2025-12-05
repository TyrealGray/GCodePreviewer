import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import { useSelector } from "react-redux";
import GCodeObjectManager from "../threejsComponents/GCodeObjectManager";

function Viewer3D({ className, gcodePath }: { className?: string, gcodePath?: string }) {

    const mode = useSelector((state: any) => state.previewMode.mode);
    const rendererDivRef = useRef<HTMLDivElement>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const widthRef = useRef<number>(0);
    const heightRef = useRef<number>(0);
    const gcodeObjectManagerRef = useRef<GCodeObjectManager | null>(null);

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
        const camera = new THREE.PerspectiveCamera(75, 0, 0.01, 10);
        camera.position.z = 5;
        const scene = new THREE.Scene();
        cameraRef.current = camera;
        sceneRef.current = scene;

        const animate = () => {
            requestAnimationFrame(animate);
            if (!renderer || !cameraRef.current || !sceneRef.current) {
                return;
            }
            renderer.render(sceneRef.current, cameraRef.current);
        };
        animate();

    }, [renderer]);

    useEffect(() => {
        onResize();
    }, [mode]);

    useEffect(() => {
        const handleResize = () => {
            if(!renderer) {
                return;
            }
            onResize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, [renderer]);


    useEffect(() => {
        if (!gcodeObjectManagerRef.current) {
            gcodeObjectManagerRef.current = new GCodeObjectManager();
        }
        if(gcodePath) {
            gcodeObjectManagerRef.current.loadGCode(gcodePath);
        }
    }, [gcodePath]);

    return (
        <div ref={rendererDivRef} className={`${className} w-full h-full h-max-100 w-max-70`}></div>
    );
}

export default Viewer3D;