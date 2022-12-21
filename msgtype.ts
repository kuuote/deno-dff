// deno-lint-ignore-file no-explicit-any

export type Filter = {
  type: "filter";
  input: string;
};

export function isFilter(x: any): x is Filter {
  return x?.type === "filter";
}

export type FilterResult = {
  type: "filterResult";
  result?: string[];
};

export function isFilterResult(x: any): x is FilterResult {
  return x?.type === "filterResult";
}

export type StartStream = {
  type: "startStream";
};

export function isStartStream(x: any): x is StartStream {
  return x?.type === "startStream";
}

export type EndStream = {
  type: "endStream";
};

export function isEndStream(x: any): x is EndStream {
  return x?.type === "endStream";
}

export type Message =
  | Filter
  | FilterResult
  | StartStream
  | EndStream;
