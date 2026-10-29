import { LoginForm } from "@/components/auth";
import { PageHeader, Section } from "@/components/ui";
import type { SignInAction } from "@/lib/auth/form-state";

/** Staff sign-in page. */
export function LoginPage({
  action,
  next,
}: {
  action: SignInAction;
  next?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <PageHeader
        title="Staff sign in"
        lead="Sign in to see the schedule and manage the clinic."
      />
      <Section id="sign-in" title="Password" className="mt-8 card p-5 sm:p-6">
        <LoginForm action={action} next={next} />
      </Section>
    </div>
  );
}
