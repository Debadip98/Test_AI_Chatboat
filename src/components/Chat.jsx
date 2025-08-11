// src/components/Chat.jsx
import React, { useEffect, useRef, useState } from "react";
import { sendMessage } from "../lib/openrouter"; // must call /api/chat on server
import ThemeToggle from "./ThemeToggle";

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "Hi — ask me anything or upload a file." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [file, setFile] = useState(null);
  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Speech-to-text (start)
  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech recognition not supported in this browser.");
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onstart = () => setListening(true);
    r.onresult = (ev) => {
      const txt = ev.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + txt : txt));
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recognitionRef.current = r;
    r.start();
  }

  // speak text
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  // send message (uses sendMessage which calls /api/chat)
  async function handleSend(e) {
    if (e) e.preventDefault();
    const content = input.trim();
    if (!content) return;
    const userMsg = { id: Date.now(), role: "user", content };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      // send conversation or just the latest message (adjust as desired)
      const conv = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const data = await sendMessage(conv); // expects server to return { reply: "..." } or OpenAI-like body
      // support both shapes:
      const reply =
        (data && (data.reply || data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text)) ||
        "Sorry — no reply.";
      const botMsg = { id: Date.now() + 1, role: "assistant", content: reply };
      // give small delay for typing illusion
      setTimeout(() => {
        setMessages((m) => [...m, botMsg]);
        speak(reply);
        setTyping(false);
      }, 700);
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { id: Date.now() + 2, role: "assistant", content: "Error: " + (err.message || err) }]);
      setTyping(false);
    }
  }

  // handle selected file (upload uses FileUpload or directly to supabase in other component)
  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setMessages((m) => [...m, { id: Date.now(), role: "user", content: `📎 Uploaded file: ${f.name}` }]);
    // you can upload to Supabase storage here and then send the public URL to the model.
  }

  return (
    <div className="chat-root panel">
      <div className="chat-header">
        <h3 className="chat-title">Assistant</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <ThemeToggle />
        </div>
      </div>

      <div className="chat-window" role="log" aria-live="polite">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`chat-bubble ${m.role === "user" ? "user" : "bot"}`}
            aria-label={`${m.role} message`}
          >
            <div className="bubble-inner">{m.content}</div>
          </div>
        ))}

        {typing && (
          <div className="chat-bubble bot typing" aria-hidden="true">
            <div className="bubble-inner">
              <div className="typing-dots" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <form className="chat-controls" onSubmit={handleSend} aria-label="Message composer">
        <label htmlFor="fileInput" className="file-btn" title="Attach file">
          📎
        </label>
        <input id="fileInput" type="file" className="hidden-input" onChange={onFileChange} />

        <button
          type="button"
          className={`mic-btn ${listening ? "listening" : ""}`}
          onClick={startListening}
          aria-pressed={listening}
          aria-label="Start voice input"
        >
          🎤
        </button>

        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message or use the mic..."
          aria-label="Message input"
        />

        <button type="submit" className="send-btn" aria-label="Send message">
          Send
        </button>
      </form>
    </div>
  );
}
