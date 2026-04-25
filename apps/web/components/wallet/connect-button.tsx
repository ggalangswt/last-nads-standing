"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

type WalletConnectButtonProps = {
  className?: string;
};

export function WalletConnectButton({ className = "" }: WalletConnectButtonProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const buttonClassName =
    `inline-flex items-center justify-center rounded-[10px] bg-[#6e56f9] px-4 text-white ` +
    `shadow-[0_0_20px_rgba(110,86,249,0.35)] transition-colors hover:bg-[#7d67ff] ` +
    `disabled:cursor-not-allowed disabled:opacity-50 ${className}`;

  if (isConnected) {
    return (
      <button className={buttonClassName} onClick={() => disconnect()} type="button">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    );
  }

  const injectedConnector = connectors[0];

  return (
    <button
      className={buttonClassName}
      disabled={!injectedConnector || isPending}
      onClick={() => {
        if (injectedConnector) {
          connect({ connector: injectedConnector });
        }
      }}
      style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 600 }}
      type="button"
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
