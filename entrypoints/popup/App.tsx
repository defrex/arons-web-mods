import './App.css';

interface Mod {
  id: string;
  name: string;
  description: string;
}

// A simple static listing of the mods in this extension. As the collection
// grows, this is the place to surface per-mod toggles backed by `storage`.
const MODS: Mod[] = [
  {
    id: 'example',
    name: 'Example (example.com)',
    description: 'Rewrites the page heading — a template for new mods.',
  },
];

function App() {
  return (
    <main className="popup">
      <h1>Aron&apos;s Web Mods</h1>
      <p className="subtitle">Active tweaks &amp; mods</p>
      <ul className="mod-list">
        {MODS.map((mod) => (
          <li key={mod.id}>
            <span className="mod-name">{mod.name}</span>
            <span className="mod-description">{mod.description}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
