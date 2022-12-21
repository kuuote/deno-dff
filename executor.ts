import * as MsgType from "./msgtype.ts";
import { Message } from "./msgtype.ts";
import { TextLineStream } from "https://deno.land/std@0.167.0/streams/text_line_stream.ts";

const worker = self as unknown as Worker;

const buffer: string[] = [];

worker.addEventListener("message", async (e) => {
  if (MsgType.isFilter(e.data)) {
    const { input } = e.data;
    worker.postMessage({
      type: "filterResult",
      result: buffer.filter((l) => l.includes(input)),
    } satisfies Message);
  }
  if (MsgType.isStartStream(e.data)) {
    let readable: ReadableStream<Uint8Array>;
    if (!Deno.isatty(Deno.stdin.rid)) {
      readable = Deno.stdin.readable;
    } else {
      readable = Deno.run({
        cmd: ["sh", "-c", Deno.args[0] ?? "find"],
        stdin: "null",
        stdout: "piped",
        stderr: "null",
      }).stdout.readable;
    }
    const lines = readable
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream());
    for await (const line of lines) {
      buffer.push(line);
    }
    worker.postMessage({
      type: "endStream",
    } satisfies Message);
  }
});
