import { ClientRequest } from "http";
import { EventEmitter as Emitter } from "events";

type Request = ClientRequest | XMLHttpRequest;
type Emitters = Emitter[];