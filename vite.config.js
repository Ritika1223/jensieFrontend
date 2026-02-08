import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Optimize for low-speed connections
    chunkSizeWarningLimit: 500, // Warn earlier for better chunk management
    
    // Advanced code splitting for faster initial load
    rollupOptions: {
      output: {
        // Chunking strategy - keep React with vendor to prevent loading order issues
        manualChunks: (id) => {
          // Swiper - for carousels (loaded on demand)
          if (id.includes('node_modules/swiper')) {
            return 'swiper';
          }
          
          // React Markdown (loaded on demand)
          if (id.includes('node_modules/react-markdown') ||
              id.includes('node_modules/remark') ||
              id.includes('node_modules/rehype')) {
            return 'markdown';
          }
          
          // All vendor code including React stays together
          // This prevents forwardRef errors from chunk loading order issues
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        
        // Optimize chunk file names for caching (v2 forces cache invalidation)
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId || '';
          if (facadeModuleId.includes('pages/')) {
            return 'assets/pages/[name]-v3-[hash].js';
          }
          return 'assets/[name]-v3-[hash].js';
        },
        
        // Optimize asset file names (v2 forces cache invalidation)
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|webp|avif|ico/i.test(ext)) {
            return 'assets/images/[name]-v3-[hash][extname]';
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return 'assets/fonts/[name]-v3-[hash][extname]';
          }
          return 'assets/[name]-v3-[hash][extname]';
        },
        
        // Entry file names (v2 forces cache invalidation)
        entryFileNames: 'assets/[name]-v3-[hash].js',
      },
    },
    
    // Enable minification with terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info'], // Remove specific functions
        passes: 2, // Multiple compression passes for better results
      },
      mangle: {
        safari10: true, // Fix Safari 10 issues
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    
    // Generate source maps for debugging (optional, disable for smaller builds)
    sourcemap: false,
    
    // CSS optimization
    cssCodeSplit: true, // Split CSS per chunk
    cssMinify: true, // Minify CSS
    
    // Target modern browsers for smaller bundles
    target: 'es2020',
    
    // Asset inlining threshold (inline small assets as base64)
    assetsInlineLimit: 4096, // 4KB - inline small images
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  
  // Development server optimizations
  server: {
    // Enable HTTP/2 for better parallel loading in dev
    hmr: {
      overlay: true,
    },
  },
  
  // Preview server optimizations
  preview: {
    // Enable compression for preview builds
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
  
  // Enable CSS modules optimization
  css: {
    devSourcemap: false, // Disable source maps for faster CSS
  },
  
  // esbuild options for faster builds
  esbuild: {
    legalComments: 'none', // Remove legal comments
    treeShaking: true, // Enable tree shaking
  },
})
