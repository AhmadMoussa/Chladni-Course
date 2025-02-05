import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  mdxRemark: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  }
};

export default nextConfig;
