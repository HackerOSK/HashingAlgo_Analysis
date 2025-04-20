import { useState, useEffect, useRef } from "react";
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

import { strToUTF8Array } from '../utils/Helpers';

// Add this helper component before the main Sha256 component
const BufferDisplay = ({ label, value }) => (
    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                  border border-slate-200 dark:border-slate-700">
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</div>
        <div className="font-mono">{value}</div>
    </div>
);

const Sha256 = () => {
    const [message, setMessage] = useState('');
    const [hash, setHash] = useState('');
    const [bufferA, setBufferA] = useState(0x6a09e667);
    const [bufferB, setBufferB] = useState(0xbb67ae85);
    const [bufferC, setBufferC] = useState(0x3c6ef372);
    const [bufferD, setBufferD] = useState(0xa54ff53a);
    const [bufferE, setBufferE] = useState(0x510e527f);
    const [bufferF, setBufferF] = useState(0x9b05688c);
    const [bufferG, setBufferG] = useState(0x1f83d9ab);
    const [bufferH, setBufferH] = useState(0x5be0cd19);
    const [round, setRound] = useState(1);
    const [constantK, setConstantK] = useState(0x428a2f98);
    const [shift, setShift] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [executionTime, setExecutionTime] = useState(0);
    const [performance, setPerformance] = useState([]);
    const startTime = useRef(null);

    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }

    const performanceData = {
        labels: performance.map((_, index) => `Run ${index + 1}`),
        datasets: [
            {
                label: 'Execution Time (ms)',
                data: performance,
                borderColor: '#00ff00',
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                tension: 0.4
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#64748b'
                }
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
                grid: {
                    color: '#334155'
                },
                ticks: {
                    color: '#64748b'
                }
            },
            x: {
                grid: {
                    color: '#334155'
                },
                ticks: {
                    color: '#64748b'
                }
            }
        }
    };

    function sha256(message) {
        startTime.current = window.performance.now();
        setProcessing(true);
        
        // Initialize variables
        let h0 = 0x6a09e667;
        let h1 = 0xbb67ae85;
        let h2 = 0x3c6ef372;
        let h3 = 0xa54ff53a;
        let h4 = 0x510e527f;
        let h5 = 0x9b05688c;
        let h6 = 0x1f83d9ab;
        let h7 = 0x5be0cd19;

        // Pre-processing
        const bytes = strToUTF8Array(message);
        const originalBitsLength = bytes.length * 8;
        
        bytes.push(0x80);
        while (bytes.length % 64 !== 56) {
            bytes.push(0);
        }
        
        for (let i = 7; i >= 0; i--) {
            bytes.push((originalBitsLength >>> (i * 8)) & 0xff);
        }

        let blockIndex = 0;
        let roundIndex = 0;
        let a, b, c, d, e, f, g, h;
        let w;

        const processRound = () => {
            if (blockIndex * 64 >= bytes.length) {
                clearInterval(interval);
                setProcessing(false);
                const endTime = window.performance.now();
                const timeElapsed = endTime - startTime.current;
                setExecutionTime(timeElapsed);
                setPerformance(prev => [...prev, timeElapsed]);
                setHash(
                    [h0, h1, h2, h3, h4, h5, h6, h7]
                        .map(h => h.toString(16).padStart(8, '0'))
                        .join('')
                );
                return;
            }

            // Initialize w array for new block
            if (roundIndex === 0) {
                const chunk = bytes.slice(blockIndex * 64, (blockIndex + 1) * 64);
                w = new Array(64);
                
                for (let j = 0; j < 16; j++) {
                    w[j] = (chunk[j * 4] << 24) | (chunk[j * 4 + 1] << 16) |
                           (chunk[j * 4 + 2] << 8) | (chunk[j * 4 + 3]);
                }

                for (let j = 16; j < 64; j++) {
                    const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
                    const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
                    w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
                }

                a = h0;
                b = h1;
                c = h2;
                d = h3;
                e = h4;
                f = h5;
                g = h6;
                h = h7;
            }

            // Process current round
            const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + K[roundIndex] + w[roundIndex]) >>> 0;
            const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) >>> 0;

            h = g;
            g = f;
            f = e;
            e = (d + temp1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) >>> 0;

            // Update UI state
            setBufferA(a);
            setBufferB(b);
            setBufferC(c);
            setBufferD(d);
            setBufferE(e);
            setBufferF(f);
            setBufferG(g);
            setBufferH(h);
            setConstantK(K[roundIndex]);
            setRound(Math.floor(roundIndex / 16) + 1);

            roundIndex++;

            // When block is complete
            if (roundIndex === 64) {
                h0 = (h0 + a) >>> 0;
                h1 = (h1 + b) >>> 0;
                h2 = (h2 + c) >>> 0;
                h3 = (h3 + d) >>> 0;
                h4 = (h4 + e) >>> 0;
                h5 = (h5 + f) >>> 0;
                h6 = (h6 + g) >>> 0;
                h7 = (h7 + h) >>> 0;
                
                blockIndex++;
                roundIndex = 0;
            }
        };

        const interval = setInterval(processRound, 10);

        // Return initial state
        return [h0, h1, h2, h3, h4, h5, h6, h7]
            .map(h => h.toString(16).padStart(8, '0'))
            .join('');
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    SHA-256 Hash Generator
                </h1>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Column - Input and Results */}
                    <div className="col-span-12 lg:col-span-7 space-y-6">
                        {/* Input Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Input</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Message</label>
                                    <div className="flex gap-3">
                                        <input 
                                            type="text"
                                            placeholder="Enter your message..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 
                                                     dark:border-slate-700 dark:bg-slate-900 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button 
                                            onClick={() => sha256(message)}
                                            disabled={processing}
                                            className={`px-6 py-2 rounded-lg bg-blue-600 text-white font-medium
                                                      hover:bg-blue-700 transition-colors duration-200
                                                      disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {processing ? 'Processing...' : 'Generate Hash'}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Hash Result</label>
                                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                                  border border-slate-200 dark:border-slate-700 
                                                  font-mono text-sm break-all min-h-[3rem]">
                                        {hash || 'Hash will appear here...'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buffer States */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Buffer States</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <BufferDisplay label="Buffer A" value={bufferA.toString(16)} />
                                <BufferDisplay label="Buffer B" value={bufferB.toString(16)} />
                                <BufferDisplay label="Buffer C" value={bufferC.toString(16)} />
                                <BufferDisplay label="Buffer D" value={bufferD.toString(16)} />
                                <BufferDisplay label="Buffer E" value={bufferE.toString(16)} />
                                <BufferDisplay label="Buffer F" value={bufferF.toString(16)} />
                                <BufferDisplay label="Buffer G" value={bufferG.toString(16)} />
                                <BufferDisplay label="Buffer H" value={bufferH.toString(16)} />
                            </div>
                        </div>

                        {/* Round Information */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Round Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Round</div>
                                    <div className="font-mono">{round}/64</div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Constant K</div>
                                    <div className="font-mono">{constantK.toString(16)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Performance */}
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

export default Sha256;