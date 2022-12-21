import * as MsgType from "./msgtype.ts";
import { Message } from "./msgtype.ts";
import { DrawArgs } from "./types.ts";

const Filtered = 0;
const FilterRequested = 1;
const FilterPending = 2;

export class Controller {
  executor: Worker;
  filterStatus = Filtered;
  input = "";
  items: string[] = [];
  uiCallback = (_args: DrawArgs) => {};
  intervalID?: number;

  constructor() {
    this.executor = new Worker(new URL("./executor.ts", import.meta.url), {
      type: "module",
    });
    this.executor.addEventListener("message", (e) => {
      if (MsgType.isFilterResult(e.data)) {
        const stat = this.filterStatus;
        this.filterStatus = Filtered;
        if (stat === FilterPending) {
          this.requestFilter();
        }
        if (e.data.result != null) {
          this.items = e.data.result;
        }
        this.uiCallback({
          input: this.input,
          items: this.items,
        });
      }
    });
  }

  startStream() {
    this.executor.postMessage({
      type: "startStream",
    } satisfies Message);
    this.intervalID = setInterval(() => {
      this.requestFilter();
    }, 100);
    const listener = (e: MessageEvent) => {
      if (MsgType.isEndStream(e.data)) {
        clearInterval(this.intervalID);
        this.executor.removeEventListener("message", listener);
        this.requestFilter();
      }
    };
    this.executor.addEventListener("message", listener);
  }

  requestFilter(input?: string): void {
    if (input != null) {
      this.input = input;
    }
    if (this.filterStatus === Filtered) {
      this.executor.postMessage({
        type: "filter",
        input: this.input,
      } satisfies Message);
      this.filterStatus = FilterRequested;
    } else {
      // defer request to post filter
      this.filterStatus = FilterPending;
    }
  }

  close(): void {
    this.executor.terminate();
    clearInterval(this.intervalID);
  }
}
