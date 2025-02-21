import { Button } from "@/components/ui/button";
import { signIn } from "@/auth";

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <Button
        onClick={() => {
          "use server";
          signIn("github");
        }}
      >
        Sign in with GitHub
      </Button>
    </div>
  );
}
