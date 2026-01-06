import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import { useSelector } from "react-redux";
import OrbitControls from "../threejsComponents/ObbitControls";
import { addLine, addLineSegment, GCodeParser } from "../threejsComponents/GCodeTravelControl";
import { useDispatch } from "react-redux";
import { setTravelLimit, setTravelSteps } from "../features";

function Viewer3D({ className, startTransition }: { className?: string, startTransition: (callback: () => void) => void }) {

    const dispatch = useDispatch();
    const gcodeFile: string | null = useSelector((state: any) => state.gcodeFile.file);
    const travelSteps = useSelector((state: any) => state.travelStep.steps);
    const travelLimit = useSelector((state: any) => state.travelStep.limit);
    const rendererDivRef = useRef<HTMLDivElement>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const widthRef = useRef<number>(0);
    const heightRef = useRef<number>(0);
    const orbitControlsRef = useRef<OrbitControls | null>(null);
    const gcodeParserRef = useRef<GCodeParser | null>(null);

    const [gcodeLayers, setGcodeLayers] = useState<any[]>([]);
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
        scene.background = new THREE.Color(0xe0e0e0);
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
        if (gcodeFile) {
            startTransition(async () => {
                if (!gcodeParserRef.current) {
                    gcodeParserRef.current = new GCodeParser();
                }
                if (!orbitControlsRef.current && rendererDivRef.current && cameraRef.current) {
                    const controls = new OrbitControls(cameraRef.current, rendererDivRef.current);
                    controls.connect(rendererDivRef.current);
                    orbitControlsRef.current = controls;
                }
                const gcodeData = await gcodeParserRef.current.parseGcode(gcodeFile) as {limit: number, layers: any[]};
                if (gcodeData) {
                    console.log(gcodeData);
                    dispatch(setTravelSteps(gcodeData.limit));
                    dispatch(setTravelLimit(gcodeData.limit));
                    setGcodeLayers(gcodeData.layers);
                }
            });
        }
    }, [gcodeFile, renderer, startTransition, dispatch]);

    useEffect(() => {
        if (!rendererDivRef.current || !renderer || !gcodeFile || (travelSteps > travelLimit)) {
            return;
        }

        if (!cameraRef.current || !sceneRef.current) {
            return;
        }

        while (sceneRef.current.children.length > 0) {
            sceneRef.current.remove(sceneRef.current.children[0]);
        }

        const group = new THREE.Group();
        group.name = "gcode";
        const travelGroup = new THREE.Group();
        travelGroup.name = "travel";

        const current = { x: 0, y: 0, z: 0, e: 0 };

        for (let s = 0; s < gcodeLayers.length && !(s > travelSteps); s++) {
            const bucket = { extrusion: [], travel: [], z: current.z };
            const layer = gcodeLayers[s];

            for (const cmd of layer.commands) {
                if (cmd.gcode === "g0" || cmd.gcode === "g1") {
                    const next = {
                        x: cmd.params.x !== undefined ? cmd.params.x : current.x,
                        y: cmd.params.y !== undefined ? cmd.params.y : current.y,
                        z: cmd.params.z !== undefined ? cmd.params.z : current.z,
                        e: cmd.params.e !== undefined ? cmd.params.e : current.e,
                    };
                    const isExtrude = cmd.params.e > 0;
                    addLineSegment(bucket, current, next, isExtrude);

                    if (cmd.params.x !== undefined) current.x = cmd.params.x;
                    if (cmd.params.y !== undefined) current.y = cmd.params.y;
                    if (cmd.params.z !== undefined) current.z = cmd.params.z;
                    if (cmd.params.e !== undefined) current.e = cmd.params.e;
                }
            }

            const n = Math.round((80 * s) / gcodeLayers.length);
            const shade = new THREE.Color(`hsl(0, 0%, ${n}%)`).getHex();

            addLine(bucket.extrusion, shade, group);
            addLine(bucket.travel, 0xffaaaa, travelGroup);
        }

        group.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
        const box = new THREE.Box3().setFromObject(group);
        const center = new THREE.Vector3();
        box.getCenter(center);
        group.position.sub(center);
        travelGroup.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
        travelGroup.position.sub(center);

        sceneRef.current.add(group);
        sceneRef.current.add(travelGroup);
    }, [gcodeFile, travelSteps, travelLimit, gcodeLayers, renderer]);

    return (
        <div ref={rendererDivRef} className={`${className} w-full h-full h-max-100 w-max-70`}>
        </div>
    );
}

export default Viewer3D;