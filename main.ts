import { Controller } from "./controller.ts";
import { UI } from "./ui.ts";

const controller = new Controller();
const ui = new UI(controller);
controller.startStream();
const result = await ui.execute();
if (result == null) {
  Deno.exit(1);
}
console.log(result);
