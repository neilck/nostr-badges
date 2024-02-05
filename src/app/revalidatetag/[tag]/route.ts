import { revalidateTag } from "next/cache";
import * as nip19 from "@/nostr-tools/nip19";

export async function GET(
  request: Request,
  { params }: { params: { tag: string } }
) {
  const tag = params.tag;

  revalidateTag(tag);

  let decodeResult: nip19.DecodeResult | undefined = undefined;

  // revalidate fetch by addressPointer as well
  try {
    decodeResult = nip19.decode(tag);
    if (decodeResult.type == "naddr") {
      const data = decodeResult.data;
      const addressPointer = `${data.kind}:${data.pubkey}:${data.identifier}`;
      revalidateTag(addressPointer);
    }
  } catch {
    // swallow error as may not be naddr
  }

  return new Response("OK", { status: 200 });
}
