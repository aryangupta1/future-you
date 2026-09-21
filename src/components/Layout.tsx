import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAppState } from '../state/store';
import { AlertIcon, PersonIcon } from './icons';
import { serviceStatus } from '../content/service';
import { DevPanel, toggleDevPanel } from './DevPanel';

// Rule 4: "Talk to a person" is visible on every page, in teal.
// Signed-in clients go straight to their own adviser.
function Header() {
  const signedIn = useAppState((s) => s.signedIn);
  const hasPlan = useAppState((s) => s.plan !== null);
  const { pathname } = useLocation();
  const talkTo = signedIn ? '/ask-adviser' : '/talk';

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to={signedIn ? '/dashboard' : '/'} className="flex min-w-0 items-baseline gap-1.5">
          <span className="whitespace-nowrap text-[16px] font-semibold tracking-tight">Future You</span>
          <span className="hidden whitespace-nowrap text-[13px] text-neutral-600 sm:inline">by $RUs</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {!signedIn && hasPlan && pathname !== '/plan' && (
            <Link to="/plan" className="whitespace-nowrap rounded-lg px-2 py-2 text-[14px] font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950">
              My Plan
            </Link>
          )}
          <Link
            to={talkTo}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-3 py-2 text-[14px] sm:px-3.5 font-medium text-white hover:bg-accent-dark"
          >
            <PersonIcon width={16} height={16} />
            Talk to a person
          </Link>
        </nav>
      </div>
    </header>
  );
}

// Feature 8 (A2, A5): the moment the advisor is slow or down, every page says so.
function ServiceBanner() {
  const status = useAppState((s) => s.serviceStatus);
  if (status === 'ok') return null;
  const copy = serviceStatus[status];
  return (
    <div role="status" className="border-b border-neutral-300 bg-neutral-100">
      <div className="mx-auto flex max-w-3xl gap-2.5 px-4 py-2.5 text-[14px] sm:px-6">
        <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
        <p>
          <span className="font-semibold">{copy.banner}.</span> {copy.detail}
        </p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-200">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-[12px] text-neutral-600 sm:px-6">
        <p>General information only, not personal advice. v0 prototype: nothing is sent anywhere.</p>
        <div className="flex gap-4">
          <Link to="/staff" className="underline underline-offset-2 hover:text-neutral-950">
            $RUs staff view
          </Link>
          <button type="button" onClick={toggleDevPanel} className="underline underline-offset-2 hover:text-neutral-950">
            Dev panel (D)
          </button>
        </div>
      </div>
    </footer>
  );
}

const CHAT_ROUTES = ['/chat', '/client-chat'];

export function Layout() {
  // Chat screens fill the viewport like a messaging app, so no footer there.
  const isChat = CHAT_ROUTES.includes(useLocation().pathname);
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      {/* Chat screens are fixed-height and show the status in their own header and tray. */}
      {!isChat && <ServiceBanner />}
      <div className="flex-1">
        <Outlet />
      </div>
      {!isChat && <Footer />}
      <DevPanel />
    </div>
  );
}
