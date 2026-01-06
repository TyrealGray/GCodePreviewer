//@ts-nocheck
import * as THREE from 'three';
class Command {
  constructor(gcode, comment) {
    this.gcode = gcode;
    this.comment = comment;
  }
}

class MoveCommand extends Command {
  constructor(gcode, params, comment) {
    super(gcode, comment);
    this.params = params;
  }
}

class Layer {
  constructor(layer, commands) {
    this.layer = layer;
    this.commands = commands;
  }
}

/* Parser */
class GCodeParser {
  parseCommand(line, withComments = true) {
    const parts = line.trim().split(";");
    const codePart = parts[0];
    const comment = withComments && parts[1] ? parts[1] : null;
    const tokens = codePart.split(/ +/g);
    const cmd = tokens[0].toLowerCase();

    switch (cmd) {
      case "g0":
      case "g1": {
        const params = this.parseMove(tokens.slice(1));
        return new MoveCommand(cmd, params, comment);
      }
      default:
        return null;
    }
  }

  parseMove(tokens) {
    return tokens.reduce((acc, token) => {
      const key = token.charAt(0).toLowerCase();
      if (key === "x" || key === "y" || key === "z" || key === "e") {
        acc[key] = parseFloat(token.slice(1));
      }
      return acc;
    }, {});
  }

  groupIntoLayers(commands) {
    const layers = [];
    let currentLayer;
    let currentZ = 0;

    for (const cmd of commands.filter(c => c instanceof MoveCommand)) {
      const params = cmd.params;
      if (params.z && params.z > currentZ && (currentZ !== 0 || params.z < 2)) {
        currentZ = params.z;
        currentLayer = new Layer(layers.length, [cmd]);
        layers.push(currentLayer);
      } else if (currentLayer) {
        currentLayer.commands.push(cmd);
      }
    }
    return layers;
  }

  parseGcode(gcodeText) {
    console.time("parsing");
    
    return new Promise((resolve, reject) => {
const commands = gcodeText
      .split("\n")
      .filter(line => line.length > 0)
      .map(line => this.parseCommand(line))
      .filter(cmd => cmd !== null);

    const layers = this.groupIntoLayers(commands);
    const limit = layers.length - 1;
    console.timeEnd("parsing");


      resolve({
        header: { slicer: "MySlicer" },
        layers,
        limit,
      });
    });
  }

  parseHeader(commands) {
    return {
      slicer: commands
        .filter(c => c && c.comment)
        .map(c => c.comment)
        .filter(c => /(G|g)enerated/.test(c))
        .map(c => {
          if (c.includes("Slic3r")) return "Slic3r";
          if (c.includes("Simplify3D")) return "Simplify3D";
          if (c.includes("Cura_SteamEngine")) return "Cura_SteamEngine";
          return undefined;
        })[0],
    };
  }
}

/* Color maps */
export const Colors = {
  Cura_SteamEngine: {
    skirt: "lime",
    "wall-inner": "purple",
    "wall-outer": "blue",
    skin: "red",
    fill: "orange",
    support: "rgba(255,255,255,0.5)",
  },
  Simplify3D: {
    skirt: "lime",
    "inner perimeter": "purple",
    "outer perimeter": "blue",
    skin: "solid layer",
    fill: "infill",
    support: "rgba(255,255,255,0.5)",
  },
};

function addLine(positions, color, group) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({ color });
    const mesh = new THREE.LineSegments(geometry, material);
    group.add(mesh);
}

function addLineSegment(bucket, from, to, isExtrude) {
    const arr = isExtrude ? bucket.extrusion : bucket.travel;
    arr.push(from.x, from.y, from.z);
    arr.push(to.x, to.y, to.z);
}

export { GCodeParser, Command, MoveCommand, Layer, addLineSegment, addLine };