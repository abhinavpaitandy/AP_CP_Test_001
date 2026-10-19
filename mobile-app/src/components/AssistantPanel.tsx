import { useEffect, useRef, useState } from 'react'
import { ArrowUp, RotateCcw } from 'lucide-react'
import { ThinkingOrb } from 'thinking-orbs'

export type AssistantPhase = 'idle' | 'searching' | 'solving' | 'composing'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'error'
  text: string
  sources?: string[]
}

const phaseLabel: Record<Exclude<AssistantPhase, 'idle'>, string> = {
  searching: 'Reading today’s store data…',
  solving: 'Comparing with last year…',
  composing: 'Writing the answer…',
}

export function AssistantPanel({
  messages,
  phase,
  suggestions,
  offline,
  onSend,
  onRetry,
}: {
  messages: ChatMessage[]
  phase: AssistantPhase
  suggestions: string[]
  offline: boolean
  onSend: (text: string) => void
  onRetry: () => void
}) {
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const busy = phase !== 'idle'

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages.length, phase])

  const submit = (text: string) => {
    if (!text.trim() || busy) return
    onSend(text.trim())
    setDraft('')
  }

  return (
    <section className="assistant" aria-labelledby="assistant-title">
      <header className="assistant-header">
        <ThinkingOrb state={busy ? phase : 'breathing'} size={64} aria-label={busy ? phaseLabel[phase] : 'Store Intelligence is ready'} />
        <div>
          <p className="eyebrow">Store Intelligence</p>
          <h2 id="assistant-title">Ask about today’s store</h2>
          <p className="assistant-note">
            {offline ? 'Offline: answering from data synced at 12:30.' : 'Answers use live sales, traffic, stock and returns data.'}
          </p>
        </div>
      </header>

      <div className="messages" ref={listRef} aria-live="polite" aria-busy={busy}>
        {messages.map((message, index) => (
          <div key={index} className={`message message-${message.role}`}>
            <p>{message.text}</p>
            {message.sources && <p className="message-sources">Based on: {message.sources.join(' · ')}</p>}
            {message.role === 'error' && (
              <button type="button" className="link-button" onClick={onRetry}>
                <RotateCcw size={14} aria-hidden />
                Try again
              </button>
            )}
          </div>
        ))}
        {busy && (
          <div className="message message-assistant message-thinking">
            <ThinkingOrb state={phase} size={20} aria-hidden />
            <p>{phaseLabel[phase]}</p>
          </div>
        )}
      </div>

      <div className="suggestions" aria-label="Suggested questions">
        {suggestions.map((question) => (
          <button key={question} type="button" className="suggestion" onClick={() => submit(question)} disabled={busy}>
            {question}
          </button>
        ))}
      </div>

      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault()
          submit(draft)
        }}
      >
        <label htmlFor="assistant-input" className="visually-hidden">
          Ask the store assistant
        </label>
        <input
          id="assistant-input"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about sales, stock or returns"
          enterKeyHint="send"
          autoComplete="off"
        />
        <button type="submit" className="send-button" disabled={busy || !draft.trim()} aria-label="Send question">
          <ArrowUp size={18} strokeWidth={2.4} aria-hidden />
        </button>
      </form>
    </section>
  )
}
