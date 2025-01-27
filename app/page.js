import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Link href="sign-in">
        <Button variant="primary">Sign In</Button>
      </Link>
      <Link href="sign-up">
        <Button variant="secondary">Sign Up</Button>
      </Link>
    </div>
  );
}
