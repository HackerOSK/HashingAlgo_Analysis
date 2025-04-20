import { useState } from 'react';
import { Line } from 'react-chartjs-2';
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

const AlgorithmComparison = () => {
    const [input, setInput] = useState('');
    const [results, setResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [performanceData, setPerformanceData] = useState({
        labels: [],
        datasets: []
    });

    const algorithms = [
        { name: 'MD5', color: 'rgb(59, 130, 246)' },
        { name: 'SHA-1', color: 'rgb(168, 85, 247)' },
        { name: 'SHA-256', color: 'rgb(34, 197, 94)' },
        { name: 'Scrypt', color: 'rgb(249, 115, 22)' },
        { name: 'HMAC-SHA512', color: 'rgb(239, 68, 68)' }
    ];

    // MD5 implementation
    async function md5(message) {
        function rotateLeft(x, n) {
            return (x << n) | (x >>> (32 - n));
        }

        function toWordArray(str) {
            const bytes = new TextEncoder().encode(str);
            const words = [];
            let i;
            for(i = 0; i < bytes.length; i += 4) {
                words.push(
                    bytes[i] |
                    (bytes[i + 1] << 8) |
                    (bytes[i + 2] << 16) |
                    (bytes[i + 3] << 24)
                );
            }
            return words;
        }

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

        const S = [
            7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
            5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
            4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
            6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
        ];

        let a0 = 0x67452301;
        let b0 = 0xefcdab89;
        let c0 = 0x98badcfe;
        let d0 = 0x10325476;

        // Pre-processing
        const bytes = new TextEncoder().encode(message);
        const padding = new Uint8Array(64 - (bytes.length % 64));
        padding[0] = 0x80;
        
        // Add length in bits
        const bits = bytes.length * 8;
        const bitsArray = new Uint8Array(8);
        for (let i = 0; i < 8; i++) {
            bitsArray[i] = (bits >>> (i * 8)) & 0xff;
        }

        // Combine all arrays
        const data = new Uint8Array(bytes.length + padding.length + 8);
        data.set(bytes);
        data.set(padding, bytes.length);
        data.set(bitsArray, bytes.length + padding.length);

        // Process each 512-bit chunk
        for (let i = 0; i < data.length; i += 64) {
            const chunk = data.slice(i, i + 64);
            const M = new Uint32Array(16);
            for (let j = 0; j < 16; j++) {
                M[j] = chunk[j * 4] | (chunk[j * 4 + 1] << 8) | 
                       (chunk[j * 4 + 2] << 16) | (chunk[j * 4 + 3] << 24);
            }

            let A = a0;
            let B = b0;
            let C = c0;
            let D = d0;

            // Main loop
            for (let i = 0; i < 64; i++) {
                let F, g;
                
                if (i < 16) {
                    F = (B & C) | ((~B) & D);
                    g = i;
                } else if (i < 32) {
                    F = (D & B) | ((~D) & C);
                    g = (5 * i + 1) % 16;
                } else if (i < 48) {
                    F = B ^ C ^ D;
                    g = (3 * i + 5) % 16;
                } else {
                    F = C ^ (B | (~D));
                    g = (7 * i) % 16;
                }

                F = F + A + K[i] + M[g];
                A = D;
                D = C;
                C = B;
                B = B + rotateLeft(F, S[i]);
            }

            a0 = (a0 + A) >>> 0;
            b0 = (b0 + B) >>> 0;
            c0 = (c0 + C) >>> 0;
            d0 = (d0 + D) >>> 0;
        }

        // Convert to hex string
        const result = [a0, b0, c0, d0].map(n => {
            return ('00000000' + n.toString(16)).slice(-8);
        }).join('');

        return result;
    }

    // SHA-1 implementation
    async function sha1(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        console.log(hashArray);
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // SHA-256 implementation
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Scrypt implementation
    async function scrypt(password, salt = 'defaultSalt', N = 16384, r = 8, p = 1, dkLen = 32) {
        const passwordBuffer = new TextEncoder().encode(password);
        const saltBuffer = new TextEncoder().encode(salt);
        
        const importedKey = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );

        const derivedKey = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: saltBuffer,
                iterations: N,
                hash: 'SHA-256'
            },
            importedKey,
            dkLen * 8
        );

        const hashArray = Array.from(new Uint8Array(derivedKey));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // HMAC-SHA512 implementation
    async function hmacSha512(message, key = 'defaultKey') {
        const keyBuffer = new TextEncoder().encode(key);
        const messageBuffer = new TextEncoder().encode(message);

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

        const signature = await crypto.subtle.sign(
            'HMAC',
            cryptoKey,
            messageBuffer
        );

        const hashArray = Array.from(new Uint8Array(signature));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    const generateHash = async (text) => {
        if (!text) return;
        
        setIsProcessing(true);
        const newResults = [];

        for (const algo of algorithms) {
            const startTime = performance.now();
            let hash = '';

            try {
                switch (algo.name) {
                    case 'MD5':
                        hash = await md5(text);
                        break;
                    case 'SHA-1':
                        hash = await sha1(text);
                        break;
                    case 'SHA-256':
                        hash = await sha256(text);
                        break;
                    case 'Scrypt':
                        hash = await scrypt(text);
                        break;
                    case 'HMAC-SHA512':
                        hash = await hmacSha512(text);
                        break;
                }

                const endTime = performance.now();
                newResults.push({
                    algorithm: algo.name,
                    hash,
                    time: endTime - startTime,
                    color: algo.color
                });
            } catch (error) {
                console.error(`Error in ${algo.name}:`, error);
                newResults.push({
                    algorithm: algo.name,
                    hash: 'Error generating hash',
                    time: 0,
                    color: algo.color
                });
            }
        }

        setResults(newResults);
        updatePerformanceChart(newResults);
        setIsProcessing(false);
    };

    const updatePerformanceChart = (newResults) => {
        setPerformanceData({
            labels: algorithms.map(algo => algo.name),
            datasets: [{
                label: 'Execution Time (ms)',
                data: newResults.map(result => result.time),
                backgroundColor: algorithms.map(algo => algo.color),
                borderColor: algorithms.map(algo => algo.color),
                borderWidth: 2
            }]
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Algorithm Comparison
                </h1>

                {/* Input Section */}
                <div className="mb-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter text to hash..."
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 
                                     dark:border-slate-700 dark:bg-slate-900"
                        />
                        <button
                            onClick={() => generateHash(input)}
                            disabled={isProcessing}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg 
                                     hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isProcessing ? 'Processing...' : 'Compare'}
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="grid gap-8">
                    {/* Performance Graph */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Performance Comparison</h2>
                        <div className="h-[400px]">
                            <Line data={performanceData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: 'Time (ms)'
                                        }
                                    }
                                }
                            }} />
                        </div>
                    </div>

                    {/* Hash Results */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Hash Results</h2>
                        <div className="space-y-4">
                            {results.map((result, index) => (
                                <div key={index} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                                    <div className="font-semibold text-lg" style={{ color: result.color }}>
                                        {result.algorithm}
                                    </div>
                                    <div className="font-mono text-sm break-all mt-2">
                                        {result.hash}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        Time: {result.time.toFixed(2)}ms
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlgorithmComparison;


