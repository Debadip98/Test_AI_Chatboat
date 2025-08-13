export default function MessageBubble({ role, text, thinking }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow
          ${isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'}
        `}
      >
        {!thinking ? (
          <span>{text}</span>
        ) : (
          <span className="inline-flex gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block animate-bounce [animation-delay:.15s]"></span>
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block animate-bounce [animation-delay:.3s]"></span>
          </span>
        )}
      </div>
    </div>
  )
}
