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

import { strToUTF8Array, wordToHex, leftRotate } from '../utils/Helpers';

const MD5 = () => {
    const [message, setMessage] = useState('');
    const [hash, setHash] = useState('');
    const [bufferA, setBufferA] = useState(0x67452301);
    const [bufferB, setBufferB] = useState(0xefcdab89);
    const [bufferC, setBufferC] = useState(0x98badcfe);
    const [bufferD, setBufferD] = useState(0x10325476);
    const [round, setRound] = useState(1);
    const [constantK, setConstantK] = useState(0xd76aa478);
    const [shift, setShift] = useState(7);
    const [processing, setProcessing] = useState(false);
    const [executionTime, setExecutionTime] = useState(0);
    const [performance, setPerformance] = useState([]);
    const startTime = useRef(null);
    

    
    
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

    function md5(message) {
        startTime.current = window.performance.now();
        setProcessing(true);
        // Initialize constants
        const s = [
            7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
            5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
            4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
            6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
        ];
    
        const K = [
            0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
            0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
            0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
            0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
            0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
            0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
            0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
            0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
            0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
            0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
            0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
            0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
            0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
            0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
            0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
            0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
        ];
    
        // Initialize variables
        let a0 = 0x67452301;
        let b0 = 0xefcdab89;
        let c0 = 0x98badcfe;
        let d0 = 0x10325476;
    
        // Pre-processing: add padding
        const bytes = strToUTF8Array(message);
        const originalBitsLength = bytes.length * 8;
        
        // Append single '1' bit
        bytes.push(0x80);
        
        // Append padding zeros to make total 448 bits mod 512
        while (bytes.length % 64 !== 56) {
            bytes.push(0);
        }
        
        // Append original length as 64-bit little-endian integer
        for (let i = 0; i < 8; i++) {
            bytes.push((originalBitsLength & (0xFF << (i * 8))) >>> (i * 8));
        }

        // Process message in 16-word blocks (64 bytes)
        let blockIndex = 0;
        let roundIndex = 0;
        let A = a0, B = b0, C = c0, D = d0;
        let M;
        

        const processRound = () => {
            if (blockIndex * 64 >= bytes.length) {
                clearInterval(interval);
                setProcessing(false);
                const endTime = window.performance.now();
                const timeElapsed = endTime - startTime.current;
                setExecutionTime(timeElapsed);
                setPerformance(prev => [...prev, timeElapsed]);
                // Set final hash result
                setHash(wordToHex(a0) + wordToHex(b0) + wordToHex(c0) + wordToHex(d0));
                return;
            }

            // Initialize M for new block
            if (roundIndex === 0) {
                M = new Array(16);
                for (let j = 0; j < 16; j++) {
                    const offset = blockIndex * 64 + j * 4;
                    M[j] = bytes[offset] | (bytes[offset + 1] << 8) | 
                           (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24);
                }
                A = a0; B = b0; C = c0; D = d0;
            }

            let F, g;
            
            if (roundIndex < 16) {
                F = (B & C) | ((~B) & D);
                g = roundIndex;
                
            } else if (roundIndex < 32) {
                F = (D & B) | ((~D) & C);
                g = (5 * roundIndex + 1) % 16;
                
            } else if (roundIndex < 48) {
                F = B ^ C ^ D;
                g = (3 * roundIndex + 5) % 16;
                
            } else {
                F = C ^ (B | (~D));
                g = (7 * roundIndex) % 16;
                
            }

            F = (F + A + K[roundIndex] + M[g]) >>> 0;
            A = D;
            D = C;
            C = B;
            B = (B + leftRotate(F, s[roundIndex])) >>> 0;

            // Update UI state
            setBufferA(wordToHex(A));
            setBufferB(wordToHex(B));
            setBufferC(wordToHex(C));
            setBufferD(wordToHex(D));
            setConstantK(K[roundIndex]);
            setShift(s[roundIndex]);


            roundIndex++;
            setRound(Math.floor(roundIndex / 16));

            // When block is complete
            if (roundIndex === 64) {
                // Add to result
                a0 = (a0 + A) >>> 0;
                b0 = (b0 + B) >>> 0;
                c0 = (c0 + C) >>> 0;
                d0 = (d0 + D) >>> 0;
                
                blockIndex++;
                roundIndex = 0;
            }
        };

        const interval = setInterval(processRound, 10);

        // Return immediately with initial state
        return wordToHex(a0) + wordToHex(b0) + wordToHex(c0) + wordToHex(d0);
    }

    function handleClick() {
        let hash = md5(message);
        setHash(hash);
        return 1;
    }

    function handleChange(e) {
        setMessage(e.target.value);
        // let hash = md5(message);
        // setHash(hash);
        // return 1;
    }


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    MD5 Hash Generator
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
                                            onClick={() => md5(message)}
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
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Buffer A</div>
                                    <div className="font-mono">{bufferA.toString(16).padStart(8, '0')}</div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Buffer B</div>
                                    <div className="font-mono">{bufferB.toString(16).padStart(8, '0')}</div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Buffer C</div>
                                    <div className="font-mono">{bufferC.toString(16).padStart(8, '0')}</div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Buffer D</div>
                                    <div className="font-mono">{bufferD.toString(16).padStart(8, '0')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Round Information */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Round Information</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Round</div>
                                    <div className="font-mono">{round}/4</div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Constant K</div>
                                    <div className="font-mono">{constantK.toString(16).padStart(8, '0')}</div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Shift Amount</div>
                                    <div className="font-mono">{shift}</div>
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

export default MD5;
