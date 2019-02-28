declare module "yargs" {
  type Argv = {
    _: Array<string>,
    $0: string,
    [field: string]: any
  };

  type Options = Partial<{
    alias: string | Array<string>,
    array: boolean,
    boolean: boolean,
    choices: Array<number | string | boolean | symbol | object>,
    coerce: (arg: number | string | boolean | symbol | object) => number | string | boolean | symbol | object,
    config: boolean,
    configParser: (configPath: string) => {
      [field: string]: any
    },
    conflicts: string | {
      [field: string]: any
    },
    count: boolean,
    default: number | string | boolean | symbol | object,
    defaultDescription: string,
    demandOption: boolean | string,
    desc: string,
    describe: string,
    description: string,
    global: boolean,
    group: string,
    implies: string | {
      [field: string]: any
    },
    nargs: number,
    normalize: boolean,
    number: boolean,
    requiresArg: boolean,
    skipValidation: boolean,
    string: boolean,
    type: "array" | "boolean" | "count" | "number" | "string",
    [field: string]: any
  }>;

  type CommonModuleObject = {
    command?: string | Array<string>,
    aliases?: Array<string> | string,
    builder?: {
      [field: string]: any
    } | ((yargsInstance: Yargs) => number | string | boolean | symbol | object),
    handler?: (argv: Argv) => void
  };

  type ModuleObjectDesc = {
    desc?: string | false
  };

  type ModuleObjectDescribe = {
    describe?: string | false
  };

  type ModuleObjectDescription = {
    description?: string | false
  };

  type ModuleObject = ModuleObjectDesc | ModuleObjectDescribe | ModuleObjectDescription;

  class Yargs {
    alias(key: string, alias: string): this;

    alias(
      alias: {
        [field: string]: any
      }
    ): this;

    argv: Argv;
    array(key: string | Array<string>): this;
    boolean(paramter: string | Array<string>): this;
    check(fn: (argv: Argv, options: Array<string>) => boolean | null | undefined): this;
    choices(key: string, allowed: Array<string>): this;

    choices(
      allowed: {
        [field: string]: any
      }
    ): this;

    coerce(
      key: string,
      fn: (value: any) => number | string | boolean | symbol | object
    ): this;

    coerce(
      object: {
        [field: string]: any
      }
    ): this;

    coerce(
      keys: Array<string>,
      fn: (value: any) => number | string | boolean | symbol | object
    ): this;

    command(
      cmd: string | Array<string>,
      desc: string | false,
      builder?: {
        [field: string]: any
      } | ((yargsInstance: Yargs) => number | string | boolean | symbol | object),
      handler?: Function
    ): this;

    command(cmd: string | Array<string>, desc: string | false, module: ModuleObject): this;
    command(module: ModuleObject): this;

    completion(
      cmd: string,
      description?: string,
      fn?: (current: string, argv: Argv, done: (competion: Array<string>) => void) => Array<string> | Promise<Array<string>> | null | undefined
    ): this;

    config(
      key?: string,
      description?: string,
      parseFn?: (configPath: string) => {
        [field: string]: any
      }
    ): this;

    config(
      key: string,
      parseFn?: (configPath: string) => {
        [field: string]: any
      }
    ): this;

    config(
      config: {
        [field: string]: any
      }
    ): this;

    conflicts(key: string, value: string | Array<string>): this;

    conflicts(
      keys: {
        [field: string]: any
      }
    ): this;

    count(name: string): this;

    default(
      key: string,
      value: number | string | boolean | symbol | object,
      description?: string
    ): this;

    default(
      defaults: {
        [field: string]: any
      }
    ): this;

    demand(key: string, msg?: string | boolean): this;
    demand(count: number, max?: number, msg?: string | boolean): this;
    demandOption(key: string | Array<string>, msg?: string | boolean): this;
    demandCommand(min: number, minMsg?: string): this;
    demandCommand(min: number, max: number, minMsg?: string, maxMsg?: string): this;
    describe(key: string, description: string): this;

    describe(
      describeObject: {
        [field: string]: any
      }
    ): this;

    detectLocale(shouldDetect: boolean): this;
    env(prefix?: string): this;
    epilog(text: string): this;
    epilogue(text: string): this;
    example(cmd: string, desc: string): this;
    exitProcess(enable: boolean): this;

    fail(
      fn: (failureMessage: string, err: Error, yargs: Yargs) => number | string | boolean | symbol | object
    ): this;

    getCompletion(args: Array<string>, fn: () => void): this;
    global(globals: string | Array<string>, isGlobal?: boolean): this;
    group(key: string | Array<string>, groupName: string): this;
    help(option?: string, desc?: string): this;
    implies(key: string, value: string | Array<string>): this;

    implies(
      keys: {
        [field: string]: any
      }
    ): this;

    locale(
      locale: "de" | "en" | "es" | "fr" | "hi" | "hu" | "id" | "it" | "ja" | "ko" | "nb" | "pirate" | "pl" | "pt" | "pt_BR" | "ru" | "th" | "tr" | "zh_CN"
    ): this;

    locale(): string;
    nargs(key: string, count: number): this;
    normalize(key: string): this;
    number(key: string | Array<string>): this;
    option(key: string, options?: Options): this;

    option(
      optionMap: {
        [field: string]: any
      }
    ): this;

    options(key: string, options?: Options): this;

    options(
      optionMap: {
        [field: string]: any
      }
    ): this;

    parse(
      args?: string | Array<string>,
      context?: {
        [field: string]: any
      },
      parseCallback?: (err: Error, argv: Argv, output?: string) => void
    ): Argv;

    parse(
      args?: string | Array<string>,
      parseCallback?: (err: Error, argv: Argv, output?: string) => void
    ): Argv;

    pkgConf(key: string, cwd?: string): this;
    recommendCommands(): this;
    require(key: string, msg: string | boolean): this;
    require(count: number, max?: number, msg?: string | boolean): this;
    requiresArg(key: string | Array<string>): this;
    reset(): this;
    showCompletionScript(): this;
    showHelp(consoleLevel?: "error" | "warn" | "log"): this;
    showHelpOnFail(enable: boolean, message?: string): this;
    strict(): this;
    skipValidation(key: string): this;
    strict(global?: boolean): this;
    string(key: string | Array<string>): this;

    updateLocale(
      obj: {
        [field: string]: any
      }
    ): this;

    updateStrings(
      obj: {
        [field: string]: any
      }
    ): this;

    usage(
      message: string,
      opts?: {
        [field: string]: any
      }
    ): this;

    version(): this;
    version(version: string): this;
    version(option: string | (() => string), version: string): this;

    version(
      option: string | (() => string),
      description: string | (() => string),
      version: string
    ): this;

    wrap(columns: number | null): this;
  }

  export = Yargs
}