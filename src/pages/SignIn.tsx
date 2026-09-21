import { useNavigate } from 'react-router-dom';
import { signIn } from '../content/existingClientFlow';
import { actions } from '../state/store';
import { Page, V0Note, btn, inputCls } from '../components/ui';

export function SignIn() {
  const navigate = useNavigate();
  const go = () => {
    actions.signIn();
    navigate('/dashboard', { replace: true });
  };

  return (
    <Page>
      <div className="mx-auto max-w-sm">
        <h1 className="text-[26px] font-semibold tracking-tight">{signIn.title}</h1>
        <V0Note>{signIn.mockNote}</V0Note>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            go();
          }}
        >
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[14px] font-medium">
              Email
            </label>
            <input id="email" type="email" autoComplete="username" className={inputCls} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-[14px] font-medium">
              Password
            </label>
            <input id="password" type="password" autoComplete="current-password" className={inputCls} />
          </div>
          <button type="submit" className={`${btn.primary} w-full`}>
            Sign in
          </button>
        </form>
        <div className="my-5 flex items-center gap-3 text-[13px] text-neutral-500">
          <span className="h-px flex-1 bg-neutral-200" /> or <span className="h-px flex-1 bg-neutral-200" />
        </div>
        <button type="button" className={`${btn.secondary} w-full`} onClick={go}>
          {signIn.demoLabel}
        </button>
      </div>
    </Page>
  );
}
