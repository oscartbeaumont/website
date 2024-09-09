/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "vercel-on-aws-reuse-distribution",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "local", // You should use "aws" or "cloudflare" for production!
      providers: {
        aws: { region: "us-east-1" },
      },
    };
  },
  async run() {
    // TODO: CloudFront function for rewriting S3 bucket requests

    new sst.aws.StaticSite("web", {
      path: "./public/index.html",
      transform: {
        // TODO: Reuse the bucket and CDN for preview deployments???
        // bucket: {
        //   name: "vercel-on-aws-reuse-distribution",
        // },
      },
    });

    // We still need to hook up the Lambda function!
  },
});
