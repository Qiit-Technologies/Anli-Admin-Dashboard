import type { NextConfig } from 'next';
// import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
    output: 'standalone',

    // Single-domain consolidation: this app is served from the hotel app at
    // https://weareanli.com/superadmin/* (reverse-proxied to this service).
    // basePath is applied automatically to next/link, next/router,
    // next/image and server `redirect()` — only middleware matchers,
    // raw `window.location` navigations and the /be-api proxy prefix
    // need manual basePath handling (see those files).
    basePath: '/superadmin',

    async redirects() {
        return [];
    },


    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'https',
                hostname: 'weareanli.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
        unoptimized: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },

    // Stabilize client/RSC boundaries for libraries that use React context
    transpilePackages: [
        '@heroui/react',
        '@heroui/system',
        '@heroui/theme',
        '@heroui/spinner',
        'nextjs-toploader',
    ],
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
        // Build-memory hardening (Render's 8GB build limit): the
        // "Collecting page data" worker farm defaults to
        // os.cpus().length - 1 (47 workers on Render's build hosts) and
        // OOMs on this ~500-route app. Capping the pool at 4 keeps peak
        // build memory well under the limit. Verified against Next 16.4.0
        // source: getNumberOfWorkers() in packages/next/src/build/index.ts
        // honors a user-set experimental.cpus for this phase.
        cpus: 4,
        // Lower concurrency reduces flaky `createContext is not a function`
        // failures during "Collecting page data" on constrained CI hosts.
        // Kept at 2 (not 1): the OOM was in the worker farm above, not in
        // prerendering, so 1 would only slow builds without helping memory.
        staticGenerationMaxConcurrency: 2,
        staticGenerationMinPagesPerWorker: 25,
    },
};


export default nextConfig;

// export default withPWA({
//     dest: 'public',
//     register: true,
//     skipWaiting: true,
//     disable: process.env.NODE_ENV === 'development',

//     runtimeCaching: [
//         {
//             urlPattern: /^https:\/\/api\./,
//             handler: 'NetworkFirst',
//             options: {
//                 cacheName: 'api-cache',
//                 expiration: {
//                     maxEntries: 50,
//                     maxAgeSeconds: 60 * 60 * 24,
//                 },
//             },
//         },
//     ],
// })(nextConfig);
