import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Download,
  Globe,
  House,
  ListFilter,
  Palette,
  Power,
  Settings2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEMO_CONF } from "@/lib/conf";
import {
  NODES,
  useStudio,
  type AccentId,
  type DensityId,
  type RadiusId,
  type TabId,
  type ThemeId,
} from "@/lib/store";

const TABS: { id: TabId; label: string; icon: typeof House }[] = [
  { id: "home", label: "Home", icon: House },
  { id: "nodes", label: "Node", icon: Globe },
  { id: "rules", label: "Rule", icon: ListFilter },
  { id: "look", label: "Giao diện", icon: Palette },
  { id: "more", label: "More", icon: Settings2 },
];

function applyLook(theme: ThemeId, accent: AccentId, radius: RadiusId, density: DensityId) {
  const el = document.documentElement;
  el.dataset.theme = theme;
  el.dataset.accent = accent;
  el.dataset.radius = radius;
  el.dataset.density = density;
}

function Credit({ className }: { className?: string }) {
  return (
    <p className={cn("text-[11px] tracking-wide text-muted", className)}>Developer by concu</p>
  );
}

function policyClass(p: string) {
  const u = p.toUpperCase();
  if (u.includes("REJECT")) return "text-danger bg-danger/10";
  if (u.includes("DIRECT")) return "text-ok bg-ok/10";
  return "text-accent bg-accent/10";
}

function Switch({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full border border-line transition-colors duration-150",
        on ? "bg-accent" : "bg-subtle",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full transition-transform duration-150",
          on ? "translate-x-6 bg-accent-fg" : "translate-x-0.5 bg-muted",
        )}
      />
    </button>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-subtle px-3 py-2.5">
      <p className="text-[11px] text-muted">{k}</p>
      <p className="mt-1 text-sm font-medium tabular">{v}</p>
    </div>
  );
}

function HomeView() {
  const connected = useStudio((s) => s.connected);
  const startedAt = useStudio((s) => s.startedAt);
  const setConnected = useStudio((s) => s.setConnected);
  const setTab = useStudio((s) => s.setTab);
  const tick = useStudio((s) => s.tick);
  const flash = useStudio((s) => s.flash);
  const node = useStudio((s) => s.currentNode());
  const traffic = useStudio((s) => s.traffic);
  const reqs = useStudio((s) => s.reqs);
  const rules = useStudio((s) => s.rules);
  const [clock, setClock] = useState("00:00:00");
  const [dl, setDl] = useState("0 KB/s");
  const [ul, setUl] = useState("0 KB/s");

  useEffect(() => {
    if (!connected) {
      setClock("00:00:00");
      setDl("0 KB/s");
      setUl("0 KB/s");
      return;
    }
    const id = window.setInterval(() => {
      const sec = Math.floor((Date.now() - startedAt) / 1000);
      const hh = String(Math.floor(sec / 3600)).padStart(2, "0");
      const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");
      setClock(`${hh}:${mm}:${ss}`);
      const d = 80 + Math.random() * 420;
      const u = 10 + Math.random() * 80;
      setDl(d < 1024 ? `${d.toFixed(0)} KB/s` : `${(d / 1024).toFixed(1)} MB/s`);
      setUl(u < 1024 ? `${u.toFixed(0)} KB/s` : `${(u / 1024).toFixed(1)} MB/s`);
      tick(d, u);
    }, 1000);
    return () => window.clearInterval(id);
  }, [connected, startedAt, tick]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-line bg-elevated p-4">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium",
              connected ? "bg-accent/15 text-accent" : "bg-subtle text-muted",
            )}
          >
            {connected ? "Đang bảo vệ" : "Chưa kết nối"}
          </span>
          <span className="text-[11px] text-muted tabular">{clock}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setConnected(!connected);
            flash(connected ? "Đã ngắt" : "Tunnel mô phỏng đã bật");
          }}
          className={cn(
            "mt-5 flex w-full items-center justify-between rounded-lg border px-4 py-4 text-left transition-colors duration-150",
            connected ? "border-accent/40 bg-accent text-accent-fg" : "border-line bg-subtle text-fg",
          )}
        >
          <span>
            <span className="block font-display text-xl">{connected ? "Đã bật" : "Kết nối"}</span>
            <span className={cn("mt-1 block text-xs", connected ? "opacity-80" : "text-muted")}>
              {connected ? node.name : "Mô phỏng tunnel trên thiết bị này"}
            </span>
          </span>
          <Power className="size-5" strokeWidth={1.75} />
        </button>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat k="Tải xuống" v={dl} />
          <Stat k="Tải lên" v={ul} />
          <Stat k="Độ trễ" v={connected ? `${node.ping} ms` : "—"} />
        </div>
        <Credit className="mt-4" />
      </section>

      <section className="rounded-xl border border-line bg-elevated p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">Node đang chọn</h2>
          <button type="button" className="text-xs text-muted hover:text-fg" onClick={() => setTab("nodes")}>
            Đổi
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("size-2.5 rounded-full", connected ? "bg-ok" : "bg-faint")} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{node.name}</p>
            <p className="truncate text-xs text-muted">
              {node.proto} · {node.meta}
            </p>
          </div>
          <span className="text-xs tabular text-muted">{node.ping} ms</span>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-elevated p-4">
        <h2 className="mb-3 text-sm font-medium">Hôm nay</h2>
        <div className="grid grid-cols-3 gap-2">
          <Stat k="Tổng" v={`${traffic.toFixed(1)} MB`} />
          <Stat k="Yêu cầu" v={String(reqs)} />
          <Stat k="Rule" v={String(rules.length)} />
        </div>
      </section>
    </div>
  );
}

function NodesView() {
  const nodeId = useStudio((s) => s.nodeId);
  const filter = useStudio((s) => s.nodeFilter);
  const setNode = useStudio((s) => s.setNode);
  const setFilter = useStudio((s) => s.setNodeFilter);
  const flash = useStudio((s) => s.flash);
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      NODES.filter((n) => {
        if (filter !== "all" && n.group !== filter) return false;
        return (n.name + n.proto + n.meta).toLowerCase().includes(q.toLowerCase());
      }),
    [filter, q],
  );

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm node, quốc gia, protocol…"
        className="mb-3 h-11 w-full rounded-md border border-line bg-elevated px-3 text-sm outline-none placeholder:text-faint focus:border-accent"
      />
      <div className="mb-3 grid grid-cols-4 gap-1 rounded-md bg-elevated p-1">
        {(["all", "vless", "trojan", "ss"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "h-9 rounded-sm text-xs",
              filter === f ? "bg-subtle text-fg" : "text-muted",
            )}
          >
            {f === "all" ? "Tất cả" : f.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {list.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => {
              setNode(n.id);
              flash(`Đã chọn ${n.name}`);
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border bg-elevated px-3 py-3 text-left",
              n.id === nodeId ? "border-accent/40" : "border-line",
            )}
          >
            <span className={cn("size-2.5 rounded-full", n.ping < 80 ? "bg-ok" : "bg-warn")} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{n.name}</span>
              <span className="block truncate text-xs text-muted">
                {n.proto} · {n.meta}
              </span>
            </span>
            <span className="text-xs tabular text-muted">{n.ping} ms</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RulesView() {
  const rules = useStudio((s) => s.rules);
  const filter = useStudio((s) => s.ruleFilter);
  const setFilter = useStudio((s) => s.setRuleFilter);
  const addRule = useStudio((s) => s.addRule);
  const clearRules = useStudio((s) => s.clearRules);
  const [open, setOpen] = useState(false);
  const [match, setMatch] = useState("");
  const [policy, setPolicy] = useState("PROXY");

  const rows = rules.filter((r) => {
    if (filter === "all") return true;
    return r.policy.toUpperCase().includes(filter);
  });

  return (
    <div>
      <div className="mb-3 grid grid-cols-4 gap-1 rounded-md bg-elevated p-1">
        {(["all", "PROXY", "DIRECT", "REJECT"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn("h-9 rounded-sm text-xs", filter === f ? "bg-subtle text-fg" : "text-muted")}
          >
            {f === "all" ? "Tất cả" : f}
          </button>
        ))}
      </div>
      <div className="mb-3 flex gap-2">
        <Button className="flex-1" onClick={() => setOpen(true)}>
          Thêm rule
        </Button>
        <Button
          variant="ghost"
          className="flex-1"
          onClick={() => {
            if (window.confirm("Xóa toàn bộ rule?")) clearRules();
          }}
        >
          Xóa hết
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Chưa có rule</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="rounded-lg border border-line bg-elevated px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.match}</p>
                  <p className="mt-1 truncate font-mono text-[11px] text-muted">{r.raw}</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium", policyClass(r.policy))}>
                  {r.policy}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {open ? (
        <div className="fixed inset-0 z-40 flex items-end bg-bg/50 p-4 sm:items-center sm:justify-center" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-xl border border-line bg-elevated p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg">Rule mới</h3>
            <label className="mt-4 block text-xs text-muted">Khớp</label>
            <input
              value={match}
              onChange={(e) => setMatch(e.target.value)}
              placeholder="DOMAIN-SUFFIX,example.com"
              className="mt-1 h-11 w-full rounded-md border border-line bg-subtle px-3 text-sm outline-none"
            />
            <label className="mt-3 block text-xs text-muted">Hành động</label>
            <select
              value={policy}
              onChange={(e) => setPolicy(e.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-line bg-subtle px-3 text-sm outline-none"
            >
              <option>PROXY</option>
              <option>DIRECT</option>
              <option>REJECT</option>
            </select>
            <Button
              className="mt-4 w-full"
              onClick={() => {
                if (match.trim()) addRule(match.trim(), policy);
                setMatch("");
                setOpen(false);
              }}
            >
              Thêm
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const THEMES: { id: ThemeId; name: string; note: string }[] = [
  { id: "ink", name: "Mực", note: "Tối, editorial" },
  { id: "paper", name: "Giấy", note: "Sáng, ấm" },
  { id: "mist", name: "Sương", note: "Xám lạnh" },
];
const ACCENTS: { id: AccentId; name: string }[] = [
  { id: "silver", name: "Bạc" },
  { id: "steel", name: "Thép" },
  { id: "sage", name: "Rêu" },
];
const RADII: { id: RadiusId; name: string }[] = [
  { id: "sharp", name: "Sắc" },
  { id: "soft", name: "Vừa" },
  { id: "round", name: "Tròn" },
];
const DENSITIES: { id: DensityId; name: string }[] = [
  { id: "compact", name: "Gọn" },
  { id: "comfortable", name: "Thoáng" },
];

function LookView() {
  const theme = useStudio((s) => s.theme);
  const accent = useStudio((s) => s.accent);
  const radius = useStudio((s) => s.radius);
  const density = useStudio((s) => s.density);
  const setLook = useStudio((s) => s.setLook);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] tracking-wide text-muted uppercase">Studio</p>
        <h2 className="mt-1 font-display text-2xl leading-tight">Tùy chỉnh giao diện</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Đổi nền, accent, bo góc và mật độ. Toàn bộ app đổi ngay.
        </p>
        <Credit className="mt-2" />
      </header>

      <section>
        <h3 className="mb-2 text-sm font-medium">Nền</h3>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setLook({ theme: t.id })}
              className={cn(
                "rounded-lg border px-3 py-3 text-left",
                theme === t.id ? "border-accent bg-subtle" : "border-line bg-elevated",
              )}
            >
              <span className="block text-sm font-medium">{t.name}</span>
              <span className="mt-1 block text-[11px] text-muted">{t.note}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium">Accent</h3>
        <div className="grid grid-cols-3 gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setLook({ accent: a.id })}
              className={cn(
                "h-11 rounded-md border text-sm",
                accent === a.id ? "border-accent bg-accent text-accent-fg" : "border-line bg-elevated",
              )}
            >
              {a.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium">Bo góc</h3>
        <div className="grid grid-cols-3 gap-2">
          {RADII.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setLook({ radius: r.id })}
              className={cn(
                "h-11 rounded-md border text-sm",
                radius === r.id ? "border-accent bg-subtle" : "border-line bg-elevated",
              )}
            >
              {r.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium">Mật độ</h3>
        <div className="grid grid-cols-2 gap-2">
          {DENSITIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setLook({ density: d.id })}
              className={cn(
                "h-11 rounded-md border text-sm",
                density === d.id ? "border-accent bg-subtle" : "border-line bg-elevated",
              )}
            >
              {d.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function MoreView() {
  const mitm = useStudio((s) => s.mitm);
  const rewriteOn = useStudio((s) => s.rewriteOn);
  const headerOn = useStudio((s) => s.headerOn);
  const toggle = useStudio((s) => s.toggle);
  const hosts = useStudio((s) => s.hosts);
  const rewrites = useStudio((s) => s.rewrites);
  const addHost = useStudio((s) => s.addHost);
  const removeHost = useStudio((s) => s.removeHost);
  const profile = useStudio((s) => s.profile);
  const updateUrl = useStudio((s) => s.updateUrl);
  const setProfile = useStudio((s) => s.setProfile);
  const importText = useStudio((s) => s.importText);
  const downloadConf = useStudio((s) => s.downloadConf);
  const flash = useStudio((s) => s.flash);
  const [name, setName] = useState(profile);
  const [url, setUrl] = useState(updateUrl);
  const [paste, setPaste] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(profile);
    setUrl(updateUrl);
  }, [profile, updateUrl]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-line bg-elevated p-4">
        <Row label="Giải mã HTTPS" hint="MITM — chỉ hostname, không nhúng CA">
          <Switch on={mitm} onClick={() => toggle("mitm")} label="MITM" />
        </Row>
        <Row label="URL Rewrite" hint="Đổi hoặc reject request">
          <Switch on={rewriteOn} onClick={() => toggle("rewriteOn")} label="Rewrite" />
        </Row>
        <Row label="Header Rewrite" hint="Xóa / sửa header" last>
          <Switch on={headerOn} onClick={() => toggle("headerOn")} label="Header" />
        </Row>
      </section>

      <p className="rounded-lg border border-line bg-subtle px-3 py-2.5 text-xs leading-relaxed text-muted">
        Shadownsoclo quản lý hostname và rule trên thiết bị. Không chạy script giả premium, không tunnel packet.
      </p>
      <p className="text-center text-[11px] text-muted">Developer by concu</p>

      <section className="rounded-xl border border-line bg-elevated p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">Hostname MITM</h2>
          <button
            type="button"
            className="text-xs text-muted hover:text-fg"
            onClick={() => {
              const v = window.prompt("Hostname");
              if (v?.trim()) addHost(v.trim());
            }}
          >
            Thêm
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {hosts.length === 0 ? <p className="text-xs text-muted">Chưa có hostname</p> : null}
          {hosts.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => removeHost(h)}
              className="rounded-full border border-line bg-subtle px-2.5 py-1 text-[11px]"
            >
              {h} ×
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-elevated p-4">
        <h2 className="mb-3 text-sm font-medium">URL Rewrite</h2>
        {rewrites.length === 0 ? (
          <p className="text-xs text-muted">Không có rewrite</p>
        ) : (
          rewrites.map((r) => (
            <div key={r.pattern} className="border-b border-line py-2 last:border-0">
              <p className="text-xs font-medium">{r.action}</p>
              <p className="mt-1 truncate font-mono text-[11px] text-muted">{r.pattern}</p>
            </div>
          ))
        )}
      </section>

      <section className="rounded-xl border border-line bg-elevated p-4">
        <h2 className="mb-3 text-sm font-medium">Hồ sơ</h2>
        <label className="text-xs text-muted">Tên</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 mb-3 h-11 w-full rounded-md border border-line bg-subtle px-3 text-sm outline-none"
        />
        <label className="text-xs text-muted">Update URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 h-11 w-full rounded-md border border-line bg-subtle px-3 text-sm outline-none"
        />
        <div className="mt-3 flex gap-2">
          <Button
            className="flex-1"
            onClick={() => {
              setProfile(name, url);
              flash("Đã lưu hồ sơ");
            }}
          >
            Lưu
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => {
              downloadConf();
              flash("Đã xuất .conf");
            }}
          >
            <Download className="size-4" /> Xuất
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-elevated p-4">
        <h2 className="mb-2 text-sm font-medium">Nhập conf</h2>
        <p className="mb-3 text-xs leading-relaxed text-muted">
          Dán [Rule], rewrite, hostname. Phần ca-p12 bị bỏ qua.
        </p>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={6}
          className="w-full rounded-md border border-line bg-subtle p-3 font-mono text-[11px] outline-none"
        />
        <div className="mt-3 flex gap-2">
          <Button
            className="flex-1"
            onClick={() => {
              importText(paste);
              flash("Đã đọc conf");
            }}
          >
            Phân tích
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => {
              setPaste(DEMO_CONF);
              importText(DEMO_CONF);
              flash("Đã nạp demo");
            }}
          >
            Demo
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".conf,.txt,.module"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const text = await f.text();
            setPaste(text);
            importText(text);
            flash("Đã nhập file");
          }}
        />
        <Button variant="ghost" className="mt-2 w-full" onClick={() => fileRef.current?.click()}>
          <Upload className="size-4" /> Chọn file
        </Button>
      </section>
    </div>
  );
}

function Row({
  label,
  hint,
  last,
  children,
}: {
  label: string;
  hint: string;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 py-3", !last && "border-b border-line")}>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-[11px] text-muted">{hint}</p>
      </div>
      {children}
    </div>
  );
}

export function AppShell() {
  const tab = useStudio((s) => s.tab);
  const setTab = useStudio((s) => s.setTab);
  const theme = useStudio((s) => s.theme);
  const accent = useStudio((s) => s.accent);
  const radius = useStudio((s) => s.radius);
  const density = useStudio((s) => s.density);
  const toast = useStudio((s) => s.toast);
  const [time, setTime] = useState("");

  useEffect(() => {
    applyLook(theme, accent, radius, density);
  }, [theme, accent, radius, density]);

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-24 pt-3 md:max-w-5xl md:flex-row md:gap-8 md:pb-20">
        <aside className="hidden md:block md:w-80 md:shrink-0 md:self-start md:sticky md:top-4">
          <LookView />
        </aside>
        <div className="min-w-0 flex-1">
          <header className="mb-4 flex items-end justify-between md:hidden">
            <div>
              <p className="text-[11px] text-muted tabular">{time || "—"}</p>
              <h1 className="font-display text-[28px] leading-none tracking-tight">Shadownsoclo</h1>
              <p className="mt-1 text-xs text-muted">proxy studio</p>
              <Credit className="mt-1" />
            </div>
          </header>
          <header className="mb-4 hidden items-end justify-between md:flex">
            <div>
              <p className="text-[11px] text-muted tabular">{time || "—"}</p>
              <h1 className="font-display text-[32px] leading-none tracking-tight">Shadownsoclo</h1>
              <p className="mt-1 text-xs text-muted">Xem trước trực tiếp theo giao diện đang chọn</p>
              <Credit className="mt-1" />
            </div>
          </header>

          {tab === "home" || tab === "look" ? (
            <>
              {tab === "look" ? (
                <div className="md:hidden">
                  <LookView />
                </div>
              ) : null}
              <div className={tab === "look" ? "hidden md:block" : undefined}>
                <HomeView />
              </div>
            </>
          ) : null}
          {tab === "nodes" ? <NodesView /> : null}
          {tab === "rules" ? <RulesView /> : null}
          {tab === "more" ? <MoreView /> : null}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-elevated/95 pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[10px]",
                  on ? "text-accent" : "text-faint",
                )}
              >
                <Icon className="size-5" strokeWidth={1.7} />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-20 hidden border-t border-line bg-elevated/95 md:block">
        <div className="mx-auto flex max-w-5xl justify-end gap-1 px-4">
          {TABS.filter((t) => t.id !== "look").map((t) => {
            const Icon = t.icon;
            const on = tab === t.id || (tab === "look" && t.id === "home");
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex h-14 items-center gap-2 px-4 text-xs",
                  on ? "text-accent" : "text-faint",
                )}
              >
                <Icon className="size-4" strokeWidth={1.7} />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-4">
          <p className="rounded-md border border-line bg-elevated px-3 py-2 text-xs">{toast}</p>
        </div>
      ) : null}
    </div>
  );
}
