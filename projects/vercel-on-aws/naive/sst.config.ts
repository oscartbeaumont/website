/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "vercel-on-aws-naive",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "local", // You should use "aws" or "cloudflare" for production!
      providers: {
        aws: { region: "us-east-1" },
      },
    };
  },
  async run() {
    new sst.aws.StaticSite("web", {
      path: "./public/index.html",
    });

    // We still need to hook up the Lambda function!
  },
});
