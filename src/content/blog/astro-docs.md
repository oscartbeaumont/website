---
title: Using Astro Content Collection from Solid
description: Combine the power of Astro content collection and Solid Router to build a better site!
date: 2024-07-01 # TODO
draft: true # TODO
---

I think [Astro](https://astro.build) is a perfect tool for building static content-first sites but i've never been a fan of the experience of multi-page application for documentation. How great would it be to be able to bring [Content Collections](https://docs.astro.build/en/guides/content-collections/) into your frontend framework of choice?

Well I managed to get it working, but it's a bit rough right now.

## Setup Solid Router

First of all we need to setup a single page application by bringing in a router to handle client side navigations. For this we are going to use [Solid Router](https://github.com/solidjs/solid-router) but you could use any router that works with your frontend framework of choice.

<!-- TODO: Style title of the code block -->

```astro:[...slug].astro
---
import { App, getRoutes } from "../app";

export async function getStaticPaths() {
	return getRoutes().map((slug) => ({
		params: {
			slug,
		},
	}));
}

// When using `build { format: "file" }` the prerender will target `.html` which is not what Solid Router expects.
// In production Cloudflare Pages will strip the `.html`
const path = Astro.url.pathname.endsWith(".html")
	? Astro.url.pathname.slice(0, -5)
	: Astro.url.pathname;
---

<html lang="en" class="h-full w-full">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width" />
    <meta name="generator" content={Astro.generator} />
    <title>My Website</title>
  </head>
  <body class="h-full w-full text-white pt-16 overflow-y-hidden">
    <App path={path} client:idle />
  </body>
</html>
```

<!-- Hint: You will need to add SolidJS to Astro -->

TODO: How to setup Solid router with Astro.

## Problems

### Navbar

TODO: how to get the navbar items from a content collection?

Why I dislike `NavigationCtx`? and how we can remove it?

### Page content

TODO: how to get the page content from a content collection?

Why we can't just parse it as props/children??? -> SPA routing

Downsides: Avoid depending on Solid's internals???

### 404 Handling

Cloudflare Pages expects `404.html` not `404/index.html`. It will take care of serving the closest one.

Explain why we can't just serve `index.html` -> Hydration!

### HRM

TODO - We don't have it and it's on Astro.

## Conclusions

TODO

<!-- You can see the repository [here](https://github.com/specta-rs/website) -->