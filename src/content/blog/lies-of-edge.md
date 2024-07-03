---
title: Lies of Edge
description: TODO
date: 2024-04-17 # TODO
draft: true # TODO
---

I've been reading the Twitter discourse and felt like some of the nuance is lost when discussing edge so this post aims to clarify some of the misconceptions.

## What even is Edge?

Is it a location? Is it a runtime? It's both????

Edge is a very loaded term that has been used to refer to both the location and runtime and this has caused endless confusion.

TODO - Define edge

## Edge vs Lambda

TODO - Compare (cold starts, runtime performance) and contrast for APIs and rendering

## A new challenger emerges

Partial Prerendering - TODO

TODO - Explain how it works, downsides

TODO - Vercel moving off of edge

<!-- TODO:
 - Explain the problems with Edge
	 - Location
	 - Runtime
 - How PPR solves them?
	 - Downsides - Status codes
 - How could Lambda be as fast as Edge?

Why would you use each.


I wonder if the reason Vercel found Lambda + PPR to be faster than Edge came down to a) cold starts being very infrequent given they have decent traffic b) Lambda would probs be faster at serving requests

https://discord.com/channels/722131463138705510/780502110772658196/1232385980003254355

https://www.youtube.com/watch?v=NDRV14_WDYA

Vercel is just a wrapper. Cloudflare doesn't do regional edge. -->