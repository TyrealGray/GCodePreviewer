import { GCodeLoader } from './GCodeLoader';
import * as THREE from 'three';

class GCodeObjectManager {
    private gcodeLoader: GCodeLoader;
    constructor() {
        const manager = new THREE.LoadingManager();
        this.gcodeLoader = new GCodeLoader(manager);
    }

    public async loadGCode(url: string) {
        const gcodeObject = await this.gcodeLoader.loadAsync(url);
        return gcodeObject;
    }
}

export default GCodeObjectManager;