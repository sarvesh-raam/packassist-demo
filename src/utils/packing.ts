// Client-side 3D bin-packing simulation (demo, no backend required)
// Uses a simple guillotine/shelf algorithm to place boxes inside the trunk

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
    dims: BoxDims;            // actual placed dims
    position: [number, number, number]; // center position in trunk-space (meters)
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

/** Greedy layer-by-layer packing */
export function simulatePacking(trunk: TrunkDims, bags: { type: string; size: string; dims: BoxDims; id: string }[]): PackResult {
    const placed: PlacedBag[] = [];
    const unplaced: { type: string; size: string; reason: string }[] = [];

    // Sort bags by volume descending (largest first)
    const sorted = [...bags].sort((a, b) => {
        const va = a.dims.l * a.dims.w * a.dims.h;
        const vb = b.dims.l * b.dims.w * b.dims.h;
        return vb - va;
    });

    // Simple bottom-up layer packing
    let curX = 0;
    let curY = 0; // floor up
    let curZ = 0;
    let layerH = 0; // max height in current row
    let rowD = 0;   // depth of current layer

    for (const bag of sorted) {
        const { l, w, h } = bag.dims;

        // Check if bag fits in trunk at all
        if (l > trunk.l || w > trunk.w || h > trunk.h) {
            unplaced.push({ type: bag.type, size: bag.size, reason: 'Too large for trunk' });
            continue;
        }

        // Try to fit in current row
        if (curX + l <= trunk.l) {
            // Fits in current row
            if (curZ + w > trunk.w) {
                // Start new depth layer
                curY += layerH;
                curX = 0;
                curZ = 0;
                layerH = 0;
                rowD = 0;
            }
        } else {
            // New row
            curX = 0;
            curZ += rowD;
            rowD = 0;
            layerH = 0;
        }

        if (curY + h > trunk.h) {
            unplaced.push({ type: bag.type, size: bag.size, reason: 'Not enough space' });
            continue;
        }

        // Place it
        const px = -trunk.l / 2 + curX + l / 2;
        const py = -trunk.h / 2 + curY + h / 2;
        const pz = -trunk.w / 2 + curZ + w / 2;

        placed.push({
            id: bag.id,
            type: bag.type,
            size: bag.size,
            dims: bag.dims,
            position: [px, py, pz],
            color: BAG_COLORS[placed.length % BAG_COLORS.length],
        });

        curX += l;
        if (h > layerH) layerH = h;
        if (w > rowD) rowD = w;
    }

    const trunkVol = trunk.l * trunk.w * trunk.h;
    const usedVol = placed.reduce((s, b) => s + b.dims.l * b.dims.w * b.dims.h, 0);
    const utilization = Math.min(usedVol / trunkVol, 1);

    return { placed, unplaced, utilization };
}
