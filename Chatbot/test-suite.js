import worker from './worker.js';
import { KNOWLEDGE_BASE } from './knowledge-base.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`[PASS] ${message}`);
        passed++;
    } else {
        console.error(`[FAIL] ${message}`);
        failed++;
    }
}

async function runTests() {
    console.log("=== Running UCODE AI Concierge Test Suite ===\n");

    // 1. OPTIONS CORS Preflight
    {
        const req = new Request("https://worker.local/", { method: "OPTIONS" });
        const res = await worker.fetch(req, {});
        assert(res.status === 204, "OPTIONS returns HTTP 204");
        assert(res.headers.get("Access-Control-Allow-Origin") === "*", "CORS Allow-Origin is *");
    }

    // 2. GET Health Check
    {
        const req = new Request("https://worker.local/", { method: "GET" });
        const res = await worker.fetch(req, {});
        assert(res.status === 200, "GET returns HTTP 200");
        const text = await res.text();
        assert(text.includes("UCODE Official AI Concierge API is live!"), "GET returns live health message");
    }

    // 3. POST with Missing API Key
    {
        const req = new Request("https://worker.local/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ history: [{ role: "user", parts: [{ text: "Hello" }] }] })
        });
        const res = await worker.fetch(req, {});
        assert(res.status === 500, "Missing API key returns HTTP 500");
        const data = await res.json();
        assert(data.error.includes("not configured correctly"), "Clear error message for missing API key");
    }

    // 4. POST with Malformed JSON
    {
        const req = new Request("https://worker.local/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "invalid-json{{{"
        });
        const res = await worker.fetch(req, { GEMINI_API_KEY: "test-key" });
        assert(res.status === 400, "Malformed JSON returns HTTP 400");
        const data = await res.json();
        assert(data.error.includes("Invalid request format"), "Handles malformed JSON safely");
    }

    // 5. POST with Invalid History
    {
        const req = new Request("https://worker.local/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ history: "not-an-array" })
        });
        const res = await worker.fetch(req, { GEMINI_API_KEY: "test-key" });
        assert(res.status === 400, "Invalid history structure returns HTTP 400");
    }

    // 6. Knowledge Base Verification
    {
        assert(Array.isArray(KNOWLEDGE_BASE) && KNOWLEDGE_BASE.length >= 80, `Knowledge base loaded with ${KNOWLEDGE_BASE.length} chunks`);
        
        const pricingChunk = KNOWLEDGE_BASE.find(c => c.id === 'pricing_packages_core');
        assert(pricingChunk && pricingChunk.content_text.includes("LKR 20,000") && pricingChunk.content_text.includes("LKR 30,000"), "Knowledge base contains exact verified pricing figures (LKR 20,000 & LKR 30,000)");

        const founderChunk = KNOWLEDGE_BASE.find(c => c.id === 'about_founders_leadership');
        assert(founderChunk && founderChunk.content_text.includes("Abdullah Arshad") && founderChunk.content_text.includes("Umar Hunais"), "Knowledge base contains verified founders (Abdullah Arshad & Umar Hunais)");

        const contactChunk = KNOWLEDGE_BASE.find(c => c.id === 'contact_official_details');
        assert(contactChunk && contactChunk.content_text.includes("+94 76 059 5115") && contactChunk.content_text.includes("ucodelk26@gmail.com"), "Knowledge base contains verified WhatsApp (+94 76 059 5115) and email");

        const termsChunk = KNOWLEDGE_BASE.find(c => c.id === 'terms_legal_policies');
        assert(termsChunk && termsChunk.content_text.includes("50% upfront deposit") && termsChunk.content_text.includes("5 business days"), "Knowledge base contains verified payment terms and feedback timeline");
    }

    // 7. Mocked Gemini Pipeline Verification (Full RAG to Gemini prompt generation)
    {
        let capturedSystemPrompt = "";
        let capturedContents = null;

        // Mock global fetch for Gemini API call
        const originalFetch = globalThis.fetch;
        globalThis.fetch = async (url, options) => {
            if (typeof url === 'string' && url.includes("googleapis.com")) {
                const body = JSON.parse(options.body);
                capturedSystemPrompt = body.system_instruction?.parts?.[0]?.text || "";
                capturedContents = body.contents;

                return new Response(JSON.stringify({
                    candidates: [{
                        content: {
                            parts: [{ text: "The Basic package is LKR 20,000 and the Premium package is LKR 30,000. You can reach UCODE at https://universalcode.site/contact.html." }]
                        }
                    }]
                }), { status: 200, headers: { "Content-Type": "application/json" } });
            }
            return originalFetch(url, options);
        };

        const req = new Request("https://worker.local/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                history: [
                    { role: "user", parts: [{ text: "How much does a website cost?" }] }
                ]
            })
        });

        const res = await worker.fetch(req, { GEMINI_API_KEY: "mock-gemini-key" });
        assert(res.status === 200, "Pipeline returns HTTP 200 with mocked Gemini");
        const data = await res.json();
        assert(data.reply.includes("LKR 20,000"), "Pipeline output contains verified pricing");
        assert(capturedSystemPrompt.includes("VERIFIED KNOWLEDGE BASE"), "System prompt receives injected verified knowledge");
        assert(capturedSystemPrompt.includes("pricing_packages_core") || capturedSystemPrompt.includes("Website Packages & Exact Prices"), "System prompt receives exact retrieved pricing document");

        // Restore fetch
        globalThis.fetch = originalFetch;
    }

    console.log(`\n=== Test Summary: ${passed} Passed, ${failed} Failed ===`);
    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error("Test execution error:", err);
    process.exit(1);
});
