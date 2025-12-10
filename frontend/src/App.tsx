import { FormEvent, useState } from "react";
import { shrekifyImage, type ShrekifyResponse } from "./apiClient";
import "./App.css";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please choose an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setUsedFallback(null);

    try {
      const response: ShrekifyResponse = await shrekifyImage(
        file,
        prompt.trim() || undefined,
        negativePrompt.trim() || undefined
      );
      setResult(response.image_base64);
      setUsedFallback(response.used_fallback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>Shrekify</h1>
        <p>Upload an image and let the backend ogre-fy it.</p>
      </header>

      <form className="card" onSubmit={handleSubmit}>
        <label className="field">
          <span>Image file</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </label>

        <label className="field">
          <span>Prompt (optional)</span>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the scene or style"
          />
        </label>

        <label className="field">
          <span>Negative prompt (optional)</span>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="What to avoid in the image"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Shrekify"}
        </button>
      </form>

      {error && <div className="alert alert--error">{error}</div>}

      {result && (
        <div className="result">
          <div className="result__meta">
            <h2>Result</h2>
            {usedFallback !== null && (
              <span className="badge">
                {usedFallback ? "Fallback filter" : "Diffusion model"}
              </span>
            )}
          </div>
          <img
            src={`data:image/png;base64,${result}`}
            alt="Shrekified output"
            className="result__image"
          />
        </div>
      )}
    </div>
  );
}

export default App;
