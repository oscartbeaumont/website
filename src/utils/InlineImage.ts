import { promises as fs } from "node:fs";
import { createRequire } from "module";
const cjs = createRequire(import.meta.url);
const sharp: typeof import("sharp") = cjs("sharp");

interface InlineImageConfig {
  size: [number, number];
}

export default async (
  filepath: string,
  config?: InlineImageConfig
): Promise<string> => {
  const fileRaw = await fs.readFile(filepath);
  var output;
  if (config?.size) {
    output = await sharp(fileRaw)
      .webp()
      .resize(config!.size[0], config!.size[1])
      .toBuffer();
  } else {
    output = await sharp(fileRaw).webp().toBuffer();
  }

  return `data:image/webp;base64,${output.toString("base64")}`;
};
