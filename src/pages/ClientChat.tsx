import { Link, useNavigate } from 'react-router-dom';
import { Chat } from '../components/Chat';
import { ArrowLeftIcon } from '../components/icons';
import { adviser, existingClientFlow } from '../content/existingClientFlow';
import { lastQuestion } from '../engine/engine';
import { getState } from '../state/store';

export function ClientChat() {
  const navigate = useNavigate();
  return (
    <main>
      <h1 className="sr-only">Ask the AI a general question</h1>
      <Chat
        flow={existingClientFlow}
        chatKey="existingClient"
        startNote={`Your plan and ${adviser.firstName}'s advice stay exactly as recorded`}
        leading={
          <Link
            to="/dashboard"
            aria-label="Back to my dashboard"
            className="-ml-2 rounded-full p-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
          >
            <ArrowLeftIcon width={20} height={20} />
          </Link>
        }
        onNavigate={() =>
          navigate('/ask-adviser', {
            state: { question: lastQuestion(existingClientFlow, getState().chats.existingClient.thread) },
          })
        }
      />
    </main>
  );
}
