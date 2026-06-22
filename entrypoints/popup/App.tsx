import { useEffect, useState } from 'react';
import { cleanupEnabled, cleanupTime } from '@/lib/close-ungrouped-tabs';
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
    id: 'copy-url',
    name: 'Copy URL (⌘⇧D)',
    description: 'Copy the current page URL to the clipboard.',
  },
  {
    id: 'example',
    name: 'Example (example.com)',
    description: 'Rewrites the page heading — a template for new mods.',
  },
];

// Controls for the "close ungrouped tabs" mod, backed by `storage`.
function CloseUngroupedControls() {
  const [enabled, setEnabled] = useState(true);
  const [time, setTime] = useState('06:00');

  useEffect(() => {
    void cleanupEnabled.getValue().then(setEnabled);
    void cleanupTime.getValue().then(setTime);
  }, []);

  return (
    <li className="mod-config">
      <span className="mod-name">Close ungrouped tabs</span>
      <span className="mod-description">
        Each day at the set time, closes every tab that isn&apos;t in a tab
        group (pinned tabs are spared). A window with only loose tabs closes
        entirely.
      </span>
      <div className="mod-controls">
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => {
              setEnabled(e.target.checked);
              void cleanupEnabled.setValue(e.target.checked);
            }}
          />
          Enabled
        </label>
        <label>
          Time
          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              void cleanupTime.setValue(e.target.value);
            }}
          />
        </label>
      </div>
    </li>
  );
}

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
        <CloseUngroupedControls />
      </ul>
    </main>
  );
}

export default App;
