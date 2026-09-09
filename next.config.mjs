/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optional isolated cache when the website and mobile API previews run together.
  distDir: process.env.NIVARAN_NEXT_DIST_DIR || '.next',
  // The Android APK lives on GitHub Releases so the repo and the deploy stay small; the popup links here.
  async redirects() {
    return [
      { source: '/nivaran.apk', destination: 'https://github.com/milliondreamsblog/nivaran/releases/latest/download/nivaran.apk', permanent: false },
    ];
  },
  // The Expo web export lives in public/app. Files there are served before these rewrites run,
  // so only deep links such as /app/case/abc fall through to the single-page shell.
  async rewrites() {
    return [
      { source: '/app', destination: '/app/index.html' },
      { source: '/app/:path*', destination: '/app/index.html' },
    ];
  },
};

export default nextConfig;
