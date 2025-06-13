var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/core/di-container.ts
var _DIContainer = class _DIContainer {
  /**
   * Private constructor to prevent direct instantiation.
   * Use {@link DIContainer.getInstance} to get the single instance of this class.
   * @private
   */
  constructor() {
    /**
     * A map to store registered dependencies.
     * @type {Map<string, any>}
     * @private
     */
    __publicField(this, "dependencies", /* @__PURE__ */ new Map());
  }
  /**
   * Gets the single instance of the DIContainer.
   * If no instance exists, it creates one.
   *
   * @returns {DIContainer} The singleton instance of the DIContainer.
   * @static
   */
  static getInstance() {
    if (!_DIContainer.instance) {
      _DIContainer.instance = new _DIContainer();
    }
    return _DIContainer.instance;
  }
  /**
   * Registers a dependency with a specific name.
   *
   * @template T
   * @param {string} name - The name of the dependency.
   * @param {T} dependency - The dependency to register.
   * @returns {void}
   */
  register(name, dependency) {
    this.dependencies.set(name, dependency);
  }
  /**
   * Resolves a dependency by its name.
   * Throws an error if the dependency is not found.
   *
   * @template T
   * @param {string} name - The name of the dependency to resolve.
   * @returns {T} The resolved dependency.
   * @throws {Error} If the dependency is not found.
   */
  resolve(name) {
    const dependency = this.dependencies.get(name);
    if (!dependency) {
      throw new Error(`Dependency ${name} not found`);
    }
    return dependency;
  }
};
/**
 * The single instance of the DIContainer.
 * @type {DIContainer}
 * @private
 * @static
 */
__publicField(_DIContainer, "instance");
var DIContainer = _DIContainer;

// src/core/scene-manager.ts
var SceneManager = class {
  constructor() {
    __publicField(this, "currentScenes", []);
    __publicField(this, "scenes", []);
  }
  addScene(scene) {
    if (this.scenes.findIndex((s) => s.id === scene?.id) !== -1) {
      console.warn("Scene with same id already exists, provide a new id");
      return;
    }
    this.scenes.push(scene);
  }
  deleteScene(id) {
    const i = this.getSceneIndex(id, this.currentScenes);
    this.currentScenes[i].clean();
    this.currentScenes = this.currentScenes.filter((_, index) => index !== i);
  }
  getCurrentScenes() {
    return this.currentScenes;
  }
  /**
   * Changes the current scene to a new scene specified by the given ID.
   *
   * This function initializes the new scene, optionally initializes a loading scene, and updates
   * the current scenes stack. It also handles cleaning up the previous scene state if specified.
   *
   * @param {string} id - The ID of the new scene to transition to.
   * @param {boolean} [cleanPreviousState=true] - A flag indicating whether to clean up the previous scene state.
   * @param {string} [loadingSceneId] - The ID of an optional loading scene to display while the new scene is initializing.
   * @returns {Promise<void>} A promise that resolves when the scene transition is complete.
   */
  async changeScene(id, cleanPreviousState = true, loadingSceneId) {
    const lastCurrentSceneId = this.currentScenes[this.currentScenes.length - 1]?.id;
    const newScene = this.scenes[this.getSceneIndex(id, this.scenes)];
    if (loadingSceneId !== void 0) {
      const loadingSceneIndex = this.getSceneIndex(loadingSceneId, this.scenes);
      let loadingScene = this.scenes[loadingSceneIndex];
      const loadingSceneInitPromises = loadingScene.init();
      if (loadingSceneInitPromises !== void 0) {
        await loadingSceneInitPromises;
      }
      this.currentScenes.push(loadingScene);
    }
    const newSceneInitPromises = newScene.init();
    if (newSceneInitPromises !== void 0) {
      await newSceneInitPromises;
    }
    if (cleanPreviousState && lastCurrentSceneId !== void 0) {
      this.deleteScene(lastCurrentSceneId);
    }
    if (loadingSceneId !== void 0) {
      this.deleteScene(loadingSceneId);
    }
    this.currentScenes.push(newScene);
  }
  getSceneIndex(id, scenes) {
    const loadingSceneIndex = scenes.findIndex((s) => s.id === id);
    if (loadingSceneIndex === -1) {
      throw new Error(`cannot find scene with id ${id}`);
    }
    return loadingSceneIndex;
  }
};

// src/core/assets-manager.ts
var AssetsManager = class {
  constructor() {
    __publicField(this, "assets", /* @__PURE__ */ new Map());
  }
  add(assetRequests) {
    return assetRequests.map(
      (request) => this.createObjectPromise(this, request)
    );
  }
  find(id) {
    if (this.assets.has(id) === false) {
      throw new Error(`cannot find asset ${id}`);
    }
    return this.assets.get(id);
  }
  delete(id) {
    this.assets.delete(id);
  }
  addTag(id, tag) {
    const a = this.assets.get(id);
    if (a === void 0) {
      console.warn(`cannot find asset ${id}`);
      return;
    }
    a.tags.push(tag);
    this.assets.set(id, a);
  }
  createObjectPromise(assetManagerHandle, assetRequest) {
    return new Promise((resolve, reject) => {
      let obj;
      if (assetRequest.type === "AUDIO") {
        const request = new XMLHttpRequest();
        request.open("GET", assetRequest.path, true);
        request.responseType = "arraybuffer";
        request.onload = function() {
          assetManagerHandle.assets.set(assetRequest.id, {
            source: request.response,
            tags: []
          });
          return resolve();
        };
        request.send();
        return;
      }
      obj = new Image();
      obj.onload = function() {
        assetManagerHandle.assets.set(assetRequest.id, {
          source: obj,
          tags: []
        });
        return resolve();
      };
      obj.onerror = function() {
        reject(`cannot load ${assetRequest.id} at ${assetRequest.path}`);
      };
      obj.src = assetRequest.path;
    });
  }
};

// src/models/game.ts
var SCENE_MANAGER_DI = "SceneManager";
var ASSETS_MANAGER_DI = "AsetsManager";
var Game = class {
  constructor(canvas, canvasWidth, canvasHeight, fps = 30) {
    __publicField(this, "canvas");
    __publicField(this, "ctx");
    __publicField(this, "lastUpdateTime", 0);
    __publicField(this, "deltaTime", 0);
    __publicField(this, "frameInterval", 0);
    __publicField(this, "diContainer", DIContainer.getInstance());
    __publicField(this, "sceneManager");
    __publicField(this, "assetsManager");
    __publicField(this, "settingsManager");
    __publicField(this, "debug", {
      init: false,
      update: false,
      render: false
    });
    __publicField(this, "gameLoop", (timestamp) => {
      const elapsed = timestamp - this.lastUpdateTime;
      if (elapsed > this.frameInterval) {
        this.deltaTime = elapsed / 1e3;
        this.lastUpdateTime = timestamp;
        this.update(this.deltaTime);
        this.render(this.ctx);
      }
      requestAnimationFrame(this.gameLoop);
    });
    if (canvas === null) {
      console.error(`%c *** Error, Canvas cannot be null`);
      throw Error();
    }
    this.canvas = canvas;
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    const context = this.canvas.getContext("2d");
    if (context === null) {
      throw Error("ctx is null");
    }
    this.ctx = context;
    this.lastUpdateTime = 0;
    this.deltaTime = 0;
    this.frameInterval - 1e3 / fps;
    this.init();
  }
  clean(..._args) {
    throw new Error("Method not implemented.");
  }
  init() {
    if (this.debug.init) {
      console.log(`%c *** Init`, `background:#020; color:#adad00`);
    }
    this.sceneManager = new SceneManager();
    this.assetsManager = new AssetsManager();
    this.settingsManager = new Settings();
    this.diContainer.register(
      SCENE_MANAGER_DI,
      this.sceneManager
    );
    this.diContainer.register(
      ASSETS_MANAGER_DI,
      this.assetsManager
    );
    this.diContainer.register(
      AudioController.AUDIO_CONTROLLER_DI,
      new AudioController()
    );
    this.diContainer.register(
      Settings.SETTINGS_DI,
      this.settingsManager
    );
  }
  update(deltaTime) {
    if (this.debug.update) {
      console.log(`%c *** Update`, `background:#020; color:#adad00`);
    }
    this.sceneManager?.getCurrentScenes()?.forEach((scene) => scene.update(deltaTime));
  }
  render(..._args) {
    if (this.debug.render) {
      console.log(`%c *** Render`, `background:#020; color:#adad00`);
    }
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const currentScenes = this.sceneManager?.getCurrentScenes();
    if (currentScenes === void 0) {
      console.warn("no scene to render");
      return;
    }
    currentScenes.forEach((scene) => scene.render(this.ctx));
  }
  start() {
    this.lastUpdateTime = performance.now();
    this.gameLoop(this.lastUpdateTime);
  }
};

// src/core/audio-controller.ts
var MAX_VOLUME = 1;
var AudioController = class {
  constructor() {
    __publicField(this, "assetsManager", DIContainer.getInstance().resolve(ASSETS_MANAGER_DI));
    __publicField(this, "audioContext", new AudioContext());
    __publicField(this, "mainGainNode", this.audioContext.createGain());
    __publicField(this, "playingSounds", {});
    this.mainGainNode.gain.value = MAX_VOLUME;
    this.mainGainNode.connect(this.audioContext.destination);
  }
  get playingAssetsIds() {
    return Object.keys(this.playingSounds);
  }
  setMainVolume(value) {
    this.mainGainNode.gain.value = value >= 0 && value <= MAX_VOLUME ? value : MAX_VOLUME;
  }
  getMainVolume() {
    return this.mainGainNode.gain.value;
  }
  playAsset(id, audioPlayingOptions = { loop: false, force: true }) {
    const soundAsset = this.assetsManager.find(id);
    if (soundAsset === void 0) {
      console.warn("Can`t find asset", id);
    }
    if (this.playingAssetsIds.indexOf(id) > -1 && audioPlayingOptions.force === false) {
      return;
    }
    this.playingSounds[id] = audioPlayingOptions;
    const arrayBuffer = this.assetsManager.find(id)?.source;
    if (arrayBuffer === void 0) {
      return;
    }
    this.audioContext.decodeAudioData(arrayBuffer.slice(0)).then((audioBuffer) => {
      const audioBufferSourceNode = this.audioContext.createBufferSource();
      audioBufferSourceNode.buffer = audioBuffer;
      audioBufferSourceNode.connect(this.mainGainNode);
      audioBufferSourceNode.start();
      audioBufferSourceNode.loop = audioPlayingOptions.loop;
      audioBufferSourceNode.addEventListener("ended", () => {
        Object.entries(this.playingSounds).forEach((n) => {
          if (n[0] === id) {
            console.log(`Audio buffer ended event: ${id}`);
            delete this.playingSounds[id];
          }
        });
      });
    });
  }
};
__publicField(AudioController, "AUDIO_CONTROLLER_DI", "AudioController");

// src/core/settings.ts
var CANVAS_WIDTH = "canvasW";
var CANVAS_HEIGHT = "canvasH";
var Settings = class {
  constructor() {
    __publicField(this, "settings", /* @__PURE__ */ new Map());
  }
  get(key) {
    if (!this.settings.has(key)) {
      return void 0;
    }
    return this.settings.get(key);
  }
  set(key, value) {
    this.settings = this.settings.set(key, value);
  }
};
__publicField(Settings, "SETTINGS_DI", "settings");

// src/helpers/canvas.ts
function drawRotated(ctx, canvasW, canvasH, img, degrees) {
  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.save();
  ctx.translate(canvasW / 2, canvasH / 2);
  ctx.rotate(degrees * Math.PI / 180);
  ctx.drawImage(img, -img.width / 2, -img.width / 2);
  ctx.restore();
}

// src/helpers/math.ts
function getVectorPerpendicular(axis) {
  if (!axis) {
    console.warn(`%c *** axis is null`, `background:#222; color: #bada55`);
    return null;
  }
  return { x: -axis.y, y: axis.x };
}
function intervalsOverlap(intervalA, intervalB) {
  return !(intervalA.max < intervalB.min || intervalB.max < intervalA.min);
}
function toPrecisionNumber(num, precision) {
  return parseFloat(num.toPrecision(precision));
}
function diffVectors(vec1, vec2) {
  const vec1Length = Math.sqrt(Math.pow(vec1.x, 2) + Math.pow(vec1.y, 2));
  const vec2Length = Math.sqrt(Math.pow(vec2.x, 2) + Math.pow(vec2.y, 2));
  return vec1Length - vec2Length;
}
function createVector(direction, distance, origin = { x: 0, y: 0 }) {
  return {
    x: Math.cos(direction) * distance + origin.x,
    y: Math.sin(direction) * distance + origin.y
  };
}
function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y;
}
function magnitude(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}
function projectPolygonToAxis(vertices, axis) {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const vertice of vertices) {
    const projection = dotProduct(vertice, axis);
    if (projection < min) {
      min = projection;
    }
    if (projection > max) {
      max = projection;
    }
  }
  return { min, max };
}
function angleBetween(v1, v2, tolerance = 1e-6) {
  const dot = dotProduct(v1, v2);
  const magProduct = magnitude(v1) * magnitude(v2);
  if (magProduct === 0) return 0;
  const cosTheta = dot / magProduct;
  const cosThetaClamped = Math.min(1, Math.max(-1, cosTheta));
  const theta = Math.acos(cosThetaClamped);
  const crossProduct = v1.x * v2.y - v1.y * v2.x;
  const angle = crossProduct >= 0 ? theta : -theta;
  if (Math.abs(angle) <= tolerance) {
    return 0;
  }
  return angle;
}
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// src/helpers/polygon.ts
var DEFAULT_POLYGON_PARAMS = {
  strokeColor: "#000000",
  selectedStrokeColor: "#aa0000",
  collisionStrokeColor: "#00a4FF",
  worldCoordinates: { x: 0, y: 0 }
};
function renderPolygon(polygon, ctx, options = DEFAULT_POLYGON_PARAMS) {
  if (!polygon) {
    console.error("Polygon is null");
    return;
  }
  if (polygon.points.length < 2) {
    console.warn("Too few points , can't draw polygon ");
    return;
  }
  const origin = {
    x: options.worldCoordinates.x + polygon.points[0].x,
    y: options.worldCoordinates.y + +polygon.points[0].y
  };
  ctx.moveTo(origin.x, origin.y);
  ctx.strokeStyle = options.strokeColor ?? DEFAULT_POLYGON_PARAMS.strokeColor;
  ctx.lineWidth = 1;
  if (polygon.color) {
    ctx.fillStyle = polygon.color;
  }
  ctx.beginPath();
  for (let i = 1; i < polygon.points.length; i++) {
    ctx.lineTo(
      options.worldCoordinates.x + polygon.points[i].x,
      options.worldCoordinates.y + +polygon.points[i].y
    );
  }
  ctx.lineTo(origin.x, origin.y);
  ctx.closePath();
  if (polygon.fill) {
    ctx.fill();
  }
  if (polygon.outline) {
    ctx.stroke();
  }
}
function createTriangle(height, color = "#ffb3ba") {
  if (height === 0) {
    console.warn("height cannot be 0");
    return null;
  }
  return {
    color,
    fill: true,
    points: [
      { x: -height / 2, y: 0 },
      { x: height / 2, y: height / 2 },
      { x: height / 2, y: -height / 2 }
    ],
    sideLength: 2 * height / Math.sqrt(3)
  };
}
function createSquare(sideLength, color = "#ffb3ba") {
  if (sideLength === 0) {
    console.warn("sideLength cannot be 0");
    return null;
  }
  return {
    color,
    fill: true,
    points: [
      { x: -sideLength / 2, y: sideLength / 2 },
      { x: sideLength / 2, y: sideLength / 2 },
      { x: sideLength / 2, y: -sideLength / 2 },
      { x: -sideLength / 2, y: -sideLength / 2 }
    ],
    sideLength
  };
}
function createPolygon(defaults = {}) {
  return {
    color: defaults.color ?? "#ffb3ba",
    fill: defaults.fill ?? true,
    outline: defaults.outline ?? true,
    numSides: defaults.numSides ?? 3,
    points: generatePolygonPoints(
      defaults.numSides ?? 3,
      defaults.sideLength ?? 10
    ),
    sideLength: defaults.sideLength ?? 22
  };
}
function updatePolygonShape(polygon) {
  return {
    ...polygon,
    points: generatePolygonPoints(polygon.numSides, polygon.sideLength)
  };
}
function rotatePolygon(polygon, radiants) {
  return {
    ...polygon,
    points: generatePolygonPoints(
      polygon.numSides,
      polygon.sideLength,
      radiants
    )
  };
}
function calculateNormals(points) {
  return calculateEdgesPerpendiculars(points).reduce(
    (accumulation, current) => {
      return accumulation.some(
        (n) => Math.abs(n.y) === Math.abs(current.y) && Math.abs(n.x) === Math.abs(current.x)
      ) ? accumulation : accumulation.concat(current);
    },
    []
  );
}
function calculateEdgesPerpendiculars(points) {
  const perpendiculars = [];
  const numPoints = points.length;
  for (let i = 0; i < numPoints; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % numPoints];
    const edge = {
      x: p2.x - p1.x,
      y: p2.y - p1.y
    };
    const perpendicularAxis = getVectorPerpendicular(edge);
    if (perpendicularAxis === null) {
      console.warn(
        `%c *** Cannot calculate perpendicular for edge`,
        `background:#222; color: #FFda55`,
        edge
      );
      continue;
    }
    const length = Math.sqrt(
      perpendicularAxis.x * perpendicularAxis.x + perpendicularAxis.y * perpendicularAxis.y
    );
    perpendicularAxis.x /= length;
    perpendicularAxis.y /= length;
    perpendiculars.push(perpendicularAxis);
  }
  return perpendiculars;
}
function getBBoxRect(buondingBox, defaults = {}) {
  return {
    color: defaults.color ?? "#ffb3ba",
    fill: defaults.fill ?? true,
    outline: defaults.outline ?? true,
    numSides: 4,
    points: [
      { x: buondingBox.nw.x, y: buondingBox.nw.y },
      { x: buondingBox.se.x, y: buondingBox.nw.y },
      { x: buondingBox.se.x, y: buondingBox.se.y },
      { x: buondingBox.nw.x, y: buondingBox.se.y }
    ]
  };
}
function getWorldPolygon(polygon, position) {
  return {
    ...polygon,
    worldCoordinates: { x: position.x, y: position.y }
  };
}
function printWorldPolygonInfo(polygon, label = "polygon") {
  console.log(
    `${label}: sides: ${polygon.numSides} | center: x:${polygon?.worldCoordinates.x.toFixed(1)}, y:${polygon?.worldCoordinates.y.toFixed(1)} | points: ${polygon.points.forEach((p, i) => `p[${i}]-${p.x}:${p.y},`)} | normals: ${polygon.normals?.forEach((n, i) => `n[${i}]-${n.x}:${n.y},`)}`
  );
}
function generatePolygonPoints(numSides, sideLength, radiants) {
  const points = [];
  let fullCircle = 2 * Math.PI;
  const angleIncrement = fullCircle / numSides;
  for (let i = 0; i < numSides; i++) {
    let angle = i * angleIncrement;
    if (radiants) {
      angle = angle + radiants;
    }
    const x = sideLength * Math.cos(angle);
    const y = sideLength * Math.sin(angle);
    points.push({ x, y });
  }
  return points;
}

// src/helpers/rect-collision.ts
function isPointInAlignedBBox(point, bbox) {
  return point.x >= bbox.nw.x && point.x <= bbox.se.x && point.y >= bbox.nw.y && point.y <= bbox.se.y;
}

// src/helpers/sat-collision.ts
function satCollision(polygonA, polygonB) {
  if (polygonA.normals === void 0) {
    return false;
  }
  for (let z = 0; z < polygonA.normals.length; z++) {
    const polAVertices = polygonA.points.map((point) => ({
      x: point.x + polygonA.worldCoordinates.x,
      y: point.y + polygonA.worldCoordinates.y
    }));
    const polBVertices = polygonB.points.map((point) => ({
      x: point.x + polygonB.worldCoordinates.x,
      y: point.y + polygonB.worldCoordinates.y
    }));
    const polAProjection = projectPolygonToAxis(
      polAVertices,
      polygonA.normals[z]
    );
    const polBProjection = projectPolygonToAxis(
      polBVertices,
      polygonA.normals[z]
    );
    if (!intervalsOverlap(polAProjection, polBProjection)) {
      return false;
    }
  }
  return true;
}

// src/models/game-object.ts
var GameObject = class {
  constructor(ctx) {
    __publicField(this, "id");
    __publicField(this, "ctx");
    __publicField(this, "width", 64);
    __publicField(this, "height", 64);
    __publicField(this, "position", { x: 0, y: 0 });
    __publicField(this, "bbox", {
      nw: { x: 0, y: 0 },
      se: { x: 0, y: 0 }
    });
    __publicField(this, "direction", 0);
    this.ctx = ctx;
  }
  init(..._args) {
  }
  update(_deltaTime, ..._args) {
  }
  render(..._args) {
  }
  clean(..._args) {
  }
  setPosition(value) {
    this.position = value;
  }
  getPosition() {
    return this.position;
  }
  getSize() {
    return void 0;
  }
  getDirection() {
    return this.direction;
  }
  setDirection(value) {
    this.direction = value;
  }
  getWidth() {
    return this.width;
  }
  setWidth(width) {
    this.width = width;
  }
  getHeight() {
    return this.height;
  }
  setHeight(height) {
    this.height = height;
  }
};

// src/models/structs/linked-list.ts
var LinkedListNode = class {
  constructor(data) {
    __publicField(this, "data");
    __publicField(this, "next", null);
    this.data = data;
  }
};
var LinkedList = class {
  constructor(comparator) {
    __publicField(this, "head", null);
    __publicField(this, "comparator");
    this.comparator = comparator;
  }
  append(data) {
    const newData = new LinkedListNode(data);
    if (!this.head) {
      this.head = newData;
    } else {
      let current = this.head;
      while (current.next != null) {
        current = current.next;
      }
      current.next = newData;
    }
    return newData;
  }
  delete(data) {
    if (!this.head) return;
    if (this.comparator(this.head.data, data)) {
      this.head = this.head.next;
      return;
    }
    let current = this.head.next;
    let previous = this.head;
    while (current) {
      if (this.comparator(current.data, data)) {
        current = null;
      } else {
        previous = current;
        current = current.next;
      }
    }
    previous.next = previous.next ? previous.next.next : null;
  }
  search(data) {
    let current = this.head;
    while (current) {
      if (this.comparator(current.data, data)) {
        return current;
      }
      current = current.next;
    }
    return null;
  }
  traverse() {
    const array = [];
    if (!this.head) {
      return array;
    }
    const addToArray = (node) => {
      array.push(node.data);
      return node.next ? addToArray(node.next) : array;
    };
    return addToArray(this.head);
  }
  size() {
    return this.traverse().length;
  }
};

// src/models/structs/quad-tree.ts
var QuadTree = class _QuadTree {
  // Methods
  constructor(boundary) {
    // Arbitrary constant to indicate how many elements can be stored in this quad tree node
    __publicField(this, "QT_NODE_CAPACITY");
    // Axis-aligned bounding box stored as a center with half-dimensions
    // to represent the boundaries of this quad tree
    __publicField(this, "boundary");
    // Points in this quad tree node
    __publicField(this, "points", []);
    // Children
    __publicField(this, "northWest");
    __publicField(this, "northEast");
    __publicField(this, "southWest");
    __publicField(this, "southEast");
    this.boundary = boundary;
  }
  insert(p) {
    this.points.push(p);
  }
  subdivide() {
    const xLength = (this.boundary.se.x - this.boundary.nw.x) / 2;
    const yLength = (this.boundary.nw.y - this.boundary.se.y) / 2;
    this.northWest = new _QuadTree({
      nw: this.boundary.nw,
      se: { x: this.boundary.nw.x + xLength, y: this.boundary.nw.y + yLength }
    });
    this.northEast = new _QuadTree({
      nw: { x: this.boundary.nw.x + xLength, y: this.boundary.nw.y },
      se: { x: this.boundary.se.x, y: this.boundary.nw.y + yLength }
    });
    this.southWest = new _QuadTree({
      nw: { x: this.boundary.nw.x, y: this.boundary.nw.y + yLength },
      se: { x: this.boundary.nw.x + xLength, y: this.boundary.se.y }
    });
    this.southEast = new _QuadTree({
      nw: { x: this.boundary.nw.x + xLength, y: this.boundary.nw.y + yLength },
      se: this.boundary.se
    });
  }
  queryRange(_range) {
    return void 0;
  }
};

// src/models/unit-vector.ts
function pivotComparator(p1, p2) {
  return p1.position.x === p2.position.x && p1.position.y === p2.position.y && p1.direction === p2.direction;
}

// src/ui/with-events.ts
function withEvents(obj) {
  return class extends obj {
    constructor() {
      super(...arguments);
      /**
       * A map to store event callbacks by their ID.
       * @type {Map<string, Callback>}
       */
      __publicField(this, "events", /* @__PURE__ */ new Map());
      /**
       * A list of AbortController instances to manage event listeners.
       * @type {AbortController[]}
       */
      __publicField(this, "abortControllers", []);
    }
    /**
     * Adds a callback for a specific event type and ID.
     */
    addCallback(eventType, id, ev, blocking, triggerCondition) {
      if (this.events?.has(id)) {
        console.warn(`event with id ${id} already exists!`);
        return;
      }
      this.events?.set(id, {
        eventType,
        ev,
        blocking,
        triggerCondition
      });
    }
    /**
     * Removes a callback by its ID.
     */
    removeCallback(id) {
      if (this.events?.has(id) === false) {
        console.warn(`cannot remove ${id}, event not found!`);
        return;
      }
      this.events?.delete(id);
    }
    /**
     * Deregisters all events by aborting their associated AbortControllers.
     *
     * @returns {void}
     */
    deregisterEvents() {
      this.abortControllers.forEach((ac) => ac.abort());
    }
    /**
     * Enables an event of a specific type on a given event target.
     *
     * @template T
     * @param {T} eventType - The type of the event to enable.
     * @returns {(eventTarget: EventTarget) => void} A function that takes an event target and adds the event listeners to it.
     */
    enableEvent(eventType) {
      return (eventTarget) => {
        if (eventTarget === void 0) {
          throw new Error("eventTarget is undefined!");
        }
        const controller = this.abortControllers[this.abortControllers.push(new AbortController()) - 1];
        this.events.forEach((callBack) => {
          eventTarget.addEventListener(
            eventType,
            async (ev) => {
              if (callBack.eventType !== eventType || callBack.triggerCondition === void 0 || callBack.triggerCondition(ev) === false) {
                return;
              }
              if (ev === void 0) {
                console.warn(`empty event cannot be run!`);
                return;
              }
              if (callBack.blocking) {
                return await callBack.ev(ev);
              }
              return callBack.ev(ev);
            },
            { signal: controller.signal }
          );
        });
      };
    }
  };
}

// src/ui/canvas/helpers/text.ts
function getTextBBox(ctx, text, position) {
  const metrics = ctx.measureText(text);
  const nw = {
    x: position.x + metrics.actualBoundingBoxLeft,
    y: position.y - metrics.actualBoundingBoxAscent
  };
  const se = {
    x: position.x + metrics.actualBoundingBoxRight,
    y: position.y - metrics.actualBoundingBoxDescent
  };
  return { nw, se };
}

// src/ui/controls/label.ts
var UILabel = class extends GameObject {
  constructor(ctx, id, posX, posY, textStyle, text) {
    super(ctx);
    __publicField(this, "id");
    __publicField(this, "text");
    __publicField(this, "DEFAULT_TEXT_STYLE", {
      direction: "inherit",
      font: "10px sans-serif",
      fontKerning: "auto",
      fontStretch: "normal",
      fontVariantCaps: "normal",
      letterSpacing: "normal",
      textAlign: "start",
      textBaseline: "alphabetic",
      textRendering: "auto",
      wordSpacing: "normal"
    });
    __publicField(this, "textStyle", this.DEFAULT_TEXT_STYLE);
    __publicField(this, "textFillStyle", "#000");
    __publicField(this, "textStrokeStyle", "#000");
    this.id = id;
    this.position = { x: posX ?? 0, y: posY ?? 0 };
    if (textStyle !== void 0) {
      this.textStyle = { ...this.textStyle, ...textStyle };
    }
    this.text = text ?? "";
  }
  init(...args) {
    super.init(...args);
  }
  update(deltaTime, ...args) {
    super.update(deltaTime, args);
    if (this.text === void 0 || this.position === void 0) {
      return;
    }
    this.bbox = getTextBBox(this.ctx, this.text, this.position);
  }
  render(...args) {
    super.render(args);
    if (this.position === void 0 || this.text === void 0) {
      return;
    }
    this.applyStyles();
    this.ctx.moveTo(this.position?.x, this.position.y);
    this.ctx.strokeText(this.text, this.position.x, this.position.y);
    this.ctx.fillText(this.text, this.position.x, this.position.y);
  }
  clean(...args) {
    super.clean(args);
  }
  setText(text) {
    this.text = text;
  }
  getSize() {
    if (this.textFillStyle === void 0 || this.textStrokeStyle === void 0) {
      return;
    }
    this.applyStyles();
    const textMetrics = this.ctx.measureText(this.text);
    if (textMetrics === void 0) {
      return void 0;
    }
    return {
      x: textMetrics.width,
      y: textMetrics?.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent
    };
  }
  getBBox() {
    return this.bbox;
  }
  setTextFillStyle(style) {
    this.textFillStyle = style;
  }
  setTextStrokeStyle(style) {
    this.textStrokeStyle = style;
  }
  setTextStyle(textStyle) {
    this.textStyle = textStyle;
  }
  applyStyles() {
    this.ctx.font = this.textStyle?.font ?? "20px Verdana";
    this.ctx.textAlign = this.textStyle?.textAlign ?? "left";
    this.ctx.textBaseline = this.textStyle?.textBaseline ?? "alphabetic";
    if (this.textStrokeStyle !== void 0) {
      this.ctx.strokeStyle = this.textStrokeStyle;
    }
    if (this.textFillStyle !== void 0) {
      this.ctx.fillStyle = this.textFillStyle;
    }
  }
};

// src/ui/controls/clickable-label.ts
var MOUSE_ENTER_ID = "uiClickableLabel-enter";
var MOUSE_LEAVE_ID = "uiClickableLabel-leave";
var UIClickableLabel = class extends withEvents(UILabel) {
  constructor() {
    super(...arguments);
    __publicField(this, "mouseOver", false);
    __publicField(this, "mouseEnterCallbacks", []);
    __publicField(this, "mouseLeaveCallbacks", []);
    __publicField(this, "addMouseEnterCallback", (ev) => {
      this.mouseEnterCallbacks.push(ev);
    });
    __publicField(this, "addMouseLeaveCallback", (ev) => {
      this.mouseLeaveCallbacks.push(ev);
    });
  }
  init(canvas, ..._args) {
    super.init(canvas);
    this.addCallback(
      "mousemove",
      MOUSE_ENTER_ID,
      () => {
        this.playBtnMouseEnter();
        this.mouseEnterCallbacks.forEach((callback) => callback());
      },
      false,
      (ev) => isPointInAlignedBBox(
        { x: ev.offsetX, y: ev.offsetY },
        this.getBBox()
      ) && this.mouseOver === false
    );
    this.enableEvent("mousemove")(canvas);
  }
  clean(..._args) {
    super.clean();
    this.deregisterEvents();
    this.removeCallback(MOUSE_ENTER_ID);
    this.removeCallback(MOUSE_LEAVE_ID);
  }
  playBtnMouseEnter() {
    this.mouseOver = true;
    this.addCallback(
      "mousemove",
      MOUSE_LEAVE_ID,
      () => {
        this.playBtnMouseLeave();
        this.mouseLeaveCallbacks.forEach((callback) => callback());
      },
      false,
      (ev) => !isPointInAlignedBBox({ x: ev.offsetX, y: ev.offsetY }, this.getBBox())
    );
  }
  playBtnMouseLeave() {
    this.mouseOver = false;
    this.removeCallback(MOUSE_LEAVE_ID);
  }
};

// src/ui/controls/panel.ts
var MENUNODES_FONT_SIZE = 48;
var MENUNODES_GAP = 8;
var MENUNODES_STYLE = {
  direction: "inherit",
  font: `${MENUNODES_FONT_SIZE} sans-serif`,
  fontKerning: "auto",
  fontStretch: "normal",
  fontVariantCaps: "normal",
  letterSpacing: "normal",
  textAlign: "start",
  textBaseline: "alphabetic",
  textRendering: "auto",
  wordSpacing: "normal"
};
var UIPanel = class extends GameObject {
  constructor(ctx) {
    super(ctx);
    __publicField(this, "pos", { x: 0, y: 0 });
    __publicField(this, "fillStyle");
    __publicField(this, "strokeStyle");
    __publicField(this, "textStyle", MENUNODES_STYLE);
    __publicField(this, "width", 0);
    __publicField(this, "height", 0);
    __publicField(this, "items", []);
    __publicField(this, "allItemsHeight", 0);
    __publicField(this, "heightGap", MENUNODES_GAP);
  }
  init(...args) {
    super.init(args);
  }
  update(deltaTime, ...args) {
    super.update(deltaTime, args);
    this.items.forEach((i) => i.update(deltaTime, args));
  }
  clean(...args) {
    super.clean(args);
    this.items.forEach((i) => i.clean(args));
  }
  render(...args) {
    if (this.fillStyle !== void 0) {
      this.ctx.fillStyle = this.fillStyle;
    }
    if (this.strokeStyle !== void 0) {
      this.ctx.strokeStyle = this.strokeStyle;
    }
    this.ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    this.items.forEach((i) => i.render(args));
  }
  addPanelItem(gameObject) {
    if (gameObject === void 0) {
      return;
    }
    this.items.push(gameObject);
    let currentHeightPosition = this.getPosition().y;
    let currentWidthPosition = this.getPosition().y;
    this.items.forEach((go) => {
      go.setPosition({ x: currentWidthPosition, y: currentHeightPosition });
      currentHeightPosition += this.heightGap + (go.getSize()?.y ?? 0);
    });
  }
  getPanelItem(id) {
    return this.items.find((i) => i.id === id);
  }
  setHeightGap(value) {
    this.heightGap = value;
  }
  setFillStyle(value) {
    this.fillStyle = value;
  }
  setStrokeStyle(value) {
    this.strokeStyle = value;
  }
  // TODO: implement
  // @ts-expect-error ts(6133)
  calcContentHeight() {
    this.items.forEach((i) => {
      this.allItemsHeight += i.getSize()?.y ?? 0;
    });
  }
};
export {
  ASSETS_MANAGER_DI,
  AssetsManager,
  AudioController,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DIContainer,
  Game,
  GameObject,
  LinkedList,
  LinkedListNode,
  QuadTree,
  SCENE_MANAGER_DI,
  SceneManager,
  Settings,
  UIClickableLabel,
  UILabel,
  UIPanel,
  angleBetween,
  calculateEdgesPerpendiculars,
  calculateNormals,
  createPolygon,
  createSquare,
  createTriangle,
  createVector,
  diffVectors,
  dotProduct,
  drawRotated,
  getBBoxRect,
  getTextBBox,
  getVectorPerpendicular,
  getWorldPolygon,
  intervalsOverlap,
  isPointInAlignedBBox,
  magnitude,
  pivotComparator,
  printWorldPolygonInfo,
  projectPolygonToAxis,
  randomIntFromInterval,
  renderPolygon,
  rotatePolygon,
  satCollision,
  toPrecisionNumber,
  updatePolygonShape,
  withEvents
};
//# sourceMappingURL=hypertoroid.js.map
