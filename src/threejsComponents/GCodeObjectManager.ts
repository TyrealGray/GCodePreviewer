import { GCodeLoader } from './GCodeLoader';
import * as THREE from 'three';

class GCodeObjectManager {
    private gcodeLoader: GCodeLoader;
    constructor() {
        const manager = THREE.DefaultLoadingManager;
        this.gcodeLoader = new GCodeLoader(manager);
    }

    public async loadGCode(url: string): Promise<THREE.Group | undefined> {
        const gcodeObject = await this.gcodeLoader.loadAsync(url);
        return gcodeObject as THREE.Group;
    }
}

export default GCodeObjectManager;