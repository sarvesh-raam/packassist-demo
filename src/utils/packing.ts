// Client-side 3D bin-packing simulation (demo, no backend required)
// Uses an extreme-point heuristic: each bag is tried in every orientation at every
// candidate corner, and the lowest valid, supported placement wins.

export interface BoxDims {
    l: number; // meters
    w: number;
    h: number;
}

export interface TrunkDims {
    l: number;
    w: number;
    h: number;
}

export interface PlacedBag {
    id: string;
    type: string;
    size: string;
    dims: BoxDims;            // actual placed dims (after rotation)
    position: [number, number, number]; // center position in trunk-space (meters): [x along l, y along h, z along w]
    color: string;
}

export interface PackResult {
    placed: PlacedBag[];
    unplaced: { type: string; size: string; reason: string }[];
    utilization: number; // 0-1
}

const BAG_COLORS = [
    '#4285F4', '#EA4335', '#FBBC04', '#34A853', '#AB47BC',
    '#00ACC1', '#FF7043', '#9E9D24', '#5C6BC0', '#F06292',
    '#26A69A', '#FFA726', '#8D6E63', '#78909C', '#EC407A',
];

const EPS = 1e-9;
// Fraction of a bag's base that must rest on the floor or on other bags
const MIN_SUPPORT = 0.7;

interface Box {
    x: number; y: number; z: number; // min corner
    l: number; h: number; w: number;
}

function orientations({ l, w, h }: BoxDims): BoxDims[] {
    const all: BoxDims[] = [
        { l, w, h }, { l: w, w: l, h },
        { l, w: h, h: w }, { l: h, w: l, h: w },
        { l: w, w: h, h: l }, { l: h, w, h: l },
    ];
    // Drop duplicates for bags with equal sides
    return all.filter((o, i) => all.findIndex(p => p.l === o.l && p.w === o.w && p.h === o.h) === i);
}

function overlaps(a: Box, b: Box): boolean {
    return a.x < b.x + b.l - EPS && b.x < a.x + a.l - EPS
        && a.y < b.y + b.h - EPS && b.y < a.y + a.h - EPS
        && a.z < b.z + b.w - EPS && b.z < a.z + a.w - EPS;
}

function supportedArea(c: Box, boxes: Box[]): number {
    if (c.y < EPS) return c.l * c.w;
    let area = 0;
    for (const b of boxes) {
        if (Math.abs(b.y + b.h - c.y) > EPS) continue;
        const dx = Math.min(c.x + c.l, b.x + b.l) - Math.max(c.x, b.x);
        const dz = Math.min(c.z + c.w, b.z + b.w) - Math.max(c.z, b.z);
        if (dx > 0 && dz > 0) area += dx * dz;
    }
    return area;
}

const isValidDims = ({ l, w, h }: BoxDims) =>
    [l, w, h].every(v => Number.isFinite(v) && v > 0);

/** Greedy extreme-point packing with rotation and support checks */
export function simulatePacking(trunk: TrunkDims, bags: { type: string; size: string; dims: BoxDims; id: string }[]): PackResult {
    const placed: PlacedBag[] = [];
    const unplaced: { type: string; size: string; reason: string }[] = [];
    const boxes: Box[] = [];
    let points: [number, number, number][] = [[0, 0, 0]];
    // One colour per distinct bag kind, so identical bags share a legend entry
    const colorByKind = new Map<string, string>();
    const colorFor = (bag: { type: string; size: string; dims: BoxDims }) => {
        const key = `${bag.type}|${bag.size}|${bag.dims.l}|${bag.dims.w}|${bag.dims.h}`;
        if (!colorByKind.has(key)) colorByKind.set(key, BAG_COLORS[colorByKind.size % BAG_COLORS.length]);
        return colorByKind.get(key)!;
    };

    // Sort bags by volume descending (largest first)
    const sorted = [...bags].sort((a, b) => {
        const va = a.dims.l * a.dims.w * a.dims.h;
        const vb = b.dims.l * b.dims.w * b.dims.h;
        return vb - va;
    });

    for (const bag of sorted) {
        if (!isValidDims(bag.dims)) {
            unplaced.push({ type: bag.type, size: bag.size, reason: 'Invalid dimensions' });
            continue;
        }

        const fitting = orientations(bag.dims).filter(o =>
            o.l <= trunk.l + EPS && o.w <= trunk.w + EPS && o.h <= trunk.h + EPS);
        if (fitting.length === 0) {
            unplaced.push({ type: bag.type, size: bag.size, reason: 'Too large for trunk' });
            continue;
        }

        // Prefer the lowest placement, then the one closest to the back/left corner
        let best: Box | null = null;
        for (const [x, y, z] of points) {
            for (const o of fitting) {
                const c: Box = { x, y, z, l: o.l, h: o.h, w: o.w };
                if (x + o.l > trunk.l + EPS || y + o.h > trunk.h + EPS || z + o.w > trunk.w + EPS) continue;
                if (best && (y > best.y + EPS || (Math.abs(y - best.y) <= EPS && (x > best.x + EPS || (Math.abs(x - best.x) <= EPS && z >= best.z - EPS))))) continue;
                if (boxes.some(b => overlaps(c, b))) continue;
                if (supportedArea(c, boxes) < MIN_SUPPORT * o.l * o.w - EPS) continue;
                best = c;
            }
        }

        if (!best) {
            unplaced.push({ type: bag.type, size: bag.size, reason: 'Not enough space' });
            continue;
        }

        boxes.push(best);
        points = points.filter(([x, y, z]) => !(x === best.x && y === best.y && z === best.z));
        points.push(
            [best.x + best.l, best.y, best.z],
            [best.x, best.y + best.h, best.z],
            [best.x, best.y, best.z + best.w],
        );

        placed.push({
            id: bag.id,
            type: bag.type,
            size: bag.size,
            dims: { l: best.l, w: best.w, h: best.h },
            position: [best.x + best.l / 2, best.y + best.h / 2, best.z + best.w / 2],
            color: colorFor(bag),
        });
    }

    const trunkVol = trunk.l * trunk.w * trunk.h;
    const usedVol = placed.reduce((s, b) => s + b.dims.l * b.dims.w * b.dims.h, 0);
    const utilization = Math.min(usedVol / trunkVol, 1);

    return { placed, unplaced, utilization };
}
