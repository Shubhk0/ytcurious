/** @type {import('next').NextConfig} */
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath = process.env.NODE_ENV === "production" && repoName ? `/${repoName}` : "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath,
  assetPrefix: basePath || undefined,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "onnxruntime-node$": false
    };
    return config;
  }
};

export default nextConfig;
