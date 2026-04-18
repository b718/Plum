import ChatBox from "../components/ChatBox";
import ProductGrid from "../components/ProductGrid";
import { SearchProvider } from "../components/context/SearchContext";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-10 px-4 py-16">
      <SearchProvider>
        <ChatBox />
        <ProductGrid />
      </SearchProvider>
    </main>
  );
}
