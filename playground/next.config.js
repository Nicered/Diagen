/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // GitHub Pages의 경우 basePath 설정 필요
  // 리포지토리 이름에 맞게 수정하세요
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true,
  },
  // diagen 라이브러리 트랜스파일
  transpilePackages: ['diagen'],
};

module.exports = nextConfig;
