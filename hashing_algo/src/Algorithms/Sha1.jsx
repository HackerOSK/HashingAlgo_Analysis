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

const SHA1 = () => {
    const [message, setMessage] = useState('');
    const [hash, setHash] = useState('');
    const [processing, setProcessing] = useState(false);
    const [round, setRound] = useState(0);
    const [executionTime, setExecutionTime] = useState(0);
    const [bufferA, setBufferA] = useState('67452301');
    const [bufferB, setBufferB] = useState('EFCDAB89');
    const [bufferC, setBufferC] = useState('98BADCFE');
    const [bufferD, setBufferD] = useState('10325476');
    const [bufferE, setBufferE] = useState('C3D2E1F0');
    const [constantK, setConstantK] = useState('5A827999');
    const [performanceData, setPerformanceData] = useState({
        labels: [],
        datasets: [{
            label: 'Execution Time (ms)',
            data: [],
            borderColor: 'rgb(59, 130, 246)',
            tension: 0.1
        }]
    });

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

    const sha1 = async (message) => {
        setProcessing(true);
        const startTime = performance.now();

        // Initialize variables
        let h0 = 0x67452301;
        let h1 = 0xEFCDAB89;
        let h2 = 0x98BADCFE;
        let h3 = 0x10325476;
        let h4 = 0xC3D2E1F0;

        // Pre-processing
        const bytes = strToUTF8Array(message);
        const originalBitsLength = bytes.length * 8;
        
        bytes.push(0x80);
        while (bytes.length % 64 !== 56) {
            bytes.push(0);
        }
        
        const lenHigh = Math.floor(originalBitsLength / Math.pow(2, 32));
        const lenLow = originalBitsLength & 0xFFFFFFFF;
        
        for (let i = 3; i >= 0; i--) {
            bytes.push((lenHigh >>> (i * 8)) & 0xFF);
        }
        for (let i = 3; i >= 0; i--) {
            bytes.push((lenLow >>> (i * 8)) & 0xFF);
        }

        // Process message
        for (let i = 0; i < bytes.length; i += 64) {
            const w = new Array(80);
            
            for (let j = 0; j < 16; j++) {
                w[j] = (bytes[i + j*4] << 24) | (bytes[i + j*4 + 1] << 16) | 
                       (bytes[i + j*4 + 2] << 8) | bytes[i + j*4 + 3];
            }
            
            for (let j = 16; j < 80; j++) {
                w[j] = leftRotate(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
            }
            
            let a = h0;
            let b = h1;
            let c = h2;
            let d = h3;
            let e = h4;
            
            for (let j = 0; j < 80; j++) {
                let f, k;
                
                if (j < 20) {
                    f = (b & c) | ((~b) & d);
                    k = 0x5A827999;
                } else if (j < 40) {
                    f = b ^ c ^ d;
                    k = 0x6ED9EBA1;
                } else if (j < 60) {
                    f = (b & c) | (b & d) | (c & d);
                    k = 0x8F1BBCDC;
                } else {
                    f = b ^ c ^ d;
                    k = 0xCA62C1D6;
                }
                
                const temp = (leftRotate(a, 5) + f + e + k + w[j]) >>> 0;
                e = d;
                d = c;
                c = leftRotate(b, 30);
                b = a;
                a = temp;

                // Update UI state
                setBufferA(a.toString(16));
                setBufferB(b.toString(16));
                setBufferC(c.toString(16));
                setBufferD(d.toString(16));
                setBufferE(e.toString(16));
                setConstantK(k.toString(16));
                setRound(Math.floor(j / 20) + 1);

                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            h0 = (h0 + a) >>> 0;
            h1 = (h1 + b) >>> 0;
            h2 = (h2 + c) >>> 0;
            h3 = (h3 + d) >>> 0;
            h4 = (h4 + e) >>> 0;
        }

        const finalHash = wordToHex(h0) + wordToHex(h1) + wordToHex(h2) + 
                         wordToHex(h3) + wordToHex(h4);
        
        const endTime = performance.now();
        const timeElapsed = endTime - startTime;
        
        setHash(finalHash);
        setExecutionTime(timeElapsed);
        setPerformanceData(prev => ({
            labels: [...prev.labels, new Date().toLocaleTimeString()],
            datasets: [{
                ...prev.datasets[0],
                data: [...prev.datasets[0].data, timeElapsed]
            }]
        }));
        setProcessing(false);
        
        return finalHash;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    SHA-1 Hash Generator
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
                                            onClick={() => sha1(message)}
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
                                    <div className="font-mono">{bufferA}</div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Buffer B</div>
                                    <div className="font-mono">{bufferB}</div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Buffer C</div>
                                    <div className="font-mono">{bufferC}</div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Buffer D</div>
                                    <div className="font-mono">{bufferD}</div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Buffer E</div>
                                    <div className="font-mono">{bufferE}</div>
                                </div>
                            </div>
                        </div>

                        {/* Round Information */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Round Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Round</div>
                                    <div className="font-mono">{round}/4</div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 
                                              border border-slate-200 dark:border-slate-700">
                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Constant K</div>
                                    <div className="font-mono">{constantK}</div>
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

export default SHA1;
