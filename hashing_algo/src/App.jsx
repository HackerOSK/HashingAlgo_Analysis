import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import bg from './assets/bg.webm';

// Algorithm cards data
const algorithms = [
  {
    name: 'Algorithm Comparison',
    description: 'Compare performance and characteristics of different hashing algorithms in real-time.',
    path: '/compare',
    color: 'from-indigo-500 to-blue-500',
    icon: '📊'
  },
  {
    name: 'MD5',
    description: 'A widely used hash function producing a 128-bit hash value. Though cryptographically broken, still used for checksums.',
    path: '/md5',
    color: 'from-blue-500 to-cyan-500',
    icon: '🔐'
  },
  {
    name: 'SHA-1',
    description: 'Produces a 160-bit hash value. Previously widespread but now considered cryptographically broken.',
    path: '/sha1',
    color: 'from-purple-500 to-pink-500',
    icon: '🔒'
  },
  {
    name: 'SHA-256',
    description: 'Part of SHA-2 family, produces 256-bit hash. Widely used in security applications and cryptocurrencies.',
    path: '/sha256',
    color: 'from-green-500 to-emerald-500',
    icon: '🛡️'
  },
  {
    name: 'Scrypt',
    description: 'Password-based key derivation function designed to be computationally intensive with configurable memory usage.',
    path: '/scrypt',
    color: 'from-orange-500 to-yellow-500',
    icon: '🔑'
  },
  {
    name: 'HMAC-SHA512',
    description: 'Keyed-hash message authentication code using SHA-512, providing data integrity and authenticity verification.',
    path: '/hmac-sha512',
    color: 'from-red-500 to-orange-500',
    icon: '🔏'
  }
];

const AlgorithmCard = ({ name, description, path, color, icon, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="w-full max-w-sm cursor-pointer"
      onClick={() => navigate(path)}
    >
      <div className={`relative group h-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 
                      transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 
                        rounded-2xl transition-opacity duration-300`}></div>
        
        <div className="flex items-center mb-4">
          <span className="text-4xl mr-3">{icon}</span>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{name}</h3>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300 mb-6">{description}</p>
        
        <div className="flex justify-between items-center">
          <span className={`bg-gradient-to-r ${color} bg-clip-text text-transparent 
                          font-semibold`}>
            Learn More
          </span>
          <svg className="w-6 h-6 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 
                        dark:group-hover:text-slate-300 transition-colors duration-300" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

function HeroSection() {
  return (
    <div className="relative h-screen w-full overflow-hidden mb-16">
      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src={bg} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-7xl font-bold text-center mb-6"
        >
          Hashing Algorithms
          <span className="block text-4xl md:text-5xl mt-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Visualized & Explained
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-center max-w-3xl mb-8 text-gray-200"
        >
          Explore the inner workings of cryptographic hash functions through 
          interactive visualizations and real-time comparisons.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex gap-4"
        >
          <button 
            onClick={() => document.getElementById('algorithms').scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold 
                     transition-colors duration-300 flex items-center"
          >
            Get Started
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <a 
            href="https://github.com/yourusername/hashing-algo-visualizer" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold 
                     transition-colors duration-300 flex items-center"
          >
            View Source
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </motion.div>
      </div>

      {/* Gradient Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </div>
  );
}

function App() {
  return (
    <div className="bg-slate-900 min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Algorithm Cards Section */}
      <div id="algorithms" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {algorithms.map((algo, index) => (
            <AlgorithmCard key={algo.name} {...algo} index={index} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-20 text-center text-slate-500 pb-8"
      >
        <p>Created for educational purposes • Visualize and learn how hashing algorithms work</p>
      </motion.footer>
    </div>
  );
}

export default App;



