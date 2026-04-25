"use client";

import { useState } from "react";

type WalletConnectButtonProps = {
  className?: string;
};

const MOCK_ADDRESS = "0x3516...AA3C";

export function WalletConnectButton({ className = "" }: WalletConnectButtonProps) {
  const [connected, setConnected] = useState(false);
  const buttonClassName =
    `inline-flex items-center justify-center rounded-[10px] bg-[#6e56f9] px-4 text-white ` +
    `shadow-[0_0_20px_rgba(110,86,249,0.35)] transition-colors hover:bg-[#7d67ff] ` +
    `disabled:cursor-not-allowed disabled:opacity-50 ${className}`;

  return (
    <button
      className={buttonClassName}
      onClick={() => setConnected((current) => !current)}
      style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 600 }}
      type="button"
    >
      {connected ? MOCK_ADDRESS : "Connect Wallet"}
    </button>
  );
}
