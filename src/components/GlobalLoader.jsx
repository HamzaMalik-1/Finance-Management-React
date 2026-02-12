import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../store/api/authApi';

const GlobalLoader = () => {
  // Checks if ANY mutation is currently pending
  const isLoading = useSelector((state) => 
    Object.values(state[authApi.reducerPath].mutations).some(
      (mutation) => mutation?.status === 'pending'
    )
  );

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // 🛑 This 'fixed inset-0' and 'z-[9999]' prevents any clicks on the UI below
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-[2px] cursor-wait pointer-events-auto"
        >
          <div className="flex flex-col items-center gap-4">
            {/* Beautiful Animated Spinner */}
            <div className="relative w-16 h-16">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="absolute inset-0 border-4 border-t-indigo-600 border-r-transparent border-b-indigo-600/30 border-l-transparent rounded-full"
              />
              <motion.span
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute inset-2 border-4 border-t-transparent border-r-indigo-400 border-b-transparent border-l-indigo-400/30 rounded-full"
              />
            </div>

            {/* Optional Loading Text */}
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-indigo-600 font-bold text-sm tracking-widest uppercase"
            >
              Processing...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoader;