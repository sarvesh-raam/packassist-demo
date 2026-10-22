import { describe, it, expect } from 'vitest';
import { simulatePacking, PlacedBag, TrunkDims } from './packing';
import { BAGS_DATA, CARS_DATA } from '../data/staticData';

const EPS = 1e-9;
const BAG_DIMS = Object.values(BAGS_DATA).flatMap(sizes => Object.values(sizes).map(s => s.dims));
const TRUNKS: TrunkDims[] = CARS_DATA.map(c => ({ l: c.trunkDims[0], w: c.trunkDims[1], h: c.trunkDims[2] }));

// Deterministic PRNG so failures are reproducible
function mulberry32(seed: number) {
    return () => {
        seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const bounds = (b: PlacedBag) => ({
    x0: b.position[0] - b.dims.l / 2, x1: b.position[0] + b.dims.l / 2,
    y0: b.position[1] - b.dims.h / 2, y1: b.position[1] + b.dims.h / 2,
    z0: b.position[2] - b.dims.w / 2, z1: b.position[2] + b.dims.w / 2,
});

describe('simulatePacking', () => {
    it('never overlaps bags or exceeds the trunk (randomized)', () => {
        const rand = mulberry32(42);
        for (let run = 0; run < 2000; run++) {
            const trunk = TRUNKS[run % TRUNKS.length];
            const n = 1 + Math.floor(rand() * 15);
            const bags = Array.from({ length: n }, (_, i) => {
                const [l, w, h] = BAG_DIMS[Math.floor(rand() * BAG_DIMS.length)];
                return { id: String(i), type: 't', size: 's', dims: { l, w, h } };
            });

            const result = simulatePacking(trunk, bags);
            expect(result.placed.length + result.unplaced.length).toBe(n);

            const boxes = result.placed.map(bounds);
            for (const b of boxes) {
                expect(b.x0).toBeGreaterThanOrEqual(-EPS);
                expect(b.y0).toBeGreaterThanOrEqual(-EPS);
                expect(b.z0).toBeGreaterThanOrEqual(-EPS);
                expect(b.x1).toBeLessThanOrEqual(trunk.l + EPS);
                expect(b.y1).toBeLessThanOrEqual(trunk.h + EPS);
                expect(b.z1).toBeLessThanOrEqual(trunk.w + EPS);
            }
            for (let i = 0; i < boxes.length; i++) {
                for (let j = i + 1; j < boxes.length; j++) {
                    const a = boxes[i], b = boxes[j];
                    const hit = a.x0 < b.x1 - EPS && b.x0 < a.x1 - EPS
                        && a.y0 < b.y1 - EPS && b.y0 < a.y1 - EPS
                        && a.z0 < b.z1 - EPS && b.z0 < a.z1 - EPS;
                    expect(hit, `run ${run}: bags ${i} and ${j} overlap`).toBe(false);
                }
            }
            expect(result.utilization).toBeGreaterThanOrEqual(0);
            expect(result.utilization).toBeLessThanOrEqual(1);
        }
    });

    it('rejects invalid dimensions', () => {
        const result = simulatePacking(TRUNKS[0], [
            { id: 'a', type: 'Custom', size: 'Custom', dims: { l: NaN, w: 0.3, h: 0.15 } },
            { id: 'b', type: 'Custom', size: 'Custom', dims: { l: -0.5, w: 0.3, h: 0.15 } },
            { id: 'c', type: 'Custom', size: 'Custom', dims: { l: 0, w: 0.3, h: 0.15 } },
        ]);
        expect(result.placed).toHaveLength(0);
        expect(result.unplaced.map(u => u.reason)).toEqual(Array(3).fill('Invalid dimensions'));
        expect(result.utilization).toBe(0);
    });

    it('rotates a bag that only fits on its side', () => {
        // 0.8m tall bag cannot stand in a 0.7m-high trunk, but fits lying down
        const result = simulatePacking({ l: 1.2, w: 0.9, h: 0.7 }, [
            { id: 'a', type: 't', size: 's', dims: { l: 0.4, w: 0.3, h: 0.8 } },
        ]);
        expect(result.placed).toHaveLength(1);
        expect(result.placed[0].dims.h).toBeLessThanOrEqual(0.7);
    });

    it('reports bags too large in every orientation', () => {
        const result = simulatePacking({ l: 1.2, w: 0.9, h: 0.7 }, [
            { id: 'a', type: 't', size: 's', dims: { l: 2, w: 0.3, h: 0.3 } },
        ]);
        expect(result.unplaced[0].reason).toBe('Too large for trunk');
    });
});
