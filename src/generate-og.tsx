// I am having issues getting this working as an API endpoint so for now we can just pregenerate it.

import React, { type JSX } from "react";
import { ImageResponse } from "@takumi-rs/image-response";
import { openGraphImageSize } from "./constants";

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateOGImage() {
	const imageData = readFileSync(join(__dirname, "./assets/logo.jpeg"));

	const response = new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#ffffff",
				backgroundImage:
					"radial-gradient(circle at 25px 25px, #e5e7eb 2%, transparent 0%), radial-gradient(circle at 75px 75px, #e5e7eb 2%, transparent 0%)",
				backgroundSize: "100px 100px",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "48px",
				}}
			>
				<img
					src={`data:image/jpeg;base64,${imageData.toString("base64")}`}
					alt="Oscar Beaumont"
					width={240}
					height={240}
					style={{
						borderRadius: "9999px",
						border: "4px solid #f9fafb",
						boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
					}}
				/>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "8px",
					}}
				>
					<div
						style={{
							fontSize: "72px",
							fontWeight: "bold",
							color: "#111827",
							letterSpacing: "-0.025em",
						}}
					>
						Oscar Beaumont
					</div>
					<div
						style={{
							fontSize: "32px",
							color: "#6b7280",
							fontWeight: "500",
						}}
					>
						Software Engineer
					</div>
				</div>
			</div>
		</div>,
		{
			width: openGraphImageSize[0],
			height: openGraphImageSize[1],
			format: "png",
		},
	);

	writeFileSync(
		join(__dirname, "./assets/og.png"),
		Buffer.from(await response.arrayBuffer()),
	);
	console.log(`✓ OpenGraph image generated`);
}

generateOGImage().catch(console.error);
