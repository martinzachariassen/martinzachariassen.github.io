import Terminal from "./components/Terminal/Terminal.js";
import NameHeader from "./components/NameHeader/NameHeader.js";

export default function App() {
  return (
    <>
      <NameHeader />
      <main id="terminal" aria-label="Interactive terminal">
        <Terminal />
      </main>
    </>
  );
}
