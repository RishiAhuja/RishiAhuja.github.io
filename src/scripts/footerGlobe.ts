import { navigate } from 'astro:transitions/client';
import { GLOBE_DOTS, latticePoint } from '../lib/globe';

// The footer's dotted globe: the top of a faint globe rising behind the links.
// Land is a Fibonacci lattice of dots drawn by WebGL, so the GPU turns it;
// places from /places and the journeys between them are drawn on a 2D canvas
// above. Drag to spin it, click to open Places. It only runs on screen.

type GlobePlace = { id: string; city: string; lat: number; lon: number; kind: 'home' | 'visited' | 'layover' | 'upcoming' };
type GlobeData = { places: GlobePlace[]; routes: { stops: string[]; upcoming?: boolean }[] };
type Arc = { points: Float32Array; upcoming: boolean; offset: number };

const ACCENT = '23, 78, 166';
const TILT = -10 * Math.PI / 180;          // tipped back, so India sits above the horizon
const DRIFT = 4, CRUISE = 24;              // degrees a second, with places in view and without
const STILL_LONGITUDE = 50;                // reduced motion: Europe to India
const HORIZON = 0.3;                       // the canvas stops this far above the centre, × radius
const FADE_FROM = 0.45;                    // the lower part fades out, from this fraction down
const toRad = Math.PI / 180;
const cartesian = (lon: number, lat: number) => {
  const l = lon * toRad, p = lat * toRad;
  return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)];
};

let landPoints: Float32Array | null = null;
const loadLand = async () => {
  if (landPoints) return landPoints;
  const response = await fetch('/globe-land.json');
  const { land } = await response.json() as { land: string };
  const bits = Uint8Array.from(atob(land), (char) => char.charCodeAt(0));
  const points: number[] = [];
  for (let index = 0; index < GLOBE_DOTS; index++) {
    if (bits[index >> 3] & (1 << (index & 7))) points.push(...cartesian(...latticePoint(index)));
  }
  return (landPoints = new Float32Array(points));
};

// The same rotation as `view` below, in the vertex shader. Points facing away
// get size 0; the lower part of the canvas fades out.
const VERTEX = `
attribute vec3 position;
uniform vec2 turn;
uniform vec2 tilt;
uniform vec3 disc;
uniform vec2 size;
uniform float dot;
varying float shade;
void main() {
  float front = position.x * turn.x + position.y * turn.y;
  float x = position.y * turn.x - position.x * turn.y;
  float y = tilt.x * position.z - tilt.y * front;
  float z = tilt.y * position.z + tilt.x * front;
  vec2 at = vec2(disc.y + x * disc.x, disc.z - y * disc.x);
  float fade = 1.0 - 0.7 * smoothstep(size.y * ${FADE_FROM.toFixed(2)}, size.y, at.y);
  shade = z > 0.0 ? (0.13 + 0.34 * z) * fade : 0.0;
  gl_Position = vec4(at.x / size.x * 2.0 - 1.0, 1.0 - at.y / size.y * 2.0, 0.0, 1.0);
  gl_PointSize = z > 0.0 ? dot * (0.55 + 0.45 * z) : 0.0;
}`;
const FRAGMENT = `
precision mediump float;
uniform vec3 color;
varying float shade;
void main() {
  float alpha = shade * (1.0 - smoothstep(0.3, 0.5, length(gl_PointCoord - 0.5)));
  if (alpha <= 0.0) discard;
  gl_FragColor = vec4(color * alpha, alpha);
}`;

const landRenderer = (canvas: HTMLCanvasElement, points: Float32Array) => {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: true });
  if (!gl) return null;
  const shader = (type: number, source: string) => {
    const object = gl.createShader(type)!;
    gl.shaderSource(object, source); gl.compileShader(object);
    return object;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.uniform3f(gl.getUniformLocation(program, 'color'), 23 / 255, 78 / 255, 166 / 255);
  gl.uniform2f(gl.getUniformLocation(program, 'tilt'), Math.cos(TILT), Math.sin(TILT));
  const turn = gl.getUniformLocation(program, 'turn'), disc = gl.getUniformLocation(program, 'disc');
  const size = gl.getUniformLocation(program, 'size'), dot = gl.getUniformLocation(program, 'dot');
  return {
    draw(cosLon: number, sinLon: number, radius: number, cx: number, cy: number, width: number, height: number, ratio: number) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(turn, cosLon, sinLon);
      gl.uniform3f(disc, radius, cx, cy);
      gl.uniform2f(size, width, height);
      gl.uniform1f(dot, Math.max(1.6, radius / 210) * ratio);
      gl.drawArrays(gl.POINTS, 0, points.length / 3);
    },
  };
};

// A great circle from a to b, rising off the surface in proportion to its length.
const arcPoints = (a: number[], b: number[]) => {
  const angle = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  const steps = Math.max(8, Math.ceil(angle / toRad));
  const lift = Math.min(0.2, 0.03 + angle * 0.12);
  const points = new Float32Array((steps + 1) * 3);
  for (let step = 0; step <= steps; step++) {
    const t = step / steps, s = Math.sin(angle);
    const wa = s < 1e-6 ? 1 - t : Math.sin((1 - t) * angle) / s;
    const wb = s < 1e-6 ? t : Math.sin(t * angle) / s;
    const height = 1 + lift * Math.sin(Math.PI * t);
    for (let axis = 0; axis < 3; axis++) points[step * 3 + axis] = (a[axis] * wa + b[axis] * wb) * height;
  }
  return points;
};

export const mountGlobe = (host: HTMLElement, signal: AbortSignal) => {
  const [landCanvas, canvas] = host.querySelectorAll('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  const data: GlobeData = JSON.parse(host.dataset.globe!);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const font = getComputedStyle(host).fontFamily;
  const places = data.places.map((place) => ({ ...place, vec: cartesian(place.lon, place.lat) }));
  const byId = new Map(places.map((place) => [place.id, place]));
  const arcs: Arc[] = data.routes.flatMap((route) => route.stops.slice(1).map((id, index) => ({
    points: arcPoints(byId.get(route.stops[index])!.vec, byId.get(id)!.vec),
    upcoming: !!route.upcoming,
    offset: index * 0.37 + route.stops.length * 0.21,
  })));
  const cosTilt = Math.cos(TILT), sinTilt = Math.sin(TILT);
  let land: ReturnType<typeof landRenderer> = null;

  let width = 0, height = 0, radius = 0, cx = 0, cy = 0, ratio = 1;
  let longitude = reduce.matches ? STILL_LONGITUDE : 70;
  let speed = -DRIFT, lastTime = 0, frame = 0, visible = false;
  let dragging = false, moved = 0, lastX = 0, dragTime = 0;
  let cosLon = 1, sinLon = 0;
  let hovered: (typeof places)[number] | null = null;

  // Rotate a point into view space (x right, y up, z towards the viewer) and
  // write it to `out`, so the loops allocate nothing.
  const out = new Float32Array(3), mix = new Float32Array(3);
  const view = (points: ArrayLike<number>, offset: number) => {
    const x = points[offset], y = points[offset + 1], z = points[offset + 2];
    const front = x * cosLon + y * sinLon;
    out[0] = y * cosLon - x * sinLon;
    out[1] = cosTilt * z - sinTilt * front;
    out[2] = sinTilt * z + cosTilt * front;
  };
  const orient = () => { cosLon = Math.cos(longitude * toRad); sinLon = Math.sin(longitude * toRad); };

  const resize = () => {
    ratio = Math.min(2, devicePixelRatio || 1);
    width = host.clientWidth; height = host.clientHeight;
    radius = height / (1.06 - HORIZON);
    cx = width / 2; cy = radius * 1.06;
    for (const layer of [landCanvas, canvas]) { layer.width = Math.round(width * ratio); layer.height = Math.round(height * ratio); }
    draw(performance.now());
  };

  const draw = (now: number) => {
    if (!width) return;
    orient();
    land?.draw(cosLon, sinLon, radius, cx, cy, width, height, ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.strokeStyle = `rgba(${ACCENT}, .14)`; context.lineWidth = 1; context.stroke();

    // Arcs end where they pass behind the globe. Journeys already made carry a
    // short bright trail travelling along them.
    context.lineCap = 'round';
    for (const arc of arcs) {
      const count = arc.points.length / 3;
      context.setLineDash(arc.upcoming ? [3, 4] : []);
      context.strokeStyle = `rgba(${ACCENT}, ${arc.upcoming ? 0.3 : 0.26})`;
      context.lineWidth = 1.1;
      context.beginPath();
      let drawing = false;
      for (let index = 0; index < count; index++) {
        view(arc.points, index * 3);
        if (out[2] < 0) { drawing = false; continue; }
        const x = cx + out[0] * radius, y = cy - out[1] * radius;
        if (drawing) context.lineTo(x, y); else context.moveTo(x, y);
        drawing = true;
      }
      context.stroke();
      if (arc.upcoming) continue;
      context.setLineDash([]);
      const progress = reduce.matches ? 0.6 : ((now / 4200 + arc.offset) % 1.5) / 1.1;
      if (progress > 1) continue;
      // Head and tail slide between the arc's samples rather than stepping
      // from one to the next, so the trail glides. It eases in and out.
      const last = count - 1;
      const head = progress * progress * (3 - 2 * progress) * last, tail = Math.max(0, head - last * 0.25);
      const at = (position: number) => {
        const index = Math.min(last - 1, Math.floor(position)), t = position - index;
        for (let axis = 0; axis < 3; axis++) mix[axis] = arc.points[index * 3 + axis] * (1 - t) + arc.points[(index + 1) * 3 + axis] * t;
        view(mix, 0);
        return out[2] >= 0;
      };
      context.beginPath();
      let glowing = false, x0 = 0, y0 = 0, x1 = 0, y1 = 0;
      for (let position = tail, first = true; ; first = false) {
        const shown = at(position);
        x1 = cx + out[0] * radius; y1 = cy - out[1] * radius;
        if (first) { x0 = x1; y0 = y1; }
        if (!shown) glowing = false;
        else if (glowing) context.lineTo(x1, y1);
        else { context.moveTo(x1, y1); glowing = true; }
        if (position >= head) break;
        position = Math.min(head, Math.floor(position) + 1);
      }
      const trail = context.createLinearGradient(x0, y0, x1, y1);
      trail.addColorStop(0, `rgba(${ACCENT}, 0)`); trail.addColorStop(1, `rgba(${ACCENT}, .9)`);
      context.strokeStyle = trail; context.lineWidth = 2; context.stroke();
      if (glowing) {
        context.beginPath(); context.arc(x1, y1, 2.2, 0, Math.PI * 2);
        context.fillStyle = `rgb(${ACCENT})`; context.fill();
      }
    }
    context.setLineDash([]);

    // Places: filled where I have been, rings for layovers and what is next.
    for (const place of places) {
      view(place.vec, 0);
      if (out[2] <= 0) continue;
      const x = cx + out[0] * radius, y = cy - out[1] * radius;
      const size = place.kind === 'home' ? 3.6 : place.kind === 'layover' ? 2 : 2.6;
      const hollow = place.kind === 'layover' || place.kind === 'upcoming';
      context.globalAlpha = Math.min(1, out[2] * 3);
      if (place.kind === 'home') {
        const pulse = reduce.matches ? 0.4 : (now % 2600) / 2600;
        context.beginPath(); context.arc(x, y, size + 2 + pulse * 9, 0, Math.PI * 2);
        context.strokeStyle = `rgba(${ACCENT}, ${0.4 * (1 - pulse)})`; context.lineWidth = 1.2; context.stroke();
      }
      context.beginPath(); context.arc(x, y, size + (place === hovered ? 1.5 : 0), 0, Math.PI * 2);
      context.fillStyle = hollow ? '#fafafa' : `rgb(${ACCENT})`; context.fill();
      context.strokeStyle = hollow ? `rgb(${ACCENT})` : '#fafafa'; context.lineWidth = 1.2; context.stroke();
    }
    context.globalAlpha = 1;

    if (hovered) {
      view(hovered.vec, 0);
      const x = cx + out[0] * radius, y = cy - out[1] * radius;
      context.font = `500 13px ${font}`; context.textBaseline = 'middle';
      const w = context.measureText(hovered.city).width;
      const left = x + 10 + w > width - 4 ? x - 10 - w : x + 10;
      context.lineWidth = 4; context.lineJoin = 'round'; context.strokeStyle = 'rgba(250, 250, 250, .95)';
      context.strokeText(hovered.city, left, y);
      context.fillStyle = `rgb(${ACCENT})`; context.fillText(hovered.city, left, y);
    }

    // The lower part fades out, matching the land in the shader.
    context.globalCompositeOperation = 'destination-out';
    const fade = context.createLinearGradient(0, height * FADE_FROM, 0, height);
    fade.addColorStop(0, 'rgba(0, 0, 0, 0)'); fade.addColorStop(1, 'rgba(0, 0, 0, .7)');
    context.fillStyle = fade; context.fillRect(0, height * FADE_FROM, width, height * (1 - FADE_FROM));
    context.globalCompositeOperation = 'source-over';
  };

  // Drift slowly while places face the viewer; cruise past the empty side.
  const targetSpeed = () => {
    let nearest = -1;
    for (const place of places) { view(place.vec, 0); nearest = Math.max(nearest, out[2]); }
    const empty = 1 - Math.min(1, Math.max(0, (nearest + 0.15) / 0.55));
    return -(DRIFT + (CRUISE - DRIFT) * empty * empty * (3 - 2 * empty));
  };
  const tick = (now: number) => {
    const elapsed = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    if (!dragging) {
      orient();
      speed += (targetSpeed() - speed) * Math.min(1, elapsed * 1.6);
      longitude += speed * elapsed;
    }
    draw(now);
    frame = requestAnimationFrame(tick);
  };
  const play = () => {
    if (frame || !visible || reduce.matches) return;
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const pause = () => { cancelAnimationFrame(frame); frame = 0; };
  const redraw = () => { if (!frame) draw(performance.now()); };

  // Pointer: drag sideways to spin, hover a place for its name, click to open
  // Places at that place, or at the top anywhere else on the globe.
  const onGlobe = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    return { x, y, inside: (x - cx) ** 2 + (y - cy) ** 2 < (radius * 1.02) ** 2 };
  };
  const placeAt = (x: number, y: number) => {
    orient();
    let nearest: typeof hovered = null, best = 14 * 14;
    for (const place of places) {
      view(place.vec, 0);
      if (out[2] <= 0) continue;
      const distance = (cx + out[0] * radius - x) ** 2 + (cy - out[1] * radius - y) ** 2;
      if (distance < best) { best = distance; nearest = place; }
    }
    return nearest;
  };
  host.addEventListener('pointerdown', (event) => {
    if (!onGlobe(event).inside) return;
    dragging = true; moved = 0; lastX = event.clientX; dragTime = event.timeStamp;
    host.setPointerCapture(event.pointerId);
    host.style.cursor = 'grabbing';
  }, { signal });
  host.addEventListener('pointermove', (event) => {
    if (dragging) {
      const delta = (event.clientX - lastX) / radius / toRad;
      const seconds = Math.max(0.008, (event.timeStamp - dragTime) / 1000);
      longitude -= delta; moved += Math.abs(event.clientX - lastX);
      speed = Math.max(-240, Math.min(240, -delta / seconds));
      lastX = event.clientX; dragTime = event.timeStamp;
      redraw();
      return;
    }
    const { x, y, inside } = onGlobe(event);
    const next = inside ? placeAt(x, y) : null;
    host.style.cursor = next ? 'pointer' : inside ? 'grab' : '';
    if (next !== hovered) { hovered = next; redraw(); }
  }, { signal });
  const release = () => { dragging = false; host.style.cursor = ''; lastTime = performance.now(); };
  host.addEventListener('pointerup', (event) => {
    const wasDrag = moved > 4;
    release();
    if (wasDrag) return;
    const { x, y, inside } = onGlobe(event);
    if (!inside) return;
    const place = placeAt(x, y);
    navigate(place ? `/places#${place.id}` : '/places');
  }, { signal });
  host.addEventListener('pointercancel', release, { signal });
  host.addEventListener('pointerleave', () => { if (!dragging && hovered) { hovered = null; host.style.cursor = ''; redraw(); } }, { signal });

  // Load and animate only while the footer is near the screen and the tab is shown.
  let near = false;
  const update = () => {
    visible = near && document.visibilityState === 'visible';
    if (!visible) return pause();
    loadLand().then((points) => {
      if (signal.aborted) return;
      land ??= landRenderer(landCanvas, points);
      host.dataset.ready = '';
      draw(performance.now()); play();
    }, () => {});
    play();
  };
  const sizes = new ResizeObserver(resize);
  sizes.observe(host);
  const seen = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; update(); }, { rootMargin: '100px 0px' });
  seen.observe(host);
  document.addEventListener('visibilitychange', update, { signal });
  signal.addEventListener('abort', () => { sizes.disconnect(); seen.disconnect(); pause(); visible = false; });
};
