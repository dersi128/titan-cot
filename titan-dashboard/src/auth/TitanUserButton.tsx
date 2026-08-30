import { UserButton } from "@clerk/clerk-react";
import { hasClerkPublishableKey } from "./TitanAuthGate";

export function TitanUserButton() {
  if (!hasClerkPublishableKey()) return null;
  return <UserButton afterSignOutUrl="/" />;
}
