/** Designates a verified event signature. */
export const verifiedSymbol = Symbol("verified");

export interface Event<K extends number = number> {
  kind: K;
  tags: string[][];
  content: string;
  created_at: number;
  pubkey: string;
  id: string;
  sig: string;
  [verifiedSymbol]?: boolean;
}

export type UnsignedEvent<K extends number = number> = Pick<
  Event<K>,
  "kind" | "tags" | "content" | "created_at" | "pubkey"
>;

/** An event whose signature has been verified. */
export interface VerifiedEvent<K extends number = number> extends Event<K> {
  [verifiedSymbol]: true;
}
