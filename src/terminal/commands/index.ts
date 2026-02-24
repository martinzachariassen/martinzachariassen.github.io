import { normalizeInput } from "../parseCommand.js";
import { helpHandler } from "./help.js";
import { about } from "./about.js";
import { focus } from "./focus.js";
import { tech } from "./tech/index.js";
import { experience } from "./experience.js";
import { contact, links, openLink } from "./contact.js";
import { whoami, ls, pwd, echo, sudo } from "./system.js";
import { coffee, rm, hack, matrix, secrets } from "./easter.js";
import type { CommandHandler, CommandResult } from "./types.js";

export type { OutputLine, CommandResult, CommandEffect, MatrixEffect, EasterEffect } from "./types.js";

export interface CommandRegistry {
  has(cmd: string): boolean;
  run(cmd: string, args: string[]): CommandResult;
  normalizeInput(s: string): string;
}

export function createCommandRegistry(): CommandRegistry {
  const handlers = new Map<string, CommandHandler>();

  handlers.set("whoami",     () => whoami());
  handlers.set("ls",         (args) => ls(args));
  handlers.set("pwd",        () => pwd());
  handlers.set("about",      () => about());
  handlers.set("focus",      () => focus());
  handlers.set("tech",       () => tech());
  handlers.set("experience", () => experience());
  handlers.set("contact",    () => contact());
  handlers.set("links",      () => links());
  handlers.set("open",       (args) => openLink(args));
  handlers.set("echo",       (args) => echo(args));
  handlers.set("sudo",       (args) => sudo(args));
  handlers.set("coffee",     () => coffee());
  handlers.set("rm",         (args) => rm(args));
  handlers.set("hack",       () => hack());
  handlers.set("matrix",     (args) => matrix(args));
  handlers.set("secrets",    (args) => secrets(args));

  // help needs the handlers map to exist first (for future dynamic listing)
  handlers.set("help", helpHandler());

  return {
    has(cmd: string): boolean {
      return handlers.has(cmd);
    },
    run(cmd: string, args: string[]): CommandResult {
      const h = handlers.get(cmd);
      if (!h) return { lines: [] };
      return h(args);
    },
    normalizeInput,
  };
}


