import { EventEmitter as Emitter } from "events";

type Request = http$ClientRequest | XMLHttpRequest;
type Emitters = events$EventEmitter[];