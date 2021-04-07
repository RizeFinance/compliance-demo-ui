import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export default {
    name: 'rize-compliance-demo-ui',
    slug: 'rize-compliance-demo-ui',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    splash: {
        image: './assets/images/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
    },
    updates: {
        fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
        '**/*'
    ],
    ios: {
        supportsTablet: true
    },
    android: {
        adaptiveIcon: {
            foregroundImage: './assets/images/adaptive-icon.png',
            backgroundColor: '#FFFFFF'
        }
    },
    web: {
        favicon: './assets/images/favicon.png'
    },
    packagerOpts: {
        config: 'metro.config.js',
        sourceExts: [
            'expo.ts',
            'expo.tsx',
            'expo.js',
            'expo.jsx',
            'ts',
            'tsx',
            'js',
            'jsx',
            'json',
            'wasm',
            'svg',
        ],
    },
    extra: {
        rize: {
            programId: process.env.REACT_NATIVE_RIZE_PROGRAM_ID,
            hmac: process.env.REACT_NATIVE_RIZE_HMAC,
        },
        api: {
            baseUrl: process.env.REACT_NATIVE_API_BASE_URL,
        }
    },
};
