import { Controller } from "./controller.ts";
import { getInput } from "./input.ts";
import { print, setAlternateBuffer } from "./screen.ts";
import { DrawArgs } from "./types.ts";

function draw({ input, items }: DrawArgs) {
  const size = Deno.consoleSize();
  const display = items.slice(0, size.rows - 1).reverse();
  let view: string[] = [];
  view.push("\x1b[?25l");
  if (display.length < size.rows) {
    view.push("\n".repeat(size.rows - display.length));
  }
  for (const line of display) {
    view.push(line, "\n");
  }
  view.push("> ", input);
  view.push("\x1b[?25h");
  view = view.join("").split("\n").map((line, idx) =>
    "\x1b[" + idx + "H" + line + "\x1b[K"
  );
  print(view.join(""));
}

export class UI {
  controller: Controller;
  input = "";
  stream = getInput();
  closed = false;

  constructor(controller: Controller) {
    this.controller = controller;
    this.controller.uiCallback = draw;
  }

  async close(): Promise<void> {
    this.controller.close();
    await this.stream.close();
    this.closed = true;
  }

  async execute(): Promise<string | null> {
    if (this.closed) {
      throw Error("can't call twice");
    }
    try {
      setAlternateBuffer(true);
      for await (const c of this.stream.readable) {
        if (c === "\x03") {
          break;
        }
        if (c === "\x08" || c === "\x7f") {
          if (this.input === "") {
            continue;
          }
          this.input = this.input.slice(0, -1);
        } else if (c === "\x0d") {
          return this.controller.items[0];
        } else {
          this.input += c;
        }
        this.controller.requestFilter(this.input);
      }
    } finally {
      await this.close();
      setAlternateBuffer(false);
    }
    return null;
  }
}
