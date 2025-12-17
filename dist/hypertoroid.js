var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

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
  update(id, asset) {
    if (this.assets.has(id) === false) {
      console.warn(`Cannot find asset ${id}`);
      return;
    }
    this.assets.set(id, asset);
  }
  updateId(oldId, newId) {
    if (this.assets.has(oldId) === false) {
      console.warn(`Cannot find asset ${oldId}`);
      return;
    }
    const asset = this.assets.get(oldId);
    if (asset === void 0) {
      console.warn(`Cannot find asset ${oldId}`);
      return;
    }
    this.assets.set(newId, asset);
    this.assets.delete(oldId);
  }
  /**
   * Get all pixel data from an image asset
   * @param assetId - The ID of the image asset
   * @returns ImageData object or null if asset not found or not an image
   */
  getImageData(assetId) {
    const asset = this.assets.get(assetId);
    if (!asset || !("source" in asset) || !(asset.source instanceof HTMLImageElement)) {
      return null;
    }
    const image = asset.source;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return null;
    }
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, image.width, image.height);
  }
  createObjectPromise(assetManagerHandle, assetRequest) {
    return new Promise((resolve, reject) => {
      let obj;
      let responseType;
      switch (assetRequest.type) {
        case "AUDIO":
          responseType = "arraybuffer";
          break;
        case "JSON":
          responseType = "json";
          break;
        default:
          responseType = "";
      }
      switch (assetRequest.type) {
        case "TEXT":
        case "JSON":
        case "AUDIO":
          const request = new XMLHttpRequest();
          request.open("GET", assetRequest.path, true);
          request.responseType = responseType;
          request.onload = function() {
            assetManagerHandle.assets.set(assetRequest.id, {
              source: request.response,
              tags: [],
              ...assetRequest
            });
            return resolve();
          };
          request.onerror = function() {
            reject(`cannot load ${assetRequest.id} at ${assetRequest.path}`);
          };
          request.send();
          break;
        case "IMAGE":
          obj = new Image();
          obj.onload = function() {
            assetManagerHandle.assets.set(assetRequest.id, {
              source: obj,
              tags: [],
              ...assetRequest
            });
            return resolve();
          };
          obj.onerror = function() {
            reject(`cannot load ${assetRequest.id} at ${assetRequest.path}`);
          };
          obj.src = assetRequest.path;
          break;
        default:
          reject(`unsupported asset type ${assetRequest.type}`);
      }
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
    __publicField(this, "gameLoop", async (timestamp) => {
      if (this.lastUpdateTime === 0) {
        this.lastUpdateTime = timestamp;
      }
      const elapsed = timestamp - this.lastUpdateTime;
      if (elapsed > this.frameInterval) {
        this.deltaTime = this.frameInterval / 1e3;
        this.lastUpdateTime = timestamp - elapsed % this.frameInterval;
        await this.update(this.deltaTime);
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
    this.frameInterval = 1e3 / fps;
    this.init();
  }
  clean(..._args) {
    throw new Error("Method not implemented.");
  }
  async init() {
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
  async update(deltaTime) {
    if (this.debug.update) {
      console.log(`%c *** Update`, `background:#020; color:#adad00`);
    }
    const currentScenes = this.sceneManager?.getCurrentScenes();
    if (currentScenes === void 0) {
      console.warn("no scene to update");
      return;
    }
    try {
      const results = await Promise.allSettled(
        currentScenes.map((scene) => scene.update(deltaTime))
      );
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Scene ${index} update failed:`, result.reason);
        }
      });
    } catch (error) {
      console.error("Critical error in update loop:", error);
    }
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
function createBoundingBox(x, y, width, height) {
  return { nw: { x, y }, se: { x: x + width, y: y + height } };
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

// src/models/color.ts
var RED = { r: 255, g: 0, b: 0, a: 255 };
var GREEN = { r: 0, g: 255, b: 0, a: 255 };
var BLUE = { r: 0, g: 0, b: 255, a: 255 };
var YELLOW = { r: 255, g: 255, b: 0, a: 255 };
function isSameColor(color, colorToCompare) {
  return color.r === colorToCompare.r && color.g === colorToCompare.g && color.b === colorToCompare.b && color.a === colorToCompare.a;
}
function colorToString(color) {
  return `rgba(${color.r},${color.g},${color.b},${color.a})`;
}
function getCtxPixelColor(x, y, ctx) {
  const pixelBuffer = new Uint8ClampedArray(4);
  ctx.getImageData(x, y, 1, 1).data.forEach((v, i) => {
    pixelBuffer[i] = v;
  });
  if (pixelBuffer === void 0) {
    throw new Error("Failed to get pixel data");
  }
  return {
    r: pixelBuffer[0],
    g: pixelBuffer[1],
    b: pixelBuffer[2],
    a: pixelBuffer[3]
  };
}
function colorize(image, r, g, b) {
  const imageSize = image.width;
  const offscreen = new OffscreenCanvas(imageSize, imageSize);
  const ctx = offscreen.getContext("2d");
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, imageSize, imageSize);
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i + 0] *= r;
    imageData.data[i + 1] *= g;
    imageData.data[i + 2] *= b;
  }
  ctx.putImageData(imageData, 0, 0);
  return offscreen;
}

// src/core/interaction-manager.ts
var InteractionManager = class {
  constructor(canvas) {
    __publicField(this, "canvas");
    __publicField(this, "hitboxEvents", /* @__PURE__ */ new Map());
    __publicField(this, "hitboxArray", null);
    __publicField(this, "hitBoxCanvas", new OffscreenCanvas(0, 0));
    __publicField(this, "hitBoxOffscreenCtx", this.hitBoxCanvas.getContext("2d", { willReadFrequently: true }));
    __publicField(this, "colorizedCache", /* @__PURE__ */ new Map());
    __publicField(this, "keyboardFocusId", null);
    __publicField(this, "mouseMoveTargetId", null);
    __publicField(this, "mouseOutCallback", null);
    __publicField(this, "mouseDownTargetId", null);
    __publicField(this, "mouseUpCallback", null);
    __publicField(this, "listener", (htmlEv) => {
      const evType = htmlEv.type;
      if (evType.indexOf("key") === 0) {
        if (this.keyboardFocusId) {
          const focused = this.hitboxEvents.get(this.keyboardFocusId);
          const callback2 = focused?.callbacks?.[evType];
          if (callback2) {
            callback2(htmlEv);
          }
          return;
        }
        const canvasHitBox = this.getCanvasEvent(evType);
        if (canvasHitBox) {
          canvasHitBox.callbacks?.[evType]?.(htmlEv);
        }
      }
      const point = this.extractPoint(htmlEv);
      if (!point) return;
      let hitBoxEvent = this.getHitboxAt(point);
      if (!hitBoxEvent) {
        hitBoxEvent = this.getCanvasEvent(evType);
      }
      if (!hitBoxEvent) return;
      const callback = hitBoxEvent.callbacks?.[evType];
      if (callback) {
        callback(htmlEv);
      }
      this.handleMouseButtonRelease(htmlEv, evType, hitBoxEvent);
      this.handleMouseOut(htmlEv, evType, hitBoxEvent);
    });
    /** Handle mouse button release across different hitboxes.
     * Ensures that if a mousedown occurs on one hitbox and mouseup on another,
     * the original hitbox's mouseup callback is still invoked.
     */
    __publicField(this, "handleMouseButtonRelease", (htmlEv, evType, hitBoxEvent) => {
      if (evType === "mousedown" && this.mouseUpCallback === null) {
        this.mouseUpCallback = hitBoxEvent.callbacks?.["mouseup"] || null;
        this.mouseDownTargetId = hitBoxEvent.id || null;
      }
      if (evType === "mouseup" && this.mouseUpCallback) {
        if (this.mouseDownTargetId !== hitBoxEvent.id) {
          this.mouseUpCallback(htmlEv);
          this.mouseDownTargetId = null;
          this.mouseUpCallback = null;
        }
      }
    });
    /** Handle mouse hover and mouseout across different hitboxes.
     * Ensures that if a mousedown occurs on one hitbox and mouseup on another,
     * the original hitbox's mouseup callback is still invoked.
     */
    __publicField(this, "handleMouseOut", (htmlEv, evType, hitBoxEvent) => {
      if (evType === "mousemove" && this.mouseOutCallback === null) {
        this.mouseOutCallback = hitBoxEvent.callbacks?.["mouseout"] || null;
        this.mouseMoveTargetId = hitBoxEvent.id || null;
      }
      if (evType === "mousemove" && this.mouseOutCallback) {
        if (this.mouseMoveTargetId !== hitBoxEvent.id) {
          this.mouseOutCallback(htmlEv);
          this.mouseMoveTargetId = null;
          this.mouseOutCallback = null;
        }
      }
    });
    this.canvas = canvas;
    this.updateCanvasSize(canvas.width, canvas.height);
  }
  registerEventListener(evType, options) {
    this.canvas.addEventListener(evType, this.listener, options);
  }
  /**
   * Query the highest-priority hitbox at a point.
   * Returns undefined if no hitbox matches.
   */
  getHitboxAt(point) {
    const candidates = this.getHitboxArray().filter(
      (hb) => this.hitTest(hb, point)
    );
    if (candidates.length === 0) return void 0;
    return candidates.sort((a, b) => (b.layer ?? 0) - (a.layer ?? 0))[0];
  }
  updateCanvasSize(width, height) {
    this.hitBoxCanvas.width = width;
    this.hitBoxCanvas.height = height;
  }
  registerKeyboardFocus(id) {
    this.keyboardFocusId = id;
  }
  deregisterKeyboardFocus() {
    this.keyboardFocusId = null;
  }
  // CRUD
  upsertHitbox(id, options) {
    const existing = this.hitboxEvents.get(id);
    this.hitboxEvents.set(id, {
      id,
      layer: options.layer ?? existing?.layer ?? 0,
      boundingBox: options.boundingBox ?? existing?.boundingBox,
      hitTest: options.hitTest ?? existing?.hitTest,
      color: options.color ?? existing?.color,
      image: options.image ?? existing?.image,
      callbacks: options.callbacks ?? existing?.callbacks
    });
    this.hitboxArray = null;
  }
  removeHitbox(id) {
    this.hitboxEvents.delete(id);
    this.hitboxArray = null;
  }
  hasHitBox(hbId) {
    return this.hitboxEvents.has(hbId);
  }
  /**
   * Renders hitboxes to the offscreen canvas, sorted by layer priority.
   * This offscreen canvas is used by hitTest() for pixel-perfect collision detection.
   * Higher layer values are rendered last (on top), ensuring they win priority queries.
   */
  render(ctx = this.hitBoxOffscreenCtx) {
    if (!ctx) return;
    ctx.clearRect(0, 0, this.hitBoxCanvas.width, this.hitBoxCanvas.height);
    const sortedByLayer = this.getHitboxArray().sort(
      (a, b) => (a.layer ?? 0) - (b.layer ?? 0)
    );
    for (const hitboxEvent of sortedByLayer) {
      const bbox = hitboxEvent.boundingBox?.();
      if (!bbox || !hitboxEvent.color) continue;
      if (hitboxEvent.image) {
        const colorized = this.colorizeCached(
          hitboxEvent.image,
          hitboxEvent.color
        );
        ctx.drawImage(colorized, bbox.nw.x, bbox.nw.y);
        continue;
      }
      const colorString = colorToString(hitboxEvent.color);
      ctx.fillStyle = colorString;
      ctx.strokeStyle = colorString;
      ctx.fillRect(
        bbox.nw.x,
        bbox.nw.y,
        bbox.se.x - bbox.nw.x,
        bbox.se.y - bbox.nw.y
      );
    }
  }
  clean(evTypes) {
    for (const evType of evTypes) {
      this.canvas.removeEventListener(evType, this.listener);
    }
    this.hitboxEvents.clear();
    this.hitboxArray = null;
  }
  extractPoint(ev) {
    if ("offsetX" in ev && "offsetY" in ev) {
      return { x: ev.offsetX, y: ev.offsetY };
    }
    return null;
  }
  hitTest(hitboxEvent, point) {
    if (hitboxEvent.boundingBox) {
      const bbox = hitboxEvent.boundingBox();
      if (!bbox || !isPointInAlignedBBox(point, bbox)) {
        return false;
      }
    }
    if (hitboxEvent.hitTest) {
      return hitboxEvent.hitTest(point, this.hitBoxOffscreenCtx);
    }
    if (hitboxEvent.color) {
      const pixel = getCtxPixelColor(point.x, point.y, this.hitBoxOffscreenCtx);
      return isSameColor(pixel, hitboxEvent.color);
    }
    return hitboxEvent.boundingBox !== void 0;
  }
  colorizeCached(image, color) {
    const key = `${image.src}:${color.r},${color.g},${color.b},${color.a}`;
    let cached = this.colorizedCache.get(key);
    if (!cached) {
      cached = colorize(image, color.r, color.g, color.b);
      this.colorizedCache.set(key, cached);
    }
    return cached;
  }
  getHitboxArray() {
    if (!this.hitboxArray) {
      this.hitboxArray = Array.from(this.hitboxEvents.values());
    }
    return this.hitboxArray;
  }
  getCanvasEvent(evType) {
    if (!this.hitboxArray) {
      return void 0;
    }
    return this.hitboxArray?.find((hb) => {
      return hb.boundingBox === void 0 && hb.hitTest === void 0 && hb.color === void 0 && hb.image === void 0 && hb.callbacks?.[evType];
    });
  }
  /**
   * Query all hitboxes at a point, sorted by priority (highest first).
   */
  // getHitboxesAt(point: Vec2<number>): HitboxEvent[] {
  //   return this.getHitboxArray()
  //     .filter((hb) => this.hitTest(hb, point))
  //     .sort((a, b) => (b.layer ?? 0) - (a.layer ?? 0));
  // }
};
__publicField(InteractionManager, "INTERACTION_MANAGER_ID", "InteractionManager");

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

// src/mixins/with-dragging.ts
var UIWINDOW_HITBOX_KEY = "uiwindow-hitbox";
function withDragging(obj) {
  return class extends obj {
    constructor(...args) {
      super(args);
      __publicField(this, "isDragging", false);
      __publicField(this, "dragStartX", 0);
      __publicField(this, "dragStartY", 0);
      __publicField(this, "initialX", 0);
      __publicField(this, "initialY", 0);
      __publicField(this, "elements", []);
      __publicField(this, "boundingBox", {
        nw: { x: 0, y: 0 },
        se: { x: 0, y: 0 }
      });
      __publicField(this, "registerDragging", () => {
        if (this.canvas === null) {
          return;
        }
        this.interactionManager.upsertHitbox(UIWINDOW_HITBOX_KEY, {
          boundingBox: this.getBBox,
          callbacks: {
            mousemove: this.mouseHover,
            mousedown: this.mouseDown,
            mouseup: this.mouseUp
          },
          color: { a: 255, r: 100, g: 100, b: 100 }
        });
      });
      __publicField(this, "deregister", () => {
        this.interactionManager.removeHitbox(UIWINDOW_HITBOX_KEY);
      });
      __publicField(this, "getBBox", () => {
        return createBoundingBox(this.x, this.y, this.width, this.height);
      });
      __publicField(this, "mouseHover", (ev) => {
        if (!this.isDragging) {
          return;
        }
        const deltaX = ev.offsetX - this.dragStartX;
        const deltaY = ev.offsetY - this.dragStartY;
        this.x = this.initialX + deltaX;
        this.y = this.initialY + deltaY;
        for (let i = 0; i < this.elements.length; i++) {
          const el = this.elements[i];
          el.x = el.initialX + deltaX;
          el.y = el.initialY + deltaY;
        }
        this.boundingBox = createBoundingBox(
          this.x,
          this.y,
          this.width,
          this.height
        );
        this.interactionManager.upsertHitbox(UIWINDOW_HITBOX_KEY, {
          boundingBox: this.getBBox
        });
      });
      __publicField(this, "mouseDown", (ev) => {
        if (this.x === null || this.y === null || ev.buttons !== 1 || this.isDragging) {
          return;
        }
        this.isDragging = true;
        this.dragStartX = ev.clientX;
        this.dragStartY = ev.clientY;
        this.initialX = this.x;
        this.initialY = this.y;
        this.elements.forEach((el) => {
          el.initialX = el.x;
          el.initialY = el.y;
        });
      });
      __publicField(this, "mouseUp", (_ev) => {
        this.isDragging = false;
      });
    }
  };
}

// src/mixins/with-event-handling.ts
function withEventHandling(obj = class {
}) {
  return class extends obj {
    constructor(...args) {
      super(args);
      __publicField(this, "interactionManager", DIContainer.getInstance().resolve(
        InteractionManager.INTERACTION_MANAGER_ID
      ));
    }
  };
}

// src/models/base-object.ts
var BaseObject = class {
  constructor() {
    __publicField(this, "_x", 0);
    __publicField(this, "_y", 0);
    __publicField(this, "width", 0);
    __publicField(this, "height", 0);
    __publicField(this, "canvas", null);
    __publicField(this, "bbox", {
      nw: { x: 0, y: 0 },
      se: { x: 0, y: 0 }
    });
    __publicField(this, "elements", []);
    __publicField(this, "getBBox", () => {
      return this.bbox;
    });
  }
  async init(..._args) {
  }
  async update(_deltaTime, ..._args) {
  }
  render(..._args) {
  }
  clean(..._args) {
  }
  set x(v) {
    this._x = v;
    this.calcBBox();
  }
  get x() {
    return this._x;
  }
  set y(v) {
    this._y = v;
    this.calcBBox();
  }
  get y() {
    return this._y;
  }
  getPosition() {
    return { x: this._x, y: this.y };
  }
  calcBBox() {
    this.bbox = createBoundingBox(this.x, this.y, this.width, this.height);
  }
  getSize() {
    return void 0;
  }
  getWidth() {
    return this.width;
  }
  setWidth(width) {
    this.width = width;
    this.bbox = createBoundingBox(this._x, this.y, this.width, this.height);
  }
  getHeight() {
    return this.height;
  }
  setHeight(height) {
    this.height = height;
    this.bbox = createBoundingBox(this._x, this.y, this.width, this.height);
  }
};

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
  async init(..._args) {
  }
  async update(_deltaTime, ..._args) {
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
function getWrappedTextLines(ctx, text, maxWidth) {
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0];
  for (var i = 1; i < words.length; i++) {
    var word = words[i];
    var width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

// src/ui/controls/button.ts
var UIBUTTON_HITBOX_KEY = "ui-button-hitbox";
var UIBUTTON_BACKGROUND_COLOR = { r: 100, g: 100, b: 100, a: 255 };
var UIBUTTON_HOVER_COLOR = { r: 150, g: 150, b: 150, a: 255 };
var UIBUTTON_ACTIVE_COLOR = { r: 200, g: 200, b: 200, a: 255 };
var UIBUTTON_TEXT_COLOR = { r: 255, g: 255, b: 255, a: 255 };
var ButtonBaseClass = class extends BaseObject {
};
var ButtonBase = class extends withEventHandling(ButtonBaseClass) {
};
var UIButton = class extends ButtonBase {
  constructor(canvas, ctx) {
    super();
    __publicField(this, "ctx");
    __publicField(this, "backgroundColor", UIBUTTON_BACKGROUND_COLOR);
    __publicField(this, "hoverColor", UIBUTTON_HOVER_COLOR);
    __publicField(this, "textColor", UIBUTTON_TEXT_COLOR);
    __publicField(this, "activeColor", UIBUTTON_ACTIVE_COLOR);
    __publicField(this, "isHovering", false);
    __publicField(this, "layer", 50);
    __publicField(this, "hitBoxKey", UIBUTTON_HITBOX_KEY);
    __publicField(this, "getBBox", () => {
      return createBoundingBox(this.x, this.y, this.width, this.height);
    });
    __publicField(this, "mouseMove", (ev) => {
      if (ev.offsetX === void 0 || ev.offsetY === void 0) {
        return;
      }
      this.isHovering = true;
    });
    __publicField(this, "mouseOut", (_ev) => {
      this.isHovering = false;
    });
    this.ctx = ctx;
    this.canvas = canvas;
  }
  async init(hitBoxId, layer = 50) {
    await super.init();
    this.layer = layer;
    this.hitBoxKey = hitBoxId ?? UIBUTTON_HITBOX_KEY;
    this.interactionManager.upsertHitbox(this.hitBoxKey, {
      callbacks: {
        mousemove: this.mouseMove,
        mouseout: this.mouseOut
      },
      color: { a: 255, r: 2, g: 12, b: 21 },
      layer,
      boundingBox: this.getBBox
    });
  }
  async update(_deltaTime) {
    await super.update(_deltaTime);
    this.interactionManager.upsertHitbox(UIBUTTON_HITBOX_KEY, {
      layer: this.layer,
      boundingBox: this.getBBox
    });
  }
  clean(..._args) {
    super.clean();
    this.interactionManager.removeHitbox(UIBUTTON_HITBOX_KEY);
  }
  render() {
    this.ctx.fillStyle = this.isHovering ? colorToString(this.hoverColor) : colorToString(this.backgroundColor);
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};

// src/ui/controls/label.ts
var UILabel = class extends BaseObject {
  constructor() {
    super();
    __publicField(this, "id");
    __publicField(this, "ctx");
    __publicField(this, "text");
    __publicField(this, "textStyle");
    __publicField(this, "textFillStyle", "#000");
    __publicField(this, "textStrokeStyle", "#000");
    __publicField(this, "getBBox", () => {
      if (!this.ctx) {
        return void 0;
      }
      return getTextBBox(this.ctx, this.text ?? "", { x: this.x, y: this.y });
    });
  }
  async init() {
  }
  async update() {
    if (this.text === void 0 || this.ctx === void 0) {
      return;
    }
    this.calcBBox();
  }
  render() {
    if (this.text === void 0 || this.ctx === void 0) {
      return;
    }
    this.applyStyles();
    this.ctx.moveTo(this.x, this.y);
    this.ctx.strokeText(this.text, this.x, this.y);
    this.ctx.fillText(this.text, this.x, this.y);
  }
  clean() {
  }
  setText(text) {
    this.text = text;
  }
  getSize() {
    if (this.textFillStyle === void 0 || this.textStrokeStyle === void 0 || this.text === void 0 || this.ctx === void 0) {
      return;
    }
    this.applyStyles();
    const textMetrics = this.ctx.measureText(this.text);
    if (textMetrics === void 0) {
      return void 0;
    }
    return {
      width: textMetrics.width,
      height: textMetrics?.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent
    };
  }
  calcBBox() {
    if (this.text === void 0 || this.ctx === void 0) {
      return;
    }
    this.bbox = getTextBBox(this.ctx, this.text, { x: this.x, y: this.y });
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
    if (this.ctx === void 0) {
      return;
    }
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
  async init(...args) {
    super.init(args);
  }
  async update(deltaTime, ...args) {
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
  BLUE,
  BaseObject,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DIContainer,
  GREEN,
  Game,
  GameObject,
  InteractionManager,
  LinkedList,
  LinkedListNode,
  QuadTree,
  RED,
  SCENE_MANAGER_DI,
  SceneManager,
  Settings,
  UIButton,
  UILabel,
  UIPanel,
  YELLOW,
  angleBetween,
  calculateEdgesPerpendiculars,
  calculateNormals,
  colorToString,
  colorize,
  createBoundingBox,
  createPolygon,
  createSquare,
  createTriangle,
  createVector,
  diffVectors,
  dotProduct,
  drawRotated,
  getBBoxRect,
  getCtxPixelColor,
  getTextBBox,
  getVectorPerpendicular,
  getWorldPolygon,
  getWrappedTextLines,
  intervalsOverlap,
  isPointInAlignedBBox,
  isSameColor,
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
  withDragging,
  withEventHandling
};
//# sourceMappingURL=hypertoroid.js.map
