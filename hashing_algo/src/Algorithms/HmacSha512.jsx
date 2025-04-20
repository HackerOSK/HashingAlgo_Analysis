import { useState, useEffect } from "react";
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

const HmacSha512 = () => {
    const [message, setMessage] = useState('');
    const [key, setKey] = useState('');
    const [hash, setHash] = useState('');
    const [processing, setProcessing] = useState(false);
    const [executionTime, setExecutionTime] = useState(0);
    const [performance, setPerformance] = useState([]);

    // HMAC-SHA-512 Parameters
    const [blockSize, setBlockSize] = useState(128); // bytes
    const [outputSize, setOutputSize] = useState(64); // bytes
    const [innerPadding, setInnerPadding] = useState('0x36'.repeat(128));
    const [outerPadding, setOuterPadding] = useState('0x5c'.repeat(128));
    const [currentRound, setCurrentRound] = useState(0);
    const [totalRounds, setTotalRounds] = useState(80);

    async function hmacSha512(message, key) {
        try {
            const startTime = window.performance.now();
            setProcessing(true);

            // Simulate rounds for visualization
            for (let i = 0; i < totalRounds; i++) {
                setCurrentRound(i + 1);
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            // Convert message and key to Uint8Array
            const messageBuffer = new TextEncoder().encode(message);
            const keyBuffer = new TextEncoder().encode(key);

            // Import the key
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                keyBuffer,
                {
                    name: 'HMAC',
                    hash: { name: 'SHA-512' }
                },
                false,
                ['sign']
            );

            // Calculate the HMAC
            const signature = await crypto.subtle.sign(
                'HMAC',
                cryptoKey,
                messageBuffer
            );

            // Convert to hex string
            const hashArray = Array.from(new Uint8Array(signature));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const endTime = window.performance.now();
            const timeElapsed = endTime - startTime;

            setExecutionTime(timeElapsed);
            setPerformance(prev => [...prev, timeElapsed]);
            setHash(hashHex);
            setProcessing(false);
            setCurrentRound(0);

            return hashHex;
        } catch (error) {
            console.error('HMAC-SHA-512 error:', error);
            setProcessing(false);
            setCurrentRound(0);
            throw error;
        }
    }

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
                    HMAC-SHA-512 Generator
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
                                    <input 
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 
                                                 dark:border-slate-700 dark:bg-slate-900"
                                        placeholder="Enter message..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Key</label>
                                    <input 
                                        type="text"
                                        value={key}
                                        onChange={(e) => setKey(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 
                                                 dark:border-slate-700 dark:bg-slate-900"
                                        placeholder="Enter key..."
                                    />
                                </div>
                                <button 
                                    onClick={() => hmacSha512(message, key)}
                                    disabled={processing}
                                    className="w-full px-6 py-2 rounded-lg bg-blue-600 text-white font-medium
                                             hover:bg-blue-700 transition-colors duration-200
                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Processing...' : 'Generate HMAC'}
                                </button>
                            </div>
                        </div>

                        {/* Parameters Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Parameters</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <BufferDisplay label="Block Size" value={`${blockSize} bytes`} />
                                <BufferDisplay label="Output Size" value={`${outputSize} bytes`} />
                                <BufferDisplay label="Current Round" value={`${currentRound}/${totalRounds}`} />
                                <BufferDisplay label="Total Rounds" value={totalRounds} />
                            </div>
                        </div>

                        {/* Hash Result */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">HMAC Result</h2>
                            <div className="font-mono text-sm break-all bg-slate-50 dark:bg-slate-900 
                                          p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                {hash || 'HMAC will appear here...'}
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

                    {/* Right Column - Information and Internal State */}
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

                        {/* Internal State */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Internal State</h2>
                            <div className="space-y-4">
                                <BufferDisplay label="Inner Padding (ipad)" 
                                             value={`${innerPadding.substring(0, 32)}...`} />
                                <BufferDisplay label="Outer Padding (opad)" 
                                             value={`${outerPadding.substring(0, 32)}...`} />
                            </div>
                        </div>

                        {/* Algorithm Info */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Algorithm Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">About HMAC-SHA-512</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        HMAC-SHA-512 is a keyed-hash message authentication code that uses the SHA-512 hash function.
                                        It provides a way to verify both the data integrity and authenticity of a message.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Security Features</h3>
                                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400">
                                        <li>512-bit (64-byte) hash value</li>
                                        <li>Cryptographically secure</li>
                                        <li>Resistant to length extension attacks</li>
                                        <li>Widely used in digital signatures and verification</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HmacSha512;
