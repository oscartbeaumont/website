---
title: Ultimate Deployment Guide
description: TODO # TODO
date: 2024-05-19
draft: true # TODO
---

I've been thinking a lot about the best way to deploy the backend of your application and I wanted to document my thoughts on different options and their trade-offs.

## What do I want want?

The first step is to define what requirements and constraints I have so we can evaluate the different options.

The programming language can make a big difference in the deployment process. Dynamic languages have very different characteristics compared to static languages. I personally use either [Typescript](https://www.typescriptlang.org) or [Rust](https://www.rust-lang.org) so I will focus on them for the remainder of this article.

I live in [Australia](https://en.wikipedia.org/wiki/Australia) so I think about the importance of geographical location. Running your services closer to your users makes a noticeable difference, however it's not always possible if your database is centralised.

I also value the ability to autoscale so I don't need to babysit my servers and can focus on building the product.

Rollbacks are also extremely important. If I deploy a bad version of my service, being able to revert to an old version to minimise downtime is huge. It makes deploying on Friday stress-free.

I would like preview environments for every pull request so I can test changes in isolation before merging them into the main branch. These should be low-cost and relatively quick to spin up.
<!-- Generally any service that supports scale-to-zero should be able to support this feature very well. -->

## Solutions

### Fly.io

[Fly.io](https://fly.io) is a platform to deploy Docker-based applications all around the globe.

<!-- Fly is predominantly managed by [`flyctl`](https://fly.io/docs/hands-on/install-flyctl/) their CLI tool. -->

#### CI/CD

Fly.io doesn't allow directly linking to a GitHub repository so you need to use a CI/CD tool to build and deploy your application. This can easily be done with [GitHub Actions](https://github.com/features/actions) by following [this guide](https://fly.io/docs/app-guides/continuous-deployment-with-github-actions).

This works pretty well but Fly lacks any way to rollback to a previous version of your application.

It also requires you to set up a GitHub secret with your Fly.io API key which is a bit annoying when GitHub Actions has support for [OIDC Connect](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect).

#### CDN

Fly.io does not provide a CDN layer so you will need to deploy your application in many regions or use an external service. This seems fine for an API but you would want to deploy a lot of machines if you are going to serve HTML, CSS and JS files from your backend.

The idea is that your serve assets from your backend directly. If you were doing server-side rendering this would be fine but for a single-page application, you would want to use a CDN.

However, using a CDN introduces a lot of complexity. You will need to invalidate the upstream cache on each deployment to ensure you don't get version skew.

#### Scaling

Fly.io allows for scaling your applications to zero. Unlike Lambda you are in complete control of the instances lifecycle. When you applications exits the machine will be shutdown and when the Fly load balancer detects a new connection it will start back up the instance.

<!-- TODO: Cold start time/how are they different from Lambda's cold starts -->

<!-- TODO - It's still got storage after being restated??? TODO - Check this -->

Fly.io has support for automatically scaling up and down *pre-provisioned* machines. When the provisoned machine is not required it will scale-to-zero reducing it's cost to just the disk storage. When the existing instances get overloaded the instances will be woken up to handle the load. If you would like fully hands off autoscaling you can deploy [Fly autoscaler](https://github.com/superfly/fly-autoscaler).

<!-- Provisioned concurrency  -->

<!-- TODO - Provisioning concurrency is very cheap TODO: Compare to Lambda? -->

#### Anycast network

Fly.io comes with an anycast network build which means your users will be automatically routed to the closest deployment of your application. This being included out of the box with no extra configuration or charge is a huge benefit.

<!-- TODO: https://fly.io/docs/blueprints/multi-region-fly-replay/ -->

#### Fly machines

TODO: How they are more hands on

#### Preview deployment environment.

TODO

https://fly.io/docs/blueprints/review-apps-guide/

<!-- TODO - Cost of running preview environments -->

#### FlyCD

[FlyCD](https://flycd.dev) is a 3rd party service which builds on top of Fly.io's infrastructure. It helps you deploy your application into your own Fly.io account while providing a nice UX for managing your deployments, including support for rolling back deployments.

TODO - Does this allow for rollbacks?

<!-- TODO: Kinda slow and glitchy + didn't work + not realtime + no multi-region but I like the vision -->

<!-- TODO: This would have no idea of your CDN for invalidating it -->

#### Conclusions

TODO

### AWS Lambda

TODO

<!-- TODO: Provisioned concurrency for ARM would cost 0.0000033334*60*60*24*31 = 8.92$ USD / month + usage (which isn't included lol) -->

#### Lamdba warmer

TODO

#### Cold starts

TODO

### Vercel

[Vercel](https://vercel.com) is ...

TODO

### Railway

TODO

<!-- TODO: Good CI, lack of regions, expensive -->

### Render.io




### Wasm - TODO Services

TODO

### Kraft Cloud

TODO

### Cloudflare Workers

TODO

<!-- TODO: Requires modified application for Rust -->

<!-- TODO: Maybe list Spin and the other one and handle all wasm-based providers together -->

### Deno Deploy

TODO

### Kubernetes

TODO

### VPS

TODO - OS updates

### AWS

TODO

### SST

TODO

#### seed.run

<!-- Rollbacks for multi-region pain -->
<!-- Slow due to AWS infrastructure -->

<!-- TODO -->
<!-- Deployment speed matters - Caching -->