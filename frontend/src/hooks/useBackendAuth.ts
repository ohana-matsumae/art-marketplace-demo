import { useCallback, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { BACKEND_URL, getErrorMessage } from "../lib/backend";

type MeResponse = {
  address: string;
};

type NonceResponse = {
  message: string;
};

type VerifyResponse = {
  address: string;
};

export function useBackendAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const ensureAuthenticated = useCallback(async () => {
    if (!isConnected || !address) {
      throw new Error("Connect wallet first");
    }

    setIsAuthenticating(true);
    try {
      const meResponse = await fetch(`${BACKEND_URL}/auth/me`, {
        credentials: "include",
      });

      if (meResponse.ok) {
        const meData = (await meResponse.json()) as MeResponse;
        if (meData.address.toLowerCase() === address.toLowerCase()) {
          return;
        }

        await fetch(`${BACKEND_URL}/auth/logout`, {
          method: "DELETE",
          credentials: "include",
        });
      }

      const nonceResponse = await fetch(`${BACKEND_URL}/auth/nonce`, {
        credentials: "include",
      });
      if (!nonceResponse.ok) {
        throw new Error(await getErrorMessage(nonceResponse));
      }

      const nonceData = (await nonceResponse.json()) as NonceResponse;
      const signature = await signMessageAsync({ message: nonceData.message });

      const verifyResponse = await fetch(`${BACKEND_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ signature }),
      });
      if (!verifyResponse.ok) {
        throw new Error(await getErrorMessage(verifyResponse));
      }

      const verifyData = (await verifyResponse.json()) as VerifyResponse;
      if (verifyData.address.toLowerCase() !== address.toLowerCase()) {
        throw new Error("Authenticated wallet does not match connected wallet");
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, isConnected, signMessageAsync]);

  return {
    isAuthenticating,
    ensureAuthenticated,
  };
}
