import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { DynamicImage, OpenGraph } from '@solid-mediakit/og';
import { Link, MetaProvider, Title } from "@solidjs/meta";
import { Suspense } from "solid-js";
import "./app.css";

export default function App() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <Suspense>{props.children}</Suspense>

          {/* TODO: Finish SEO + OpenGraph Metadata -> + dynamic configuration of it using `constants.ts` style file */}
          <Title>Oscar Beaumont</Title>
          <Link rel="canonical" href="http://otbeaumont.me" />

          {/*TODO: Dynamic domain*/}
          <OpenGraph origin='https://otbeaumont.me'>
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
