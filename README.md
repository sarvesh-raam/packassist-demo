# PackAssist | 3D Trunk Packing Simulator

[![CI Build Check](https://github.com/sarvesh-raam/packassist-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/sarvesh-raam/packassist-demo/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Framework: React](https://img.shields.io/badge/Framework-React-blue?logo=react)](https://react.dev/)
[![Visualization: Three.js](https://img.shields.io/badge/3D-Three.js-black?logo=three.dot-js)](https://threejs.org/)
[![Auth: Firebase](https://img.shields.io/badge/Auth-Firebase-orange?logo=firebase)](https://firebase.google.com/)
[![Deployment: Live](https://img.shields.io/badge/Status-Live_Demo-success)](https://packassist-demo.web.app)

PackAssist plans how luggage fits into a car trunk. Pick a vehicle, add bags by type and size (or enter custom dimensions), and the app computes a 3D arrangement and renders it in an interactive viewer. All packing runs in the browser; there is no backend beyond Firebase Authentication.

[Explore the Live Demo](https://packassist-demo.web.app)

---

## Reading Guide

- **Technical Recruiters**: Core Capabilities and Architecture summarise the engineering decisions.
- **Product Managers**: Problem Analysis and Roadmap cover the use case and next steps.
- **Software Engineers**: Packing Algorithm, Project Structure and Developer Guide cover the implementation.

---

## Problem Analysis

Trunk volume in litres says little about whether a specific set of bags will fit: rigid boxes cannot share space, and orientation matters. PackAssist treats each bag as a rigid box and simulates discrete placement inside the trunk's usable volume, reporting what fits, what does not, and how much of the space is used.

## Core Capabilities

| Capability | Description |
| :--- | :--- |
| **3D Packing** | Client-side extreme-point heuristic with rotation and support checks; placements never overlap or leave the trunk. |
| **3D Visualization** | Interactive React Three Fiber scene with orbit controls, fullscreen mode and a per-bag-type colour legend. |
| **Authentication** | Firebase Authentication with email/password and Google sign-in; app routes require a signed-in user. |
| **Input Validation** | Custom dimensions are bounded (1-300 cm) and invalid sizes are reported rather than rendered. |
| **Report Export** | Downloadable text summary of placed and unplaced items and space utilization. |
| **Responsive UI** | Layouts adapt to desktop, tablet and mobile widths. |

---

## Architecture

### Packing Algorithm
Implemented in [`src/utils/packing.ts`](src/utils/packing.ts):

1. Bags are sorted by volume, largest first.
2. The packer maintains a set of *extreme points*: candidate corners created by the faces of already placed bags, starting from the trunk's origin corner.
3. For each bag, every distinct orientation (up to six) is tried at every extreme point. A candidate is valid only if it stays inside the trunk, does not intersect any placed bag, and has at least 70% of its base resting on the floor or on other bags.
4. The lowest valid candidate wins (then the one nearest the back corner), which fills the floor before stacking.
5. Bags that are invalid, larger than the trunk in every orientation, or that have no valid position are returned as unplaced with a reason.

This is a greedy heuristic: it is fast (well under a millisecond for typical inputs) but does not guarantee an optimal packing.

### Verification
[`src/utils/packing.test.ts`](src/utils/packing.test.ts) runs 2,000 seeded random packings across every vehicle and bag size and asserts that no two bags overlap and no bag extends outside the trunk, plus targeted tests for rotation, oversize bags and invalid dimensions. CI runs lint, tests and a production build on every push.

### Rendering
The 3D viewer ([`src/components/TrunkScene.tsx`](src/components/TrunkScene.tsx)) uses packer coordinates directly in world space, so what is rendered is exactly what was computed. It is loaded with `React.lazy`, keeping three.js out of the initial bundle (about 124 KB gzipped for the main bundle).

---

## Tech Stack

- **UI**: React 19, TypeScript, React Router
- **3D**: three.js, React Three Fiber, Drei
- **Auth and Hosting**: Firebase Authentication, Firebase Hosting
- **Tooling**: Vite, Vitest, ESLint, GitHub Actions

## Project Structure

```
src/
  components/   Header, loading screen, lazily loaded 3D TrunkScene
  context/      Auth and theme providers
  data/         Vehicle trunk and bag size catalogue
  hooks/        useIsMobile
  pages/        Landing, sign in/up, vehicle selection, packing dashboard
  utils/        Packing algorithm and its tests
```

---

## Developer Guide

### Prerequisites
- **Node.js**: v20 or later
- **npm**: v10 or later

### Installation
```bash
git clone https://github.com/sarvesh-raam/packassist-demo.git
cd packassist-demo
npm install
npm run dev
```

### Scripts
| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Start the development server |
| `npm test` | Run the unit and property tests |
| `npm run lint` | Lint the codebase |
| `npm run build` | Type-check and build for production |

### Deployment
```bash
npm run build
firebase deploy
```

---

## Roadmap

- Weight-aware stacking (heavier bags lower) and fragile-item constraints
- Saved trips and shareable result links via Firestore
- Step-by-step loading order in the 3D viewer
- Vehicle catalogue with real trunk measurements

---

## License

Released under the [MIT License](LICENSE).

> **Note**: This project is a standalone, NDA-compliant conceptual demo. All proprietary data and branding have been removed or replaced with generic assets.
