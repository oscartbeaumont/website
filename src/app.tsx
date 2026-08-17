import { Head } from "@solidjs/meta";
import { createRouter } from "@solidjs/router";
import { fileRoutes } from "@solidjs/router/fs";
import { Loading } from "solid-js";
import { pageRoutes } from "virtual:file-routes";
import "./app.css";

const Router = createRouter({
	routes: fileRoutes(pageRoutes),
});

export default function App() {
	return (
		<Router>
			{(props) => (
				<Head>
					<Loading>{props.children}</Loading>
				</Head>
			)}
		</Router>
	);
}
