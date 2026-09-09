// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { adminLogin, setAuthToken } from "../../api";

// export default function AdminLogin() {
//   const nav = useNavigate();
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function submit() {
//     if (!username.trim() || !password) return;
//     setLoading(true);
//     try {
//       const res = await adminLogin(username.trim(), password);
//       const access = res.data?.access as string;
//       if (!access) throw new Error("No token");
//       localStorage.setItem("admin_access", access);
//       setAuthToken(access);
//       nav("/admin/dashboard", { replace: true });
//     } catch (e) {
//       alert("Invalid login.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
//       <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-7">
//         <div className="text-xl font-semibold">Admin Login</div>
//         <div className="text-sm text-zinc-400 mt-1">Use your Django admin credentials (staff/superuser).</div>

//         <div className="mt-5 grid gap-3">
//           <input
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             placeholder="Username or Email"
//             className="w-full rounded-xl bg-zinc-950/50 border border-white/10 px-4 py-3 outline-none focus:border-teal-400/60"
//           />
//           <input
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Password"
//             type="password"
//             className="w-full rounded-xl bg-zinc-950/50 border border-white/10 px-4 py-3 outline-none focus:border-teal-400/60"
//           />

//           <button
//             onClick={submit}
//             disabled={loading}
//             className="mt-2 rounded-xl bg-teal-500 text-zinc-950 font-semibold px-4 py-3 hover:bg-teal-400 transition disabled:opacity-50"
//           >
//             {loading ? "Signing in..." : "Login"}
//           </button>

//           <a href="/" className="text-sm text-teal-300 hover:text-teal-200">← Back to site</a>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { adminLogin, setAuthToken } from "../../api";

export default function AdminLogin() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_access");
    if (token) {
      setAuthToken(token);
      nav("/admin/dashboard", { replace: true });
    }
  }, [nav]);

  async function submit() {
    setErr("");
    if (!username.trim() || !password) {
      setErr("MISSING_CREDENTIALS");
      return;
    }
    setLoading(true);
    try {
      const res = await adminLogin(username.trim(), password);
      const access = res.data?.access as string;
      if (!access) throw new Error("No token");
      localStorage.setItem("admin_access", access);
      setAuthToken(access);
      nav("/admin/dashboard", { replace: true });
    } catch (e: any) {
      setErr("ACCESS_DENIED: UNAUTHORIZED");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-mono">
      {/* Background Animated Grid */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/20 blur-[120px] rounded-full animate-pulse delay-700"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[450px]"
      >
        {/* Main Hexagonal Container */}
        <div className="relative backdrop-blur-md bg-black/60 border-y-2 border-cyan-500/50 p-10 shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)] overflow-hidden">
          
          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-fuchsia-400"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-fuchsia-400"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400"></div>

          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <div className="w-16 h-16 border-2 border-cyan-400 flex items-center justify-center rotate-45 bg-cyan-400/10">
                <span className="text-3xl font-bold text-cyan-400 -rotate-45">A</span>
              </div>
            </motion.div>
            <h2 className="text-2xl font-black text-white tracking-[0.2em] uppercase">Admin Console</h2>
            <p className="text-xs text-cyan-500/60 mt-2 tracking-widest uppercase">System Authentication Required</p>
          </div>

          {/* Error Message with Glitch Effect */}
          <AnimatePresence>
            {err && (
              <motion.div 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 10, opacity: 0 }}
                className="mb-6 bg-red-500/10 border-l-4 border-red-500 py-2 px-4 flex items-center gap-3"
              >
                <div className="w-2 h-2 bg-red-500 animate-ping"></div>
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-tighter italic">Error: {err}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Fields */}
          <div className="space-y-6">
            <div className="relative group">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="USER_IDENTITY"
                className="w-full bg-zinc-900/50 border border-zinc-800 px-5 py-4 text-cyan-400 placeholder:text-zinc-700 outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
              />
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-cyan-400 transition-all duration-500 group-focus-within:w-full"></div>
            </div>

            <div className="relative group">
              <input
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="ACCESS_KEY"
                className="w-full bg-zinc-900/50 border border-zinc-800 px-5 py-4 text-fuchsia-400 placeholder:text-zinc-700 outline-none transition-all focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500/50"
              />
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-fuchsia-400 transition-all duration-500 group-focus-within:w-full"></div>
            </div>

            {/* Login Button - Hexagon Style */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(6, 182, 212, 0.6)" }}
              whileTap={{ scale: 0.98 }}
              onClick={submit}
              disabled={loading}
              className="w-full py-4 mt-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-fuchsia-600 text-white font-black tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3 disabled:grayscale"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Authorize access"
              )}
            </motion.button>
          </div>

          {/* Footer Link */}
          <div className="mt-8 flex justify-center">
            <a href="/" className="text-[10px] text-zinc-500 hover:text-cyan-400 transition-colors tracking-widest uppercase flex items-center gap-2">
              <span className="animate-pulse">{"<<"}</span> Return to Public Sector
            </a>
          </div>
        </div>
        
        {/* Floating Scanline Animation */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/20 shadow-[0_0_15px_cyan] animate-scanline z-50 pointer-events-none"></div>
      </motion.div>

      <style>{`
        @keyframes scanline {
          0% { top: 0% }
          100% { top: 100% }
        }
        .animate-scanline {
          position: absolute;
          animation: scanline 4s linear infinite;
        }
      `}</style>
    </div>
  );
}