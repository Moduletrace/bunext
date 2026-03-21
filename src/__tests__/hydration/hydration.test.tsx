import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import React, { useState } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { GlobalWindow } from "happy-dom";

// A mock application component to test hydration
function App() {
    const [count, setCount] = useState(0);
    return (
        <div id="app-root">
            <h1>Test Hydration</h1>
            <p data-testid="count">Count: {count}</p>
            <button data-testid="btn" onClick={() => setCount(c => c + 1)}>Increment</button>
        </div>
    );
}

describe("React Hydration", () => {
    let window: GlobalWindow;
    let document: any;

    beforeEach(() => {
        window = new GlobalWindow();
        document = window.document;
        global.window = window as any;
        global.document = document as any;
        global.navigator = { userAgent: "node.js" } as any;
    });

    afterEach(() => {
        // Clean up global mocks
        delete (global as any).window;
        delete (global as any).document;
        delete (global as any).navigator;
        window.close();
    });

    test("hydrates a server-rendered component and binds events", async () => {
        // 1. Server-side render
        const html = renderToString(<App />);
        
        // 2. Setup DOM as it would be delivered to the client
        document.body.innerHTML = `<div id="root">${html}</div>`;
        const rootNode = document.getElementById("root");

        // 3. Hydrate
        let hydrateError = null;
        try {
            await new Promise((resolve) => {
                hydrateRoot(rootNode, <App />, {
                    onRecoverableError: (err) => {
                        hydrateError = err;
                    }
                });
                setTimeout(resolve, 50); // let React finish hydration
            });
        } catch (e) {
            hydrateError = e;
        }

        // Verify no hydration errors
        expect(hydrateError).toBeNull();
        
        // 4. Verify client-side interactivity
        const button = document.querySelector('[data-testid="btn"]');
        const countText = document.querySelector('[data-testid="count"]');
        
        expect(countText.textContent).toBe("Count: 0");
        
        // Simulate click
        button.dispatchEvent(new window.Event("click", { bubbles: true }));
        
        // Let async state updates process
        await new Promise(r => setTimeout(r, 50));
        
        expect(countText.textContent).toBe("Count: 1");
    });
});
