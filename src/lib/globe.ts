// The footer globe's dots sit on a Fibonacci lattice: evenly spread over the
// sphere, with no crowding at the poles. The build marks which lattice points
// are land (src/pages/globe-land.json.ts); the browser rebuilds the same
// lattice, so only one bit per point travels over the network.
export const GLOBE_DOTS = 40000;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Longitude and latitude of lattice point `index`, in degrees. */
export const latticePoint = (index: number, count = GLOBE_DOTS): [number, number] => {
  const y = 1 - (2 * index + 1) / count;
  const theta = index * GOLDEN_ANGLE;
  const lon = ((theta * 180 / Math.PI) % 360 + 540) % 360 - 180;
  return [lon, Math.asin(y) * 180 / Math.PI];
};
