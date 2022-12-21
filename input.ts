export type Input = {
  readable: ReadableStream<string>;
  close: () => Promise<void>;
};

export function getInput(): Input {
  const tty = Deno.openSync(
    Deno.build.os === "windows" ? "CONIN$" : "/dev/tty",
  );
  const p = Deno.run({
    cmd: ["deno", "run", new URL("./tty.ts", import.meta.url).pathname],
    stdin: tty.rid,
    stdout: "piped",
  });
  return {
    readable: p.stdout.readable.pipeThrough(new TextDecoderStream()),
    close: async () => {
      p.kill("SIGINT");
      await p.status();
      tty.close();
    },
  };
}
