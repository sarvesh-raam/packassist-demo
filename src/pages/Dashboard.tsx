import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import * as THREE from 'three';
import Header from '../components/Header';
import LoadingAnimation from '../components/LoadingAnimation';
import { Trash2, Plus, Minus, Play, Box, ChevronLeft, ChevronUp, ChevronDown, Maximize, Download, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { BAGS_DATA, CARS_DATA } from '../data/staticData';
import { simulatePacking, PlacedBag, BoxDims } from '../utils/packing';

// ----- 3D Components -----

/** A single coloured box representing a bag */
function BagBox({ dims, position, color }: { dims: BoxDims; position: [number, number, number]; color: string }) {
    const [hovered, setHovered] = useState(false);
    return (
        <mesh
            position={position}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <boxGeometry args={[dims.l, dims.h, dims.w]} />
            <meshStandardMaterial
                color={hovered ? '#ffffff' : color}
                opacity={hovered ? 0.95 : 0.85}
                transparent
                metalness={0.1}
                roughness={0.6}
            />
            <Edges scale={1.002} renderOrder={1} threshold={10}>
                <lineBasicMaterial color={color} transparent opacity={0.5} />
            </Edges>
        </mesh>
    );
}

/** Wireframe trunk outline */
function TrunkWireframe({ dims }: { dims: [number, number, number] }) {
    return (
        <mesh>
            <boxGeometry args={dims} />
            <meshStandardMaterial
                color="#8ab4f8"
                wireframe={false}
                transparent
                opacity={0.04}
                side={THREE.BackSide}
            />
            <Edges scale={1.0} threshold={1}>
                <lineBasicMaterial color="#8ab4f8" transparent opacity={0.5} />
            </Edges>
        </mesh>
    );
}

// ---- Grid floor helper ----
function GridFloor({ size }: { size: number }) {
    return <gridHelper args={[size * 2, 20, '#333', '#222']} position={[0, 0, 0]} />;
}

// ----- Interfaces -----
interface BagItem {
    id: string;
    type: string;
    size: string;
    dims?: BoxDims; // custom
}

export default function Dashboard() {
    const location = useLocation();
    const { car } = (location.state as any) || { car: 'Compact SUV' };
    const { theme, isDark } = useTheme();
    const isMobile = useIsMobile();

    // Resolve car trunk dims
    const carData = CARS_DATA.find(c => c.name === car) ?? CARS_DATA[0];
    const trunkDims: [number, number, number] = [carData.trunkDims[0], carData.trunkDims[2], carData.trunkDims[1]]; // [L,H,W] for Three.js

    // Bag selection
    const [selectedType, setSelectedType] = useState<string>(Object.keys(BAGS_DATA)[0]);
    const [selectedSize, setSelectedSize] = useState<string>('MEDIUM');
    const [quantity, setQuantity] = useState(1);
    const [customDims, setCustomDims] = useState({ l: '50', b: '30', h: '15' });
    const [selectedBags, setSelectedBags] = useState<BagItem[]>([]);

    // Optimization
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [result, setResult] = useState<{ placed: PlacedBag[]; unplaced: { type: string; size: string; reason: string }[]; utilization: number } | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    // ---- Grouping util ----
    const groupedBags = useMemo(() => {
        const groups: Record<string, BagItem & { count: number; ids: string[] }> = {};
        selectedBags.forEach(bag => {
            const key = `${bag.type}-${bag.size}-${bag.dims ? JSON.stringify(bag.dims) : ''}`;
            if (!groups[key]) groups[key] = { ...bag, count: 0, ids: [] };
            groups[key].count++;
            groups[key].ids.push(bag.id);
        });
        return Object.values(groups);
    }, [selectedBags]);

    // ---- Actions ----
    const handleAdd = () => {
        if (!selectedType) return;
        const newBags: BagItem[] = [];
        for (let i = 0; i < quantity; i++) {
            if (selectedType === 'Custom Dimensions') {
                newBags.push({
                    id: `${Date.now()}-${Math.random()}`,
                    type: 'Custom',
                    size: 'Custom',
                    dims: { l: parseFloat(customDims.l) / 100, w: parseFloat(customDims.b) / 100, h: parseFloat(customDims.h) / 100 },
                });
            } else {
                const sizeDef = BAGS_DATA[selectedType]?.[selectedSize];
                newBags.push({
                    id: `${Date.now()}-${Math.random()}`,
                    type: selectedType,
                    size: selectedSize,
                    dims: sizeDef ? { l: sizeDef.dims[0], w: sizeDef.dims[1], h: sizeDef.dims[2] } : undefined,
                });
            }
        }
        setSelectedBags(prev => [...prev, ...newBags]);
        setQuantity(1);
    };

    const removeGroup = (ids: string[]) =>
        setSelectedBags(prev => prev.filter(b => !ids.includes(b.id)));

    const handleOptimize = async () => {
        if (selectedBags.length === 0) return;
        setIsOptimizing(true);

        // Simulate processing delay for UX effect
        await new Promise(r => setTimeout(r, selectedBags.length * 300 + 800));

        const bagInputs = selectedBags.map(bag => ({
            id: bag.id,
            type: bag.type,
            size: bag.size,
            dims: bag.dims ?? { l: 0.3, w: 0.2, h: 0.2 },
        }));

        const packResult = simulatePacking(
            { l: carData.trunkDims[0], w: carData.trunkDims[1], h: carData.trunkDims[2] },
            bagInputs
        );

        setResult(packResult);
        setIsOptimizing(false);
        setShowResults(true);
    };

    const handleDownload = () => {
        if (!result) return;
        const report = `PackAssist Report - ${car}\n` +
            `----------------------------------\n` +
            `Space Utilization: ${Math.round(result.utilization * 100)}%\n` +
            `Total Placed: ${result.placed.length}\n` +
            `Total Unplaced: ${result.unplaced.length}\n\n` +
            `ITEMS PLACED:\n` +
            result.placed.map((b, i) => `${i + 1}. ${b.type} (${b.size})`).join('\n') +
            (result.unplaced.length > 0 ? `\n\nITEMS UNPLACED:\n` + result.unplaced.map((b, i) => `${i + 1}. ${b.type} - ${b.reason}`).join('\n') : '');

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PackAssist_Report_${car.replace(/\s+/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const toggleSection = (s: string) =>
        setExpandedSections(prev => ({ ...prev, [s]: !prev[s] }));

    const styles = getStyles(theme, isDark, isMobile);

    if (isOptimizing) return (
        <LoadingAnimation
            totalBags={selectedBags.length}
            realTimeCount={0}
            realTimeMessage="Running optimization…"
        />
    );

    // ---- Results View ----
    if (showResults && result) {
        return (
            <div style={styles.container}>
                <Header />
                <div style={styles.contentScrollable}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <button style={styles.backButton} onClick={() => setShowResults(false)}>
                            <ChevronLeft size={20} /> Back to Config
                        </button>
                        <button style={styles.downloadReportBtn} onClick={handleDownload}>
                            <Download size={18} /> Download Report
                        </button>
                    </div>
                    <h1 style={styles.title}>Optimization Results</h1>

                    <div style={styles.resultsLayout}>
                        {/* 3D Viewer */}
                        <div style={isFullscreen ? styles.visualizationCardFullscreen : styles.visualizationCard}>
                            <Canvas
                                shadows
                                camera={{ position: [carData.trunkDims[0] * 2.5, carData.trunkDims[2] * 2.5, carData.trunkDims[1] * 2.5], fov: 45 }}
                                style={{ background: '#0d1117', width: '100%', height: '100%' }}
                            >
                                <ambientLight intensity={0.6} />
                                <pointLight position={[2, 3, 2]} intensity={1.5} castShadow />
                                <pointLight position={[-2, 2, -2]} intensity={0.6} />
                                <OrbitControls makeDefault enablePan enableZoom />
                                <GridFloor size={Math.max(...carData.trunkDims)} />

                                {/* Trunk outline */}
                                <TrunkWireframe dims={trunkDims} />

                                {/* Placed bag boxes */}
                                {result.placed.map(bag => (
                                    <BagBox
                                        key={bag.id}
                                        dims={bag.dims}
                                        position={bag.position}
                                        color={bag.color}
                                    />
                                ))}
                            </Canvas>

                            {/* Fullscreen Button */}
                            <button
                                style={styles.fullscreenBtn}
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                            >
                                {isFullscreen ? <X size={20} /> : <Maximize size={20} />}
                            </button>

                            {/* Utilization bar overlay */}
                            <div style={styles.utilOverlay}>
                                <span style={styles.utilLabel}>Space Used: {Math.round(result.utilization * 100)}%</span>
                                <div style={styles.utilBarBg}>
                                    <div style={{ ...styles.utilBarFill, width: `${result.utilization * 100}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* Stats panel */}
                        <div style={styles.statsCard}>
                            <h3 style={styles.cardTitle}>Packing Summary</h3>

                            {/* Color legend */}
                            {result.placed.length > 0 && (
                                <div style={styles.legendWrap}>
                                    {result.placed.map((bag, i) => (
                                        <div key={i} style={styles.legendItem}>
                                            <div style={{ ...styles.legendDot, background: bag.color }} />
                                            <span style={styles.legendText}>{bag.type} ({bag.size})</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Accordion sections */}
                            {[
                                { key: 'placed', label: `Placed (${result.placed.length})`, color: theme.success, items: result.placed.map(b => `${b.type} (${b.size})`) },
                                { key: 'unplaced', label: `Unplaced (${result.unplaced.length})`, color: theme.error, items: result.unplaced.map(b => `${b.type} – ${b.reason}`) },
                            ].map(sec => (
                                <div key={sec.key} style={styles.summaryItem}>
                                    <div style={styles.statRow} onClick={() => toggleSection(sec.key)}>
                                        <span style={{ color: sec.color }}>{sec.label}</span>
                                        <button style={styles.expandBtn}>
                                            {expandedSections[sec.key] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                    {expandedSections[sec.key] && (
                                        <div style={styles.expandedList}>
                                            {sec.items.map((item, i) => (
                                                <div key={i} style={styles.listItem}>{item}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <button style={styles.modifyBtn} onClick={() => setShowResults(false)}>
                                Modify Items
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ---- Config View ----
    return (
        <div style={styles.container}>
            <Header />
            <div style={styles.content}>
                <div style={styles.pageHeader}>
                    <button style={styles.backButton} onClick={() => window.history.back()}>
                        <ChevronLeft size={20} /> Back to Vehicles
                    </button>
                    <div>
                        <h1 style={styles.title}>Pack your {car}</h1>
                        <p style={styles.subtitle}>
                            Trunk: {carData.dimensions} · {carData.volume}
                        </p>
                    </div>
                </div>

                <div style={styles.mainGrid}>
                    {/* Add Items card */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Add Items</h2>
                        <div style={styles.inputStack}>
                            {/* Bag type selector */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Bag Type</label>
                                <select
                                    style={styles.select}
                                    value={selectedType}
                                    onChange={e => { setSelectedType(e.target.value); setSelectedSize('MEDIUM'); }}
                                >
                                    <option value="Custom Dimensions">Custom Dimensions</option>
                                    {Object.keys(BAGS_DATA).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* Size or custom dims */}
                            {selectedType === 'Custom Dimensions' ? (
                                <div style={styles.dimsRow}>
                                    {(['l', 'b', 'h'] as const).map(d => (
                                        <div key={d} style={styles.dimInputWrapper}>
                                            <label style={styles.label}>{d.toUpperCase()} (cm)</label>
                                            <input
                                                style={styles.input}
                                                type="number"
                                                value={customDims[d]}
                                                onChange={e => setCustomDims({ ...customDims, [d]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Size</label>
                                    <div style={styles.chipGroup}>
                                        {Object.keys(BAGS_DATA[selectedType] ?? {}).map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                style={selectedSize === size ? styles.chipActive : styles.chip}
                                            >
                                                {size}
                                                <span style={styles.chipSub}>
                                                    {BAGS_DATA[selectedType]?.[size]?.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity + Add */}
                            <div style={styles.actionRow}>
                                <div style={styles.qtyPill}>
                                    <button style={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                        <Minus size={16} />
                                    </button>
                                    <span style={styles.qtyValue}>{quantity}</span>
                                    <button style={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button style={styles.addBtn} onClick={handleAdd}>
                                    <Plus size={18} /> Add Item
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Queue card */}
                    <div style={styles.card}>
                        <div style={styles.queueHeader}>
                            <h2 style={styles.cardTitle}>Queue ({selectedBags.length})</h2>
                            {selectedBags.length > 0 && (
                                <button style={styles.clearBtn} onClick={() => setSelectedBags([])}>Clear</button>
                            )}
                        </div>
                        <div style={styles.queueList}>
                            {groupedBags.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <Box size={40} strokeWidth={1} style={{ marginBottom: '12px', opacity: 0.4 }} />
                                    <p style={{ margin: 0, opacity: 0.5 }}>Queue is empty</p>
                                </div>
                            ) : (
                                groupedBags.map((group, i) => (
                                    <div key={i} style={styles.queueItem}>
                                        <div style={styles.queueInfo}>
                                            <span style={styles.queueType}>{group.type}</span>
                                            <span style={styles.queueSize}>
                                                {group.size}
                                                {group.count > 1 && <strong> ×{group.count}</strong>}
                                            </span>
                                        </div>
                                        <button style={styles.removeBtn} onClick={() => removeGroup(group.ids)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer action bar */}
                <div style={styles.footer}>
                    <button
                        style={styles.footerBtn}
                        onClick={() => setSelectedBags([])}
                        disabled={selectedBags.length === 0}
                    >
                        Clear All
                    </button>
                    <button
                        id="optimize-btn"
                        style={selectedBags.length === 0 ? styles.optimizeBtnDisabled : styles.optimizeBtn}
                        onClick={handleOptimize}
                        disabled={selectedBags.length === 0}
                    >
                        <Play size={20} fill="currentColor" /> Optimize
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---- Styles ----
const getStyles = (theme: any, isDark: boolean, isMobile: boolean): Record<string, React.CSSProperties> => ({
    container: { minHeight: '100vh', background: isDark ? '#000' : theme.bg, fontFamily: "'Google Sans','Roboto','Inter',sans-serif", display: 'flex', flexDirection: 'column', paddingBottom: '120px' },
    content: { maxWidth: '1200px', width: '100%', margin: '0 auto', padding: isMobile ? '24px 20px' : '40px 24px', flex: 1, display: 'flex', flexDirection: 'column' },
    contentScrollable: { maxWidth: '1400px', width: '100%', margin: '0 auto', padding: isMobile ? '16px' : '32px 24px', display: 'flex', flexDirection: 'column' },
    pageHeader: { marginBottom: '40px' },
    title: { fontSize: isMobile ? '24px' : '32px', fontWeight: '400', color: theme.text, margin: '0 0 8px 0' },
    subtitle: { fontSize: '15px', color: theme.textSecondary, margin: 0 },
    mainGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', flex: 1 },
    card: { background: theme.cardBg, borderRadius: '24px', padding: isMobile ? '24px' : '32px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' },
    cardTitle: { fontSize: '20px', fontWeight: '500', color: theme.text, margin: '0 0 24px 0' },
    inputStack: { display: 'flex', flexDirection: 'column', gap: '24px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '12px', fontWeight: '500', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' },
    select: { width: '100%', height: '56px', padding: '0 16px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: '16px', outline: 'none' },
    input: { width: '100%', height: '56px', padding: '0 16px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: '16px', outline: 'none', boxSizing: 'border-box' },
    dimsRow: { display: 'flex', gap: '12px' },
    dimInputWrapper: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
    chipGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    chip: { padding: '8px 14px', borderRadius: '100px', border: `1px solid ${theme.border}`, background: 'transparent', color: theme.text, fontSize: '13px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
    chipActive: { padding: '8px 14px', borderRadius: '100px', border: `1px solid ${theme.accent}`, background: isDark ? 'rgba(138,180,248,0.2)' : '#e8f0fe', color: theme.accent, fontSize: '13px', fontWeight: '500', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
    chipSub: { fontSize: '10px', opacity: 0.7 },
    actionRow: { display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' },
    qtyPill: { display: 'flex', alignItems: 'center', gap: '16px', background: isDark ? '#202124' : '#f1f3f4', padding: '6px', borderRadius: '100px', border: `1px solid ${theme.border}`, width: 'fit-content' },
    qtyBtn: { width: '36px', height: '36px', borderRadius: '50%', background: theme.accent, border: 'none', color: isDark ? '#202124' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    qtyValue: { color: theme.text, fontSize: '18px', fontWeight: '600', minWidth: '20px', textAlign: 'center' },
    addBtn: { flex: 1, height: '48px', background: theme.accent, color: isDark ? '#202124' : '#fff', border: 'none', borderRadius: '100px', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' },
    queueHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    clearBtn: { background: 'transparent', border: 'none', color: theme.error, fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
    queueList: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' },
    queueItem: { display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '16px', background: isDark ? '#1a1a1c' : theme.bg, gap: '16px' },
    queueInfo: { flex: 1 },
    queueType: { display: 'block', fontSize: '14px', fontWeight: '500', color: theme.text },
    queueSize: { fontSize: '12px', color: theme.textSecondary },
    removeBtn: { background: 'transparent', border: 'none', color: theme.textSecondary, cursor: 'pointer', padding: '8px' },
    emptyState: { textAlign: 'center', padding: '40px 0', color: theme.textSecondary },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, padding: isMobile ? '16px 20px' : '20px 40px', background: isDark ? '#000' : theme.cardBg, display: 'flex', gap: '24px', justifyContent: 'center', borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : `1px solid ${theme.border}`, zIndex: 100 },
    footerBtn: { height: '48px', padding: '0 32px', borderRadius: '100px', border: `1px solid ${theme.border}`, background: 'transparent', color: theme.text, fontSize: '15px', fontWeight: '500', cursor: 'pointer' },
    optimizeBtn: { height: '48px', padding: '0 48px', borderRadius: '100px', border: 'none', background: theme.accent, color: isDark ? '#202124' : '#fff', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer' },
    optimizeBtnDisabled: { height: '48px', padding: '0 48px', borderRadius: '100px', border: 'none', background: theme.border, color: theme.textSecondary, fontSize: '15px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' },
    backButton: { background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}`, borderRadius: '100px', padding: '8px 20px', color: theme.text, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', margin: 0, width: 'fit-content' },
    downloadReportBtn: { background: theme.accent, border: 'none', borderRadius: '100px', padding: '8px 24px', color: isDark ? '#202124' : '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' },
    resultsLayout: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: isMobile ? '24px' : '32px' },
    visualizationCard: { height: isMobile ? '400px' : '580px', borderRadius: '24px', overflow: 'hidden', position: 'relative', border: `1px solid ${theme.border}` },
    visualizationCardFullscreen: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: '#0d1117' },
    fullscreenBtn: { position: 'absolute', top: '16px', right: '16px', borderRadius: '50%', width: '44px', height: '44px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)', zIndex: 100 },
    utilOverlay: { position: 'absolute', bottom: '16px', left: '16px', right: '16px', background: 'rgba(0,0,0,0.7)', borderRadius: '12px', padding: '10px 16px', backdropFilter: 'blur(8px)', zIndex: 90 },
    utilLabel: { fontSize: '13px', color: '#fff', display: 'block', marginBottom: '6px' },
    utilBarBg: { height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px', overflow: 'hidden' },
    utilBarFill: { height: '100%', background: theme.accent, borderRadius: '3px', transition: 'width 0.8s ease' },
    statsCard: { padding: '32px', background: theme.cardBg, borderRadius: '24px', border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: '0' },
    legendWrap: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px', maxHeight: '160px', overflowY: 'auto' },
    legendItem: { display: 'flex', alignItems: 'center', gap: '8px' },
    legendDot: { width: '12px', height: '12px', borderRadius: '3px', flexShrink: 0 },
    legendText: { fontSize: '12px', color: theme.textSecondary },
    summaryItem: { marginBottom: '16px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '16px' },
    statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '4px 0' },
    expandBtn: { background: 'transparent', border: 'none', color: theme.textSecondary, cursor: 'pointer', padding: 0 },
    expandedList: { marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' },
    listItem: { fontSize: '13px', color: theme.text, padding: '8px 12px', background: isDark ? '#1a1a1c' : theme.bg, borderRadius: '8px' },
    modifyBtn: { width: '100%', height: '48px', marginTop: '24px', borderRadius: '100px', background: theme.accent, border: 'none', color: isDark ? '#202124' : '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
});
