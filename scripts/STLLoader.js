import {
    BufferGeometry,
    FileLoader,
    Float32BufferAttribute,
    Loader,
    LoaderUtils,
    Vector3
} from './three.module.js';

/**
 *
 * Usage:
 *  const loader = new STLLoader();
 *  loader.load( './models/stl/slotted_disk.stl', function ( geometry ) {
 *    scene.add( new THREE.Mesh( geometry ) );
 *  });
 *
 * For binary STLs geometry might contain colors for vertices. To use it:
 *  // use the same code to load STL as above
 *  if (geometry.hasColors) {
 *    material = new THREE.MeshPhongMaterial({ opacity: geometry.alpha, vertexColors: true });
 *  } else { .... }
 *  const mesh = new THREE.Mesh( geometry, material );
 *
 * For ASCII STLs containing multiple solids, each solid is assigned to a different group.
 * Groups can be used to assign a different color by defining an array of materials with the same length of
 * geometry.groups and passing it to the Mesh constructor:
 *
 * const mesh = new THREE.Mesh( geometry, material );
 *
 * For example:
 *
 *  const materials = [];
 *  const nGeometryGroups = geometry.groups.length;
 *
 *  const colorMap = ...; // Some logic to index colors.
 *
 *  for (let i = 0; i < nGeometryGroups; i++) {
 *
 *		const material = new THREE.MeshPhongMaterial({
 *			color: colorMap[i],
 *			wireframe: false
 *		});
 *
 *  }
 *
 *  materials.push(material);
 *  const mesh = new THREE.Mesh(geometry, materials);
 */


class STLLoader extends Loader {
    constructor(manager) {
        super(manager);
    }
    loadBlob(blob, onLoad) {
        const scope = this;
        try {
            onLoad(scope.parse(blob));
        } catch (error) {
            console.error(error);
        }
    }
    load(url, onLoad, onProgress, onError) {
        const scope = this;
        const loader = new FileLoader(this.manager);
        loader.setPath(this.path);
        loader.setResponseType('arraybuffer');
        loader.setRequestHeader(this.requestHeader);
        loader.setWithCredentials(this.withCredentials);
        loader.load(url, function (text) {
            try {
                onLoad(scope.parse(text));
            } catch (e) {
                if (onError) {
                    onError(e);
                } else {
                    console.error(e);
                }
                scope.manager.itemError(url);
            }
        }, onProgress, onError);
    }

    parse(data) {
        function parseASCII(data) {

            const geometry = new BufferGeometry();
            const patternSolid = /solid([\s\S]*?)endsolid/g;
            const patternFace = /facet([\s\S]*?)endfacet/g;
            let faceCounter = 0;

            const patternFloat = /[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source;
            const patternVertex = new RegExp('vertex' + patternFloat + patternFloat + patternFloat, 'g');
            const patternNormal = new RegExp('normal' + patternFloat + patternFloat + patternFloat, 'g');

            const vertices = [];
            const normals = [];
            const normal = new Vector3();
            let result;
            let groupCount = 0;
            let startVertex = 0;
            let endVertex = 0;

            while ((result = patternSolid.exec(data)) !== null) {
                startVertex = endVertex;
                const solid = result[0];

                while ((result = patternFace.exec(solid)) !== null) {
                    let vertexCountPerFace = 0;
                    let normalCountPerFace = 0;
                    const text = result[0];

                    while ((result = patternNormal.exec(text)) !== null) {
                        normal.x = parseFloat(result[1]);
                        normal.y = parseFloat(result[2]);
                        normal.z = parseFloat(result[3]);
                        normalCountPerFace++;
                    }

                    while ((result = patternVertex.exec(text)) !== null) {
                        vertices.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
                        normals.push(normal.x, normal.y, normal.z);
                        vertexCountPerFace++;
                        endVertex++;
                    }
                    // every face have to own ONE valid normal
                    if (normalCountPerFace !== 1) {
                        console.error('THREE.STLLoader: Something isn\'t right with the normal of face number ' + faceCounter);
                    }
                    // each face have to own THREE valid vertices
                    if (vertexCountPerFace !== 3) {
                        console.error('THREE.STLLoader: Something isn\'t right with the vertices of face number ' + faceCounter);
                    }
                    faceCounter++;
                }

                const start = startVertex;
                const count = endVertex - startVertex;
                geometry.addGroup(start, count, groupCount);
                groupCount++;
            }
            geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
            return geometry;
        }
        
        function ensureString(buffer) {
            if (typeof buffer !== 'string') {
                return LoaderUtils.decodeText(new Uint8Array(buffer));
            }
            return buffer;
        }
        
        return parseASCII(ensureString(data));
    }
}

export { STLLoader };
