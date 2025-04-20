import { useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Helper component for displaying buffers and parameters
const BufferDisplay = ({ label, value }) => (
    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                  border border-slate-200 dark:border-slate-700">
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</div>
        <div className="font-mono break-all">{value}</div>
    </div>
);

const Scrypt = () => {
    const [message, setMessage] = useState('');
    const [salt, setSalt] = useState('');
    const [hash, setHash] = useState('');
    const [processing, setProcessing] = useState(false);
    const [executionTime, setExecutionTime] = useState(0);
    const [performance, setPerformance] = useState([]);
    const [memoryUsed, setMemoryUsed] = useState(0);
    const [currentBlock, setCurrentBlock] = useState(0);
    const [currentPhase, setCurrentPhase] = useState('');
    const startTime = useRef(null);

    // Scrypt parameters
    const [N, setN] = useState(16); // Reduced for demo
    const [r, setR] = useState(8);
    const [p, setP] = useState(1);
    const [dkLen, setDkLen] = useState(32);

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        return new Uint8Array(hashBuffer);
    }

    async function hmacSha256(key, message) {
        const keyBuffer = new TextEncoder().encode(key);
        const messageBuffer = new TextEncoder().encode(message);
        
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        
        const signature = await crypto.subtle.sign(
            'HMAC',
            cryptoKey,
            messageBuffer
        );
        
        return new Uint8Array(signature);
    }

    async function pbkdf2(password, salt, iterations, keylen) {
        const result = new Uint8Array(keylen);
        const block = 1;
        const passwordBuffer = new TextEncoder().encode(password);
        const saltBuffer = new TextEncoder().encode(salt);

        for (let i = 0; i < keylen; i += 32) {
            const blockData = new Uint8Array([
                ...saltBuffer,
                (block >> 24) & 0xff,
                (block >> 16) & 0xff,
                (block >> 8) & 0xff,
                block & 0xff
            ]);

            let u = await hmacSha256(passwordBuffer, blockData);
            let t = u;

            for (let j = 1; j < iterations; j++) {
                u = await hmacSha256(passwordBuffer, u);
                for (let k = 0; k < t.length; k++) {
                    t[k] ^= u[k];
                }
            }

            result.set(t.slice(0, Math.min(32, keylen - i)), i);
        }

        return result;
    }

    function salsa20_8(B) {
        const x = new Uint32Array(16);
        const output = new Uint32Array(16);

        for (let i = 0; i < 16; i++) {
            x[i] = B[i];
        }

        for (let i = 8; i > 0; i -= 2) {
            x[ 4] ^= (x[ 0] + x[12]) << 7  | (x[ 0] + x[12]) >>> 25;
            x[ 8] ^= (x[ 4] + x[ 0]) << 9  | (x[ 4] + x[ 0]) >>> 23;
            x[12] ^= (x[ 8] + x[ 4]) << 13 | (x[ 8] + x[ 4]) >>> 19;
            x[ 0] ^= (x[12] + x[ 8]) << 18 | (x[12] + x[ 8]) >>> 14;

            x[ 9] ^= (x[ 5] + x[ 1]) << 7  | (x[ 5] + x[ 1]) >>> 25;
            x[13] ^= (x[ 9] + x[ 5]) << 9  | (x[ 9] + x[ 5]) >>> 23;
            x[ 1] ^= (x[13] + x[ 9]) << 13 | (x[13] + x[ 9]) >>> 19;
            x[ 5] ^= (x[ 1] + x[13]) << 18 | (x[ 1] + x[13]) >>> 14;

            x[14] ^= (x[10] + x[ 6]) << 7  | (x[10] + x[ 6]) >>> 25;
            x[ 2] ^= (x[14] + x[10]) << 9  | (x[14] + x[10]) >>> 23;
            x[ 6] ^= (x[ 2] + x[14]) << 13 | (x[ 2] + x[14]) >>> 19;
            x[10] ^= (x[ 6] + x[ 2]) << 18 | (x[ 6] + x[ 2]) >>> 14;

            x[ 3] ^= (x[15] + x[11]) << 7  | (x[15] + x[11]) >>> 25;
            x[ 7] ^= (x[ 3] + x[15]) << 9  | (x[ 3] + x[15]) >>> 23;
            x[11] ^= (x[ 7] + x[ 3]) << 13 | (x[ 7] + x[ 3]) >>> 19;
            x[15] ^= (x[11] + x[ 7]) << 18 | (x[11] + x[ 7]) >>> 14;
        }

        for (let i = 0; i < 16; i++) {
            output[i] = x[i] + B[i];
        }

        return output;
    }

    function blockMix(B, r) {
        const X = new Uint32Array(16);
        const Y = new Uint32Array(B.length);
        
        let i;
        
        // Copy last block to X
        for (i = 0; i < 16; i++) {
            X[i] = B[B.length - 16 + i];
        }
        
        // Iterate through the blocks
        for (i = 0; i < B.length; i += 16) {
            // XOR block with X
            for (let j = 0; j < 16; j++) {
                X[j] ^= B[i + j];
            }
            
            // Salsa
            const result = salsa20_8(X);
            
            // Copy result to Y
            for (let j = 0; j < 16; j++) {
                Y[i + j] = result[j];
            }
        }
        
        return Y;
    }

    async function scrypt(password, salt, N, r, p, dkLen) {
        try {
            startTime.current = window.performance.now();
            setProcessing(true);
            setCurrentPhase('Initializing PBKDF2');

            // Initial PBKDF2
            const B = await pbkdf2(password, salt, 1, p * 128 * r);
            const V = new Array(N);
            const XY = new Uint32Array(64 * r);
            
            setCurrentPhase('ROMix');
            setMemoryUsed(N * 128 * r);

            // Initialize X
            for (let i = 0; i < 32 * r; i++) {
                XY[i] = B[i];
            }

            // ROMix
            for (let i = 0; i < N; i++) {
                V[i] = XY.slice(0);
                XY.set(blockMix(XY, r));
                setCurrentBlock(i);
                
                if (i % 100 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }

            // Final mixing
            for (let i = 0; i < N; i++) {
                const j = XY[16 * (2 * r - 1)] & (N - 1);
                for (let k = 0; k < XY.length; k++) {
                    XY[k] ^= V[j][k];
                }
                XY.set(blockMix(XY, r));
            }

            setCurrentPhase('Final PBKDF2');
            
            // Final PBKDF2
            // Convert XY to string for PBKDF2
            const xyArray = Array.from(XY);
            const xyString = String.fromCharCode.apply(null, xyArray);
            const result = await pbkdf2(password, xyString, 1, dkLen);
            
            const endTime = window.performance.now();
            const timeElapsed = endTime - startTime.current;
            
            setExecutionTime(timeElapsed);
            setPerformance(prev => [...prev, timeElapsed]);
            // Convert result to hex string
            const hashArray = Array.from(result);
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            setHash(hashHex);
            setProcessing(false);
            setCurrentPhase('Complete');
            
            return result;
        } catch (error) {
            console.error('Scrypt error:', error);
            setProcessing(false);
            setCurrentPhase('Error');
            throw error;
        }
    }

    // Chart configuration
    const performanceData = {
        labels: performance.map((_, index) => `Run ${index + 1}`),
        datasets: [{
            label: 'Execution Time (ms)',
            data: performance,
            borderColor: '#00ff00',
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
            tension: 0.4
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#64748b' }
            },
            title: {
                display: true,
                text: 'Hash Generation Time',
                color: '#64748b'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#334155' },
                ticks: { color: '#64748b' }
            },
            x: {
                grid: { color: '#334155' },
                ticks: { color: '#64748b' }
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Scrypt Password-Based Key Derivation
                </h1>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Column - Input and Parameters */}
                    <div className="col-span-12 lg:col-span-7 space-y-6">
                        {/* Input Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Input</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Password</label>
                                    <input 
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 
                                                 dark:border-slate-700 dark:bg-slate-900"
                                        placeholder="Enter password..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Salt</label>
                                    <input 
                                        type="text"
                                        value={salt}
                                        onChange={(e) => setSalt(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 
                                                 dark:border-slate-700 dark:bg-slate-900"
                                        placeholder="Enter salt..."
                                    />
                                </div>
                                <button 
                                    onClick={() => scrypt(message, salt, N, r, p, dkLen)}
                                    disabled={processing}
                                    className="w-full px-6 py-2 rounded-lg bg-blue-600 text-white font-medium
                                             hover:bg-blue-700 transition-colors duration-200
                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Processing...' : 'Generate Key'}
                                </button>
                            </div>
                        </div>

                        {/* Derived Key Result */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Derived Key</h2>
                            <div className="font-mono text-sm break-all bg-slate-50 dark:bg-slate-900 
                                          p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                {hash || 'Derived key will appear here...'}
                            </div>
                        </div>

                        {/* Parameters */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Parameters</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <BufferDisplay label="N (CPU/Memory Cost)" value={N} />
                                <BufferDisplay label="r (Block Size)" value={r} />
                                <BufferDisplay label="p (Parallelization)" value={p} />
                                <BufferDisplay label="dkLen (Output Length)" value={dkLen} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Performance and Status */}
                    <div className="col-span-12 lg:col-span-5 space-y-6">
                        {/* Execution Time */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Execution Time</h2>
                            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                          border border-slate-200 dark:border-slate-700">
                                <div className="text-3xl font-mono text-center">
                                    {executionTime.toFixed(2)} <span className="text-sm">ms</span>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Status</h2>
                            <div className="space-y-4">
                                <BufferDisplay label="Current Phase" value={currentPhase} />
                                <BufferDisplay label="Memory Used" value={`${(memoryUsed / 1024).toFixed(2)} KB`} />
                                <BufferDisplay label="Block Progress" value={`${currentBlock}/${N}`} />
                            </div>
                        </div>

                        {/* Performance Graph */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Performance Analysis</h2>
                            <div className="h-[400px]">
                                <Line data={performanceData} options={options} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scrypt;
