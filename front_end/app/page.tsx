import fixtures from "./fixtures/fixture.json";
import ChatBox from "./components/ChatBox";
import ProductGrid from "./components/ProductGrid";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-10 px-4 py-16">
      <ChatBox />
      <ProductGrid products={fixtures} />
    </main>
  );
}
