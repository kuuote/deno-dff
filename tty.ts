function quit() {
  Deno.stdin.setRaw(false);
  Deno.exit(0);
}
Deno.addSignalListener("SIGINT", quit);
Deno.stdin.setRaw(true);
await Deno.stdin.readable.pipeTo(Deno.stdout.writable).catch(quit);
quit();
