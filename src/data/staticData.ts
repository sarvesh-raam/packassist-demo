// Static demo data – replaces backend /bags and /cars calls
// This avoids the need for a running Python backend in the demo

export const CARS_DATA = [
    {
        name: 'Compact SUV',
        description: 'Urban SUV with versatile trunk space',
        volume: '405L',
        dimensions: 'L: 1.2m × W: 0.9m × H: 0.7m',
        // trunk box dimensions in meters [L, W, H]
        trunkDims: [1.2, 0.9, 0.7],
    },
    {
        name: 'Sedan',
        description: 'Standard sedan with practical boot space',
        volume: '480L',
        dimensions: 'L: 1.35m × W: 1.0m × H: 0.55m',
        trunkDims: [1.35, 1.0, 0.55],
    },
    {
        name: 'Hatchback',
        description: 'Compact city car with foldable rear seats',
        volume: '320L',
        dimensions: 'L: 0.95m × W: 0.9m × H: 0.65m',
        trunkDims: [0.95, 0.9, 0.65],
    },
    {
        name: 'SUV / MUV',
        description: 'Larger vehicle with generous cargo area',
        volume: '600L',
        dimensions: 'L: 1.5m × W: 1.1m × H: 0.85m',
        trunkDims: [1.5, 1.1, 0.85],
    },
];

export interface BagSizeDef {
    dims: [number, number, number]; // [L, W, H] in meters
    label: string;
}

export const BAGS_DATA: Record<string, Record<string, BagSizeDef>> = {
    'Trolley Bag': {
        SMALL:  { dims: [0.36, 0.23, 0.17], label: '36×23×17 cm' },
        MEDIUM: { dims: [0.46, 0.30, 0.20], label: '46×30×20 cm' },
        LARGE:  { dims: [0.56, 0.38, 0.25], label: '56×38×25 cm' },
    },
    'Soft Rolling Bag': {
        SMALL:  { dims: [0.33, 0.22, 0.16], label: '33×22×16 cm' },
        MEDIUM: { dims: [0.43, 0.28, 0.20], label: '43×28×20 cm' },
        LARGE:  { dims: [0.53, 0.35, 0.22], label: '53×35×22 cm' },
    },
    'Backpack': {
        SMALL:  { dims: [0.30, 0.20, 0.12], label: '30×20×12 cm' },
        MEDIUM: { dims: [0.40, 0.25, 0.15], label: '40×25×15 cm' },
        LARGE:  { dims: [0.50, 0.30, 0.18], label: '50×30×18 cm' },
    },
    'Duffel Bag': {
        SMALL:  { dims: [0.40, 0.22, 0.22], label: '40×22×22 cm' },
        MEDIUM: { dims: [0.55, 0.27, 0.27], label: '55×27×27 cm' },
        LARGE:  { dims: [0.70, 0.33, 0.33], label: '70×33×33 cm' },
    },
    'Cardboard Box': {
        SMALL:  { dims: [0.30, 0.25, 0.20], label: '30×25×20 cm' },
        MEDIUM: { dims: [0.45, 0.35, 0.30], label: '45×35×30 cm' },
        LARGE:  { dims: [0.60, 0.45, 0.40], label: '60×45×40 cm' },
    },
};
