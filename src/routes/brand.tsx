import { createSignal, For, onMount } from "solid-js";

export default function Brand() {
  const [assets, setAssets] = createSignal<Asset[]>([]);
  const [selectedCategory, setSelectedCategory] = createSignal("all");

  interface Asset {
    name: string;
    path: string;
    type: string;
    category: string;
    size?: string;
  }

  // Define all assets with their categories
  const allAssets: Asset[] = [
    { name: "Oscar Beaumont Logo", path: "/assets/OscarBeaumontLogo.png", type: "png", category: "logos" },
    { name: "Oscar Beaumont Logo (White)", path: "/assets/OscarBeaumontLogo-White.png", type: "png", category: "logos" },
    { name: "Oscar Beaumont Logo (AI)", path: "/assets/OscarBeaumontLogo.ai", type: "ai", category: "logos" },
    { name: "Logo", path: "/assets/logo.png", type: "png", category: "logos" },
    { name: "Logo (GIF)", path: "/assets/logo.gif", type: "gif", category: "logos" },
    { name: "Logo (Icon)", path: "/assets/logo.ico", type: "ico", category: "logos" },
    { name: "Logo Splat", path: "/assets/logo-splat.gif", type: "gif", category: "logos" },
    { name: "Smaller Logo", path: "/assets/smaller.png", type: "png", category: "logos" },
    { name: "Profile Photo", path: "/assets/me.jpg", type: "jpg", category: "photos" },
    { name: "Profile Photo (Original)", path: "/assets/me-original.jpg", type: "jpg", category: "photos" },
    { name: "Profile Photo (Alt)", path: "/assets/me2.jpg", type: "jpg", category: "photos" },
    { name: "Oscar Portrait", path: "/assets/oscar.jpg", type: "jpg", category: "photos" },
    { name: "Oscar Tall", path: "/assets/oscar-tall.jpg", type: "jpg", category: "photos" },
    { name: "Wallpaper", path: "/assets/wallpaper.jpeg", type: "jpeg", category: "wallpapers" },
    { name: "Wallpaper 2", path: "/assets/wallpaper2.jpg", type: "jpg", category: "wallpapers" },
    { name: "Minecraft Skin", path: "/assets/minecraft-skin.png", type: "png", category: "misc" },
  ];

  onMount(() => {
    setAssets(allAssets);
  });

  const categories = [
    { id: "all", name: "All Assets" },
    { id: "logos", name: "Logos" },
    { id: "photos", name: "Photos" },
    { id: "wallpapers", name: "Wallpapers" },
    { id: "misc", name: "Miscellaneous" },
  ];

  const filteredAssets = () => {
    if (selectedCategory() === "all") {
      return assets();
    }
    return assets().filter(asset => asset.category === selectedCategory());
  };

  const downloadAsset = (asset: Asset) => {
    const link = document.createElement('a');
    link.href = asset.path;
    link.download = `${asset.name}.${asset.type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <ImageIcon />;
      case 'ai':
        return <VectorIcon />;
      case 'ico':
        return <IconFileIcon />;
      default:
        return <FileIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'png':
        return 'bg-blue-100 text-blue-800';
      case 'jpg':
      case 'jpeg':
        return 'bg-green-100 text-green-800';
      case 'gif':
        return 'bg-purple-100 text-purple-800';
      case 'ai':
        return 'bg-orange-100 text-orange-800';
      case 'ico':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div class="min-h-screen bg-white text-gray-900">
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div class="max-w-6xl mx-auto px-6 py-12">
        <Header />
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <AssetGrid
          assets={filteredAssets()}
          onDownload={downloadAsset}
          getFileIcon={getFileIcon}
          getTypeColor={getTypeColor}
        />
        <Footer />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header class="mb-16">
      <div class="text-center mb-8">
        <h1 class="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
          Brand Assets
        </h1>
        <p class="text-xl text-gray-600 mb-6 leading-relaxed font-medium max-w-2xl mx-auto">
          Download official logos, photos, and brand assets for Oscar Beaumont.
          All assets are available for editorial and promotional use.
        </p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p class="text-blue-800 text-sm">
            <strong>Usage Guidelines:</strong> These assets are provided for editorial, educational,
            and promotional purposes. Please maintain aspect ratios and don't modify the logos
            without permission.
          </p>
        </div>
      </div>
    </header>
  );
}

function CategoryFilter(props: {
  categories: Array<{ id: string; name: string }>;
  selectedCategory: () => string;
  setSelectedCategory: (category: string) => void;
}) {
  return (
    <section class="mb-12">
      <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        <For each={props.categories}>
          {(category) => (
            <button
              onClick={() => props.setSelectedCategory(category.id)}
              class={`flex-shrink-0 px-6 py-3 rounded-lg border transition-all duration-200 font-medium snap-start ${
                props.selectedCategory() === category.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:shadow-sm'
              }`}
            >
              {category.name}
            </button>
          )}
        </For>
      </div>
    </section>
  );
}

function AssetGrid(props: {
  assets: Array<any>;
  onDownload: (asset: any) => void;
  getFileIcon: (type: string) => any;
  getTypeColor: (type: string) => string;
}) {
  return (
    <section class="mb-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <For each={props.assets}>
          {(asset) => (
            <AssetCard
              asset={asset}
              onDownload={props.onDownload}
              getFileIcon={props.getFileIcon}
              getTypeColor={props.getTypeColor}
            />
          )}
        </For>
      </div>
    </section>
  );
}

function AssetCard(props: {
  asset: any;
  onDownload: (asset: any) => void;
  getFileIcon: (type: string) => any;
  getTypeColor: (type: string) => string;
}) {
  const { asset } = props;
  const [imageError, setImageError] = createSignal(false);
  const [imageLoaded, setImageLoaded] = createSignal(false);

  const isImage = () => ['png', 'jpg', 'jpeg', 'gif'].includes(asset.type.toLowerCase());

  return (
    <div class="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-all duration-200 hover:shadow-lg">
      <div class="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
        {isImage() && !imageError() ? (
          <>
            {!imageLoaded() && (
              <div class="absolute inset-0 bg-gray-200 animate-pulse"></div>
            )}
            <img
              src={asset.path}
              alt={asset.name}
              class={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                imageLoaded() ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div class="flex flex-col items-center justify-center text-gray-400">
            {props.getFileIcon(asset.type)}
            <span class="mt-2 text-sm font-medium">{asset.type.toUpperCase()}</span>
          </div>
        )}
      </div>

      <div class="p-4">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-900 leading-tight">{asset.name}</h3>
          <span class={`px-2 py-1 rounded text-xs font-medium ${props.getTypeColor(asset.type)}`}>
            {asset.type.toUpperCase()}
          </span>
        </div>

        <button
          onClick={() => props.onDownload(asset)}
          class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          <DownloadIcon />
          Download
        </button>
      </div>
    </div>
  );
}

function Footer() {
  const [currentYear] = createSignal(new Date().getFullYear());

  return (
    <footer class="pt-8 border-t border-gray-200 text-center text-gray-500">
      <p>© {currentYear()} Oscar Beaumont. All brand assets are provided for editorial and promotional use.</p>
    </footer>
  );
}

// SVG Icons
function DownloadIcon() {
  return (
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function VectorIcon() {
  return (
    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h4a2 2 0 002-2V9a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" />
    </svg>
  );
}

function IconFileIcon() {
  return (
    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
