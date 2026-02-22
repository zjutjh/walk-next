import { get } from "lodash-es";

export function unknownToError(err: unknown): Error | undefined {
  if (!err) {
    return undefined;
  } else if (err instanceof Error) {
    return err;
  }
  const message = get(err, ["message"]) ?? JSON.stringify(err);
  return new Error(message);
}
