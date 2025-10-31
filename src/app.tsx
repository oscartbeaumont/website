import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { DynamicImage, OpenGraph } from '@solid-mediakit/og';
import { Link, MetaProvider, Title } from "@solidjs/meta";
import { Suspense } from "solid-js";
import "./app.css";
import { getRequestEvent } from "solid-js/web";

export default function App() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <Suspense>{props.children}</Suspense>

          {/* TODO: Finish SEO + OpenGraph Metadata -> + dynamic configuration of it using `constants.ts` style file */}
          <Title>Oscar Beaumont</Title>
          <Link rel="canonical" href="http://otbeaumont.me" />

          <OpenGraph origin={getRequestEvent()!.nativeEvent.url.origin}>
            <DynamicImage>
              <div>This is very cool!</div>
            </DynamicImage>
          </OpenGraph>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
