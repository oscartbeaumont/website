import config from "../config";

function stripPrefix(str: string, prefix: string) {
  return str.startsWith(prefix) ? str.slice(prefix.length) : str;
}

export default function Page() {
  return (
    <div class="py-5 px-5">
      <h3 class="text-4xl pb-4">Assets</h3>

      {Object.entries(config.assets).map(([assetCategory, value]) => (
        <div class="pb-4">
          <h5 class="text-xl">{assetCategory}:</h5>
          <ul class="list-disc ml-6 mb-2">
            {value.map((asset) => (
              <li>
                {asset.name}
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  class="ml-2 text-green-500"
                >
                  {stripPrefix(asset.url, "/assets/")}
                </a>{" "}
                {"suffix" in asset ? ` (${asset.suffix})` : ""}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
