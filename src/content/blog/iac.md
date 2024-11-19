---
title: The Composability Problems of Infrastructure as Code
description: TODO
date: 2024-09-11 # TODO
draft: true # TODO
---

Heavily considered in the context of SST's high-level abstractions.

## General

I'm not sure stages/stacks are a generally a good model. If your doing preview deployments for each commit you've really got to consider two types of resources. Per-commit and per-environment.

Eg. your Cloudflare Pages app and database are per environment. But your Lambda function is per commit. I think a commit must exist in an environment and I think environments will generally follow after Git branches (potentially with extra ones for each developer's local environment). One side-effects of this is that changing a shared resources requires the "production" stack to be cloned to a "pr-1" stack only for this specific PR. tbh, idk, how this all works with rollbacks.

## CDK

It's an DSL on JSON which subverts your expectations for "what is JS".

## Pulumi

Resources are created prior to bindings which is a problem when permission policies are attached to the resource not the binding. Can be very problematic when wanting to make a `Resource` component that can just enable a Lambda function URL and setup it's permission policy. 

