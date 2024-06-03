---
title: Lies of Edge
description: Edge region, Edge runtime, really 
date: 2024-04-17 # TODO
draft: true # TODO
---

TODO:
 - Compare runtimes - LLRT Lambda vs Node.js Lambda vs Cloudflare Worker vs Deno deploy
 - Read vs write traffic
    - How read replicas and edge rendering makes sense
    - Which DB providers would support this

 - Can we replica Fly.io's routing (GET to read-replica, rest to main) with multiple-region AWS Lambda's?



--- Scratch

Deployed to Sydney and accessed through function URL in incognito mode.

Node.js - arm64
 - 530ms cold boot
 - 70ms warm

LLRT - arm64, Sydney
 - 690ms cold boot
 - 69ms warm

Deno Deploy - Edge
 - 224ms cold boot
 - 63ms warm

Cloudflare Workers - Edge
 - 243ms cold boot
 - 60ms warm