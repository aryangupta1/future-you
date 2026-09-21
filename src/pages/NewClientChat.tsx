import { useNavigate } from 'react-router-dom';
import { Chat } from '../components/Chat';
import { newClientFlow, planTemplate } from '../content/newClientFlow';

export function NewClientChat() {
  const navigate = useNavigate();
  return (
    <main className="h-full">
      <h1 className="sr-only">Chat with the Future You digital advisor</h1>
      <Chat
        flow={newClientFlow}
        chatKey="newClient"
        planTemplate={planTemplate}
        startNote="Anonymous chat · nothing is shared unless you choose"
        onNavigate={(action) => navigate(action === 'savePlan' || action === 'openPlan' ? '/plan' : '/talk')}
      />
    </main>
  );
}
