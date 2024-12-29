---
title: Announcing rspc 0.4.0
description: Complete with a new syntax, improved middleware, SFM's, jump to definition and more.
date: 2024-12-29
draft: false # TODO
---

Today marks the well anticipated release of rspc 0.4.0. This release has been over 2 years in the making and opens up a whole new world of possibilies.

You can get started with it by following the [new documentation](https://specta.dev/docs/rspc/quickstart) but here are some of the highlights of this release.

### New Procedure Syntax

This release comes with a completly new syntax for defining procedures. As a refesher, this is what the current syntax looks like:

```rust
fn mount() -> RouterBuilder<Ctx, ...> {
    Router::<Ctx>::new()
        .config(
            Config::new().export_ts_bindings(
                PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../bindings.ts"),
            ),
        )
        .middleware(|mw| {
            mw.middleware(|mw| async move { Ok(mw.with_state(())) })
                .resp(|state, result| async move { Ok(result) })
        })
        .query("version", |t| t(|_, _: ()| env!("CARGO_PKG_VERSION")))
}
```

The major problem with this syntax is that it is not very composible. Say for example you had a middleware that would reject unauthenticated requests. You would apply that middleware using `RouterBuilder::middleware` as shown above but now every single procedure you define below it requires authentication.

```rust
fn mount() -> RouterBuilder<Ctx, ...> {
    Router::<Ctx>::new()
        // This has to be before the `middleware` or
        // you wouldn't be able to login without auth :(
        .query("login", |t| t(|_, _: LoginRequest| ...))
        .middleware(|mw| ...my_auth_middleware...)
        .query("me", |t| t(|_, _: ()| ...))
}
```

This makes the middleware system really hard to use in practice. What if you had multiple middleware, you might need to split up your procedures into wierd orders just to ensure the correct middleware is applied. The order of your procedures should not be something that you have to worry about!

Another problem is that middleware are stored onto the router builder as a generic. This is required to ensure features like context switching can work but it also means it's means it's really difficult to return a `RouterBuilder`. You'll notice in the code the return type has a `...` , figuring out that type is a nightmare even for a well seasoned Rustacean.

Okay well how do we solve this? Well let's take a look at the new syntax:

```rust
pub fn mount() -> Router<Ctx> {
    Router::new()
        .procedure("login", {
            <BaseProcedure>::builder()
                .query(|ctx, input: LoginRequest| ...)
        })
        .procedure("me", {
            <BaseProcedure>::builder()
                .with(auth())
                .query(|ctx, _: ()| ...)
        })
}
```

Middleware are now applied directly to procedures and not the router. This syntax makes it incredibly easy to build up functionality on a single procedure without it affecting any other procedures.

Now what if wanted to apply a middleware across all routes given we can no longer assigning them to the router? I don't want to have to add my logging middlware on every procedure. Well you might have noticed `BaseProcedure` in the code above. It's not actually not a type coming from `rspc` but rather something you implement yourself. It will look something like this:

<!-- TODO: Maybe add a reveal on this? -->
```rust
// `Error` is also a custom type. Refer to later section on typesafe errors.

pub struct BaseProcedure<TErr = Error>(PhantomData<TErr>);
impl<TErr> BaseProcedure<TErr> {
    pub fn builder<TInput, TResult>(
    ) -> rspc::ProcedureBuilder<TErr, Ctx, Ctx, TInput, TInput, TResult, TResult>
    where
        TErr: rspc::Error,
        TInput: rspc::ResolverInput,
        TResult: rspc::ResolverOutput<TErr>,
    {
        rspc::Procedure::builder() // You add default middleware here
    }
}
```

You can easily extend `BaseProcedure` to add default middleware, or you could define `BaseProcedure::authed`, etc to build your own abstractions.

This change is syntax is very similar to what tRPC did when changing their syntax between [tRPC v9](https://trpc.io/docs/v9/router) and [tRPC v10](https://trpc.io/docs/v10/server/procedures). A huge thanks to [@alexdotjs](https://x.com/alexdotjs) for his influential work on tRPC.

### New Middleware System

Now that we can easily apply middleware to procedures we need to look at the syntax for defining middleware themselves. Here is the old syntax:

```rust
fn mount() -> RouterBuilder<Ctx, ...> {
    Router::<Ctx>::new()
        .middleware(|mw| {
            mw.middleware(|mw| async move {
                let input: serde_json::Value = mw.input;

                Ok(mw.with_state(()).with_ctx(mw.ctx))
            })
            .resp(|state, result| async move { Ok(result) })
        })
}
```

The first thing that jumps out at me is how you have two different closures, one for before the procedure is called and one for after. This leads to `.with_state` to allow sharing state between the two closures which makes more some pretty ugly and confusing code.

You also notice that when accessing the input type it's got the type `serde_json::Value`. This means it's not typesafe at all and you need to do extra deserialization to access it.

This system is also not very typesafe. Although the middleware are able modify the input and the result of the procedure they are unable to affect the type exporting so if they do not match the whole thing will error at runtime. They are also unable to infer the proper types for it so they must ensure they deserialize the `serde_json::Value` into the correct type.

It's also very difficult to abstract a middleware out into a dedicated function. This makes it really hard to construct reusable middleware.

Okay so what's the new syntax?

```rust
pub fn my_middleware<TError, TCtx, TInput, TResult>() -> Middleware<TError, TCtx, TInput, TResult>
where
    TError: Send + 'static,
    TCtx: Send + 'static,
    TInput: Send + 'static,
    TResult: Send + Sync + 'static,
{
    Middleware::new(
        move |ctx: TCtx, input: TInput, next| async move { next.exec(ctx, input).await },
    )
}
```

Now all of the generics make this look like a bit of a mouthful but you have the ability to do so much more.

First of you you can access the input and the result of the procedure directly as the `TInput` and `TOutput` generic. You can also constrain the types to various traits. For example your logging middleware could require `std::fmt::Debug` or your caching middlware you could `Clone`.

You can now also switch the input, result or context type to be whatever you want. For example if you wanted to return the amount of time a procedure took to execute you can do the following:

```rust
pub fn timing_middleware<TError, TCtx, TInput, TResult>(
    //                | the types for the middleware  | the types for the preceding middleware or procedure |
) -> Middleware<TError, TCtx, TInput, (TResult, String), TCtx, TInput, TResult>
where
    TError: Send + 'static,
    TCtx: Send + 'static,
    TInput: Send + 'static,
    TResult: Send + Sync + 'static,
{
    Middleware::new(move |ctx: TCtx, input: TInput, next| async move {
        let instant = Instant::now();
        let result = next.exec(ctx, input).await?;
        Ok((result, format!("{:?}", instant.elapsed())))
    })
}
```

Breaking down the `Middleware` generics:
 - the first middleware parses through the error type.
 - the next 3 generics are the types for the middleware itself.
 - the next 3 generics are the types for the preceding middleware or procedure. These can be omitted but will default to the same types as the middleware.

For example this middleware has 3 generics `TCtx`, `TInput` and `TResult` which are all set to the types infered from the next middleware or procedure via them being the last 3 generics. The first 4 generics then passthrough the same context and input but modify the result to be `(TResult, String)`.

This means when you call this procedure from Typescript your query will return a typesafe tuple of the value returned from the procedure and the time it took to execute as a string.

#### Extensions

We are also introducing an alternative to middleware called extensions. These are designed for cases where you want to access the final input, result and context types as middleware can only ever see the types relative to the next layer.


TODO:

Due to the fact that middleware can modify the input, output and context types it means the order of them can actually affect the result. At lot of middleware want to be sure they act on the types of the procedure and

### Official Middleware

With the next release we are also going to be

## Batching

## Single Flight Mutations (SFM's)

## Jump to Definition

## Typesafe errors

TODO: Also possibly better errors?

## Content Types

TODO: File uploads

## Adapters

TODO: More reliable. Catching panics.

## New documentation

## Coming soon

### Dates and BigInt support

### New Client

### Experimental Rust Client

## Incremental migration

TODO

## Conclusion

A huge amount of research has gone into this release and I want to thank anyone who has supported me along the way.

TODO: List of GitHub Sponsors & Contributors

Thanks for using and supporting rspc.
