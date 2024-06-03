---
title: Specta 2 RFC
description: A discussion about the future of Specta and the plan for Specta 2.
date: 2024-06-03 # TODO
draft: true # TODO
---

I would like Specta v2 to be the final release of Specta so we can really build an ecosystem. This means decoupling as much from the core as possible so we aren't stuck into an inperfect API if we make any mistakes.

Requirements:
 - We can't bake Serde into anything. It needs to be a transform.


Thoughts:
 - Do we wanna allow any metadata to be assigned to a struct. This would open up the door to changes in the future if we really need them.
 - I think Specta is really convering the API surface of two crates. A high-level and a low-level crate.
 - How can format's like Serde compose with languages.
 - AST transformations. Maybe `oxc` exporter???

## Decouple Serde

I think we need to go furthur than just breaking it's validation into it's own step.

Currently the macro takes into account:
 - `#[serde(rename = "")]` + `#[serde(rename_all = "...")]`
 - `#[serde(tag = "", content = "")]`

We want to break the handling of these from our Typescript exporter and make them optional.

## High-level vs Low-level


TODO: Potential crate names? `specto`???

## Per-phase metadata

TODO ???

## `DataTypeFrom`

TODO ???

### AST transformations

It could be useful to be able to transform the Typescript output?