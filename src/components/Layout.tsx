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
    // Breezzy's floating pill nav: a white bar with an ink outline over the page.
    <header className="sticky top-0 z-20 px-3 pt-3 sm:px-6">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 rounded-2xl border border-ink bg-white px-3 sm:px-4">
        <Link to={signedIn ? '/dashboard' : '/'} className="flex min-w-0 items-center gap-2.5">
          <LogoMark />
          <span className="display whitespace-nowrap text-[24px] leading-none">Future You</span>
          <span className="hidden border-l border-ink pl-2.5 text-[13px] whitespace-nowrap text-neutral-700 sm:inline">by $RUs</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {!signedIn && hasPlan && pathname !== '/plan' && (
            <Link
              to="/plan"
              className="rounded-lg px-2 py-2 text-[14px] font-medium whitespace-nowrap text-ink underline-offset-4 hover:underline"
            >
              My Plan
            </Link>
          )}
          <Link
            to={talkTo}
            className="press inline-flex items-center gap-1.5 rounded-xl border border-ink bg-accent-fill px-3 py-2 text-[14px] font-medium whitespace-nowrap text-ink shadow-hard-sm sm:px-3.5"
          >
            <PersonIcon width={16} height={16} />
            Talk to a person
          </Link>
        </nav>
      </div>
    </header>
  );
}

// Diagonal stripes echo Breezzy's mark without copying it: a plain signifier for the app.
function LogoMark() {
  return (
    <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink bg-lime">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <path d="M3 11 9 5M7 15l8-8M12 16l3-3" />
      </svg>
    </span>
  );
}

// Feature 8 (A2, A5): the moment the advisor is slow or down, every page says so.
function ServiceBanner() {
  const status = useAppState((s) => s.serviceStatus);
  if (status === 'ok') return null;
  const copy = serviceStatus[status];
  return (
    <div role="status" className="px-3 pt-3 sm:px-6">
      <div className="mx-auto flex max-w-3xl gap-2.5 rounded-2xl border border-ink bg-sun-50 px-4 py-2.5 text-[14px]">
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
    <footer className="border-t border-ink bg-white">
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
    // Chat screens are exactly one viewport tall; the thread scrolls inside.
    <div className={`flex flex-col ${isChat ? 'h-dvh' : 'min-h-dvh'}`}>
      <Header />
      {/* Chat screens show the status in their own header and tray. */}
      {!isChat && <ServiceBanner />}
      <div className={`flex-1 ${isChat ? 'min-h-0' : ''}`}>
        <Outlet />
      </div>
      {!isChat && <Footer />}
      <DevPanel />
    </div>
  );
}
