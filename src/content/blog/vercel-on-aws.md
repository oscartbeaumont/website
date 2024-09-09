---
title: Vercel on AWS
description: Can we replicate the Vercel developer experience on AWS and if so, how?
date: 2024-09-09
---

I'm sure if you spend as much time as I do on tech Twitter you've seen the posts talking about how Vercel is just an AWS wrapper and that you should just use AWS directly.
I've been thinking about this for a while and I wanted to investigate if it's possible to replicate the developer experience i'm used to on Vercel while using a stack that is pure AWS.

## The Vercel Developer Experience

I think it's important to start out by defining what I mean by the Vercel DX. For me this comes down to *preview deployments* and *instant rollbacks*.

A preview deployments should be created for every commit allowing your team to quickly review pull requests and trace regressions back to a specific commit.
As we are making use of serverless technologies that support scale-to-zero this should not incur any extra costs.
I also believe it's crucial for preview deployments to be fast to create because nothing is worse than waiting 15 minutes for CI. I think under 10 seconds ecluding the framework's build time is a good target.

I also believe that instant rollbacks are key to a fast moving team. Being able to ship quickly and rollback if something goes wrong removes the fear of making changes (even on a Friday).

## So which AWS services?

AWS offers over 200 services so it's important to work out which ones we will actually need and to understand how they fit together.

To store our static assets we will use [S3](https://aws.amazon.com/s3/) which is an object storage service. This is the most obvious choice as it's cheap, reliable and has a high level of durability.

To host our API we will use [Lambda](https://aws.amazon.com/lambda/) which is a serverless compute service. This is a great choice as it allows our compute to scale to zero. This is also what Vercel use under the hood.

We will front the whole stack with [CloudFront](https://aws.amazon.com/cloudfront/) which is a content delivery network. This will cache our content all around the world close to our users to ensure quick page loads.

## SST enters the chat

To build out our system we will need a way to define our infrastructure in code. This allows us to safely version our configuration and reproduce our stack across many projects or environments.

Recently I have been using [SST](https://sst.dev) which is a framework built on top of [Pulumi](https://pulumi.com) that makes defining serverless infrastructure in Typescript easier.

## The Naive Approach

Let's start our by using the [StaticSite](https://sst.dev/docs/component/aws/static-site) construct provided by SST. This stack will setup a CloudFront distribution and an S3 bucket to host our static assets.

```ts:sst.config.ts
new sst.aws.StaticSite("web", {
  path: "./public",
});
```

[Full file](#todo)

Okay now let's deploy it

```bash
sst deploy --stage production
# took 3m 52s
```

Okay, that's a bit slower than I was expecting.

By looking at the logs we can see that figure out what's taking up so much time.

Wait it's CloudFront.

Turns out CloudFront is just very slow to provision. This would probally be fine for the one off creation of a production environments but to get close to Vercel's DX we need preview environments to be created faster!

## Can we reuse a distribution?

What if we shared the same bucket and CloudFront distribution between all of our environments? This would mean only creating the slow CloudFront distribution once and should speed up the creation of preview environments.

What if we struct our S3 bucket like:
 - `production/...` - the production assets
 - `GIT_SHA/...` - the assets for a specific commit

and then configure CloudFront to accept requests for `domain.com` and `*.preview.domain.com`. We could make use of a [CloudFront Function](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html) to check the incoming domain and rewrite the S3 request to the correct.

Now a deploy can consist of uploading the assets to the correct folder in S3 and issuing a cache invalidation to CloudFront.

This system is detailed in [this great 8thlight article](https://8thlight.com/insights/static-site-deploy-previews-on-aws) but it's not something that can be easily implemented in SST.

## This is going far too easy

This all works great but we are missing a part of the stack, the API!



## Issues

### Incomplete deployments

TODO - CLI closing or deploy still running

## Conclusion

TODO

#### Erata

I think in practice you would need a system to to clear out old deployments after a couple of months to save on storage costs but I have left this as out of scope for this article.

<!-- TODO: Fix links, maybe reusing a distribution implemented in SST -->
