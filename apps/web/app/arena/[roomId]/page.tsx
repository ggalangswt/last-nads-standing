export const dynamic = "force-dynamic";

import { Arena } from "@/components/figma/arena";
import { Spectate } from "@/components/figma/spectate";

export default async function ArenaPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { roomId } = await params;
  const { mode } = await searchParams;

  return mode === "spectate" ? <Spectate roomId={roomId} /> : <Arena roomId={roomId} />;
}
