import React, { useState } from 'react';
import { sendMessage } from '../lib/openrouter';

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful assistant.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: 'user', content: input }
    ];

    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const data = await sendMessage(newMessages);
      const reply = data?.choices?.[0]?.message?.content || 'No response';

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: reply }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Error getting response.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              backgroundColor: msg.role === 'user' ? '#DCF8C6' : '#E5E5EA',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div style={styles.loading}>Thinking...</div>}
      </div>
      <div style={styles.inputBox}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={styles.input}
        />
        <button onClick={handleSend} style={styles.button}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: 20,
    fontFamily: 'Arial, sans-serif'
  },
  chatBox: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '10px'
  },
  message: {
    padding: '10px',
    borderRadius: '10px',
    maxWidth: '60%',
    wordWrap: 'break-word'
  },
  loading: {
    fontStyle: 'italic',
    color: '#666'
  },
  inputBox: {
    display: 'flex',
    gap: '8px'
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer'
  }
};
