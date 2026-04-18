import ChatBox from "../components/ChatBox";
import ProductGridSearch from "../components/ProductGridSearch";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-10 px-4 py-16">
      <ChatBox />
      <ProductGridSearch />
    </main>
  );
}
