import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  mdxRemark: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  },
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
