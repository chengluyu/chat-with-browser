export default function Page() {
  return (
    <>
      <header className="flex-shrink-0 h-12 border-b border-stone-900">
        Chat with Browser
      </header>
      <div className="flex-1 flex flex-row">
        <aside className="w-48 border-r border-stone-900">ChatHistory</aside>
        <main></main>
      </div>
      <footer className="flex-shrink-0 h-12 border-t border-stone-900"></footer>
    </>
  );
}
