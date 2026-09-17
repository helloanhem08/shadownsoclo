import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_CONF, exportConf, parseConf, type HeaderRule, type Rewrite, type Rule } from "@/lib/conf";

export type ThemeId = "ink" | "paper" | "mist";
export type AccentId = "silver" | "steel" | "sage";
export type RadiusId = "sharp" | "soft" | "round";
export type DensityId = "compact" | "comfortable";
export type TabId = "home" | "nodes" | "rules" | "look" | "more";

export type NodeItem = {
  id: string;
  name: string;
  proto: string;
  meta: string;
  ping: number;
  group: string;
};

export const NODES: NodeItem[] = [
  { id: "jp1", name: "Tokyo-01", proto: "vless", meta: "reality · jp", ping: 42, group: "vless" },
  { id: "sg1", name: "Singapore-03", proto: "trojan", meta: "tls · sg", ping: 61, group: "trojan" },
  { id: "us1", name: "Los Angeles-2", proto: "vless", meta: "xtls · us", ping: 178, group: "vless" },
  { id: "hk1", name: "Hong Kong-Lite", proto: "ss", meta: "2022 · hk", ping: 38, group: "ss" },
  { id: "de1", name: "Frankfurt-A", proto: "trojan", meta: "tls · de", ping: 214, group: "trojan" },
  { id: "tw1", name: "Taipei-Edge", proto: "vless", meta: "reality · tw", ping: 55, group: "vless" },
];

const demo = parseConf(DEMO_CONF, true);

type StudioState = {
  tab: TabId;
  theme: ThemeId;
  accent: AccentId;
  radius: RadiusId;
  density: DensityId;
  connected: boolean;
  startedAt: number;
  nodeId: string;
  nodeFilter: string;
  ruleFilter: string;
  mitm: boolean;
  rewriteOn: boolean;
  headerOn: boolean;
  traffic: number;
  reqs: number;
  profile: string;
  updateUrl: string;
  rules: Rule[];
  rewrites: Rewrite[];
  headers: HeaderRule[];
  hosts: string[];
  toast: string;
  setTab: (tab: TabId) => void;
  setLook: (p: Partial<Pick<StudioState, "theme" | "accent" | "radius" | "density">>) => void;
  setConnected: (on: boolean) => void;
  setNode: (id: string) => void;
  setNodeFilter: (f: string) => void;
  setRuleFilter: (f: string) => void;
  toggle: (k: "mitm" | "rewriteOn" | "headerOn") => void;
  tick: (dl: number, ul: number) => void;
  addHost: (h: string) => void;
  removeHost: (h: string) => void;
  addRule: (match: string, policy: string) => void;
  clearRules: () => void;
  importText: (text: string) => void;
  setProfile: (name: string, url: string) => void;
  downloadConf: () => void;
  flash: (msg: string) => void;
  currentNode: () => NodeItem;
};

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      tab: "look",
      theme: "ink",
      accent: "silver",
      radius: "soft",
      density: "comfortable",
      connected: false,
      startedAt: 0,
      nodeId: "jp1",
      nodeFilter: "all",
      ruleFilter: "all",
      mitm: demo.mitm,
      rewriteOn: true,
      headerOn: true,
      traffic: 12.4,
      reqs: 0,
      profile: "Sahdownsoclo",
      updateUrl: demo.updateUrl,
      rules: demo.rules,
      rewrites: demo.rewrites,
      headers: demo.headers,
      hosts: demo.hosts,
      toast: "",
      setTab: (tab) => set({ tab }),
      setLook: (p) => set(p),
      setConnected: (on) => set({ connected: on, startedAt: on ? Date.now() : 0 }),
      setNode: (id) => set({ nodeId: id }),
      setNodeFilter: (f) => set({ nodeFilter: f }),
      setRuleFilter: (f) => set({ ruleFilter: f }),
      toggle: (k) => set({ [k]: !get()[k] }),
      tick: (_dl, _ul) =>
        set((s) => ({
          reqs: s.reqs + Math.floor(Math.random() * 4),
          traffic: s.traffic + Math.random() * 0.05,
        })),
      addHost: (h) =>
        set((s) => ({ hosts: [...new Set([...s.hosts, h])] })),
      removeHost: (h) => set((s) => ({ hosts: s.hosts.filter((x) => x !== h) })),
      addRule: (match, policy) =>
        set((s) => ({
          rules: [...s.rules, { match, policy, raw: `${match},${policy}` }],
        })),
      clearRules: () => set({ rules: [] }),
      importText: (text) => {
        const p = parseConf(text, get().mitm, get().updateUrl);
        set({
          rules: p.rules,
          rewrites: p.rewrites,
          headers: p.headers,
          hosts: p.hosts,
          updateUrl: p.updateUrl,
          mitm: p.mitm,
        });
      },
      setProfile: (name, url) => set({ profile: name || "Sahdownsoclo", updateUrl: url }),
      downloadConf: () => {
        const s = get();
        const body = exportConf(s);
        const blob = new Blob([body], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${s.profile || "sahdownsoclo"}.conf`;
        a.click();
      },
      flash: (msg) => {
        set({ toast: msg });
        window.setTimeout(() => {
          if (get().toast === msg) set({ toast: "" });
        }, 2200);
      },
      currentNode: () => NODES.find((n) => n.id === get().nodeId) ?? NODES[0],
    }),
    {
      name: "sahdownsoclo-studio",
      partialize: (s) => ({
        theme: s.theme,
        accent: s.accent,
        radius: s.radius,
        density: s.density,
        nodeId: s.nodeId,
        mitm: s.mitm,
        rewriteOn: s.rewriteOn,
        headerOn: s.headerOn,
        traffic: s.traffic,
        reqs: s.reqs,
        profile: s.profile,
        updateUrl: s.updateUrl,
        rules: s.rules,
        rewrites: s.rewrites,
        headers: s.headers,
        hosts: s.hosts,
      }),
    },
  ),
);
