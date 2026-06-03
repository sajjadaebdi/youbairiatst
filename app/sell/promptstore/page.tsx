import SellerChat from "./components/sellerchat"

export default function PromptStorePage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">
        Sell on Youbairia
      </h1>

      <p className="mb-6 text-gray-500">
        Describe what you want to sell or promote.
      </p>

      <SellerChat />
    </main>
  );
}