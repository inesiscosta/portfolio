<script lang="ts">
  import type { CommandInfo, DirectoryNode, ExtraCommands } from "one-terminal";
  import { HERO, TERMINAL_FILES } from "#lib/content/hero.ts";
  import { age, SITE } from "#lib/content/site.ts";

  /*
    The terminal's colours are the --terminal-* tokens in app.css, so they follow light and dark mode. The library
    writes them into inline styles, where var() still resolves.
  */
  const BACKGROUND = "var(--terminal-bg)";
  const TEXT = "var(--terminal-text)";
  const PROMPT = "var(--terminal-prompt)";
  const TITLE = "var(--terminal-title)";

  let host: HTMLDivElement;

  const pad = (rows: CommandInfo[]) => {
    const width = Math.max(...rows.map((row) => row.usage.length)) + 3;
    return rows.map((row) => `  ${row.usage.padEnd(width)}${row.description}`);
  };

  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;

  /** Time since SITE.born, e.g. "21 years, 133 days, 4 hours". */
  const uptime = () => {
    const now = new Date();
    const years = age(now);
    const birthday = new Date(SITE.born);
    birthday.setFullYear(birthday.getFullYear() + years);
    const hours = Math.floor((now.getTime() - birthday.getTime()) / 3_600_000);
    return [plural(years, "year"), plural(Math.floor(hours / 24), "day"), plural(hours % 24, "hour")].join(", ");
  };

  const countFiles = (dir: DirectoryNode): number =>
    Object.values(dir.entries).reduce((n, node) => n + (node.kind === "directory" ? countFiles(node) : 1), 0);

  // Giving neofetch `info` replaces all of its default lines, so this rebuilds them with Uptime counted from
  // SITE.born. The getters run each time neofetch does.
  const NEOFETCH_INFO: Record<string, string> = {
    OS: "one-terminal",
    Host: HERO.terminal.hostname,
    Shell: "zsh",
    get Uptime() {
      return uptime();
    },
    get Resolution() {
      return `${window.screen.width}x${window.screen.height}`;
    },
    Files: String(countFiles(TERMINAL_FILES)),
  };

  const COMMANDS: ExtraCommands = {
    // Replaces the built-in help, which also lists keyboard shortcuts and explains pipes and chaining.
    help: {
      usage: "help [command]",
      description: "Show commands, or help for one",
      run: ([name], { commands }) => {
        if (name) {
          const command = commands.find((c) => c.name === name);
          if (!command) return { output: `help: no help topics match '${name}'. Try 'help' to list commands.`, exitCode: 1 };
          const details = COMMANDS[name]?.details;
          return [command.usage, `  ${command.description}`, ...(details ? ["", details] : [])].join("\n");
        }
        const help = commands.find((c) => c.name === "help");
        const builtins = [...(help ? [help] : []), ...commands.filter((c) => c.builtin)];
        const extras = commands.filter((c) => !c.builtin && c.name !== "help");
        return [
          "Commands:",
          ...pad(builtins),
          ...(extras.length ? ["", "More commands:", ...pad(extras)] : []),
          "",
          "Type 'help <command>' for more about a command.",
        ].join("\n");
      },
    },
  };

  // one-terminal is a React component, so it can't prerender with the page: React and the package are
  // loaded in the browser only, as their own chunk, and mounted into `host`. Until then the frame below
  // holds the same size and colour, so nothing shifts.
  $effect(() => {
    let unmount: (() => void) | undefined;
    let cancelled = false;

    Promise.all([import("react"), import("react-dom/client"), import("one-terminal")]).then(
      ([{ createElement }, { createRoot }, { Terminal }]) => {
        if (cancelled) return;
        const root = createRoot(host);
        root.render(
          createElement(Terminal, {
            fileStructure: TERMINAL_FILES,
            username: HERO.terminal.username,
            hostname: HERO.terminal.hostname,
            prompt: HERO.terminal.prompt,
            welcomeMessage: HERO.terminal.welcome,
            neofetch: { info: NEOFETCH_INFO },
            extraCommands: COMMANDS,
            windowChrome: ["mac", { titleBarText: HERO.terminal.title, titleBarTextColor: TITLE, cornerRadius: 10 }],
            theme: [
              "dracula",
              {
                backgroundColor: BACKGROUND,
                textColor: TEXT,
                promptColor: PROMPT,
                cursor: { color: TEXT, shape: "block" },
                fontFamily: "var(--font-mono)",
                fontSize: "0.8125rem",
              },
            ],
            demo: { script: [...HERO.terminal.demo], mode: "type-writer", behavior: "interactive" },
            style: { height: "100%" },
          }),
        );
        unmount = () => root.unmount();
      },
    );

    return () => {
      cancelled = true;
      unmount?.();
    };
  });
</script>

<div class="terminal" bind:this={host}></div>

<style>
  .terminal {
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 10px;
    background: var(--terminal-bg);
    box-shadow:
      0 30px 60px -20px color-mix(in srgb, var(--accent) 35%, transparent),
      0 12px 24px -12px rgb(32 41 56 / 0.35);
  }
</style>
