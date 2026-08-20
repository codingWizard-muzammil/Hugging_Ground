import { ApiKeyGate } from "@/components/ApiKeyGate";
import { Header } from "@/components/Header";
import { Playground } from "@/components/Playground";

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ApiKeyGate>
        <Header />
        <Playground />
      </ApiKeyGate>
    </div>
  );
}
