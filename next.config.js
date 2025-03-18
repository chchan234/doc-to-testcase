/** @type {import('next').NextConfig} */
const nextConfig = {
  // Node.js 런타임을 사용하도록 설정
  experimental: {
    // 외부 패키지 설정 방식 변경
  },
  // Node.js 패키지를 서버에서 사용
  serverExternalPackages: ['pdf-parse', 'mammoth', 'exceljs'],
  // Buffer 사용을 위해 웹팩 폴리필 설정
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer/')
    };
    return config;
  },
  // API 경로에서 노드 환경 사용
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  }
};

module.exports = nextConfig;