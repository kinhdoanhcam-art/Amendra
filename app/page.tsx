"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Fingerprint,
  Layers3,
  LoaderCircle,
  Plus,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Undo2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionHashVariant, type CalldataEncodable } from "genlayer-js/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";

const CONTRACT_ADDRESS = "0x6518B4908588f40dE74C6B43f8bA4aB42131D327" as const;
const EXPLORER_URL = `https://explorer-studio.genlayer.com/address/${CONTRACT_ADDRESS}`;
const RPC_URL = "https://studio.genlayer.com/api";
const SOURCE_SHA = "f2c60f80d0994bcc0a3194d99b61868089295649e57bbe192ee32c7f8a2a0f53";
const chain = { ...studionet, rpcUrls: { default: { http: [RPC_URL] } } };
const readClient = createClient({ chain });

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
};

type Config = {
  name: string;
  version: string;
  prompt_version: string;
  workspace_count: number;
  max_statements_per_workspace: number;
  max_attempts_per_workspace: number;
};

type Workspace = {
  workspace_id: number;
  creator: string;
  statement_count: number;
  active_count: number;
  retracted_count: number;
  attempt_count: number;
};

type Statement = {
  statement_id: number;
  author: string;
  statement_text: string;
  status: "ACTIVE" | "RETRACTED";
  retracted_by_attempt: number;
};

type Attempt = {
  attempt_id: number;
  statement_id: number;
  author: string;
  retraction_text: string;
  verdict: "RETRACTION_CLEAR" | "RETRACTION_NONE";
};

type Ledger = {
  workspace: Workspace;
  statements: Statement[];
  attempts: Attempt[];
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const navItems = [
  ["overview", "Overview"],
  ["workspace", "Workspace"],
  ["statements", "Statements"],
  ["retract", "Retract"],
  ["ledger", "Ledger"],
  ["proof", "Proof"],
] as const;

function compact(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-5)}`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function integer(value: string, label: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${label} must be a positive integer.`);
  return parsed;
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="field-label">
      <span>{children}</span>
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function TxPanel({ txHash, status }: { txHash: string; status: string }) {
  if (!txHash && !status) return null;
  return (
    <div className="tx-panel" aria-live="polite">
      <div>
        <span className="eyebrow">LATEST OPERATION</span>
        <strong>{status}</strong>
      </div>
      {txHash ? <code>{compact(txHash)}</code> : <LoaderCircle className="spin" size={18} />}
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState("overview");
  const [config, setConfig] = useState<Config | null>(null);
  const [account, setAccount] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [writeStatus, setWriteStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [statementWorkspace, setStatementWorkspace] = useState("1");
  const [statementText, setStatementText] = useState("");
  const [retractWorkspace, setRetractWorkspace] = useState("1");
  const [retractStatement, setRetractStatement] = useState("1");
  const [retractionText, setRetractionText] = useState("");
  const [ledgerWorkspace, setLedgerWorkspace] = useState("1");
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const loadConfig = useCallback(async () => {
    setLoadingConfig(true);
    try {
      const next = (await readClient.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_config",
        args: [],
        transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
      })) as Config;
      setConfig(next);
    } catch (error) {
      toast.error("Could not read StudioNet", { description: errorMessage(error) });
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadConfig(), 0);
    return () => window.clearTimeout(timer);
  }, [loadConfig]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("No EVM-compatible wallet was found in this browser.");
    }
    const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
    if (!accounts[0]) throw new Error("Wallet connection was not approved.");
    const chainHex = (await window.ethereum.request({ method: "eth_chainId" })) as string;
    if (Number(BigInt(chainHex)) !== 61999) {
      toast.warning("Wallet network differs", {
        description: "Switch your wallet to GenLayer StudioNet (chain ID 61999) before writing.",
      });
    }
    setAccount(accounts[0]);
    toast.success("Wallet connected", { description: compact(accounts[0]) });
    return accounts[0];
  }, []);

  const waitForFinal = useCallback(async (hash: string) => {
    const started = Date.now();
    while (Date.now() - started < 10 * 60 * 1000) {
      const response = await fetch(RPC_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getTransactionByHash", params: [hash] }),
      });
      const payload = (await response.json()) as { result?: { status?: string } };
      const status = payload.result?.status;
      if (status) setWriteStatus(status);
      if (status === "FINALIZED") return;
      if (status === "CANCELED" || status === "UNDETERMINED") {
        throw new Error(`Transaction ended with status ${status}.`);
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    throw new Error("Confirmation is taking longer than expected. Keep the transaction hash and do not resubmit yet.");
  }, []);

  const write = useCallback(
    async (functionName: string, args: CalldataEncodable[], success: string) => {
      try {
        setTxHash("");
        setWriteStatus("PREPARING");
        const wallet = account || (await connectWallet());
        if (!window.ethereum) throw new Error("Wallet provider unavailable.");
        const client = createClient({
          chain,
          account: wallet as `0x${string}`,
          provider: window.ethereum as never,
        });
        const hash = await client.writeContract({
          address: CONTRACT_ADDRESS,
          functionName,
          args,
          value: 0n,
          leaderOnly: false,
        });
        setTxHash(hash);
        setWriteStatus("SUBMITTED");
        toast.info("Transaction submitted", { description: compact(hash) });
        await waitForFinal(hash);
        setWriteStatus("FINALIZED");
        toast.success(success, { description: compact(hash) });
        await loadConfig();
        return hash;
      } catch (error) {
        setWriteStatus("STOPPED");
        toast.error("Operation stopped", { description: errorMessage(error) });
        throw error;
      }
    },
    [account, connectWallet, loadConfig, waitForFinal],
  );

  const createWorkspace = async () => {
    try {
      const nextId = (config?.workspace_count ?? 0) + 1;
      await write("create_workspace", [], "Workspace finalized");
      setStatementWorkspace(String(nextId));
      setLedgerWorkspace(String(nextId));
    } catch {
      // The toast and status panel already hold the actionable error.
    }
  };

  const registerStatement = async () => {
    try {
      if (!statementText.trim()) throw new Error("Enter a statement before submitting.");
      await write(
        "register_statement",
        [integer(statementWorkspace, "Workspace ID"), statementText],
        "Statement registered",
      );
      setStatementText("");
    } catch (error) {
      if (errorMessage(error).startsWith("Workspace") || errorMessage(error).startsWith("Enter")) {
        toast.error(errorMessage(error));
      }
    }
  };

  const submitRetraction = async () => {
    try {
      if (!retractionText.trim()) throw new Error("Enter retraction text before submitting.");
      await write(
        "submit_retraction",
        [
          integer(retractWorkspace, "Workspace ID"),
          integer(retractStatement, "Statement ID"),
          retractionText,
        ],
        "Semantic verdict finalized",
      );
      setRetractionText("");
    } catch (error) {
      if (errorMessage(error).startsWith("Workspace") || errorMessage(error).startsWith("Statement") || errorMessage(error).startsWith("Enter")) {
        toast.error(errorMessage(error));
      }
    }
  };

  const loadLedger = useCallback(async (workspaceOverride?: number) => {
    const wid = workspaceOverride ?? integer(ledgerWorkspace, "Workspace ID");
    setLedgerLoading(true);
    try {
      const [workspace, statements, attempts] = await Promise.all([
        readClient.readContract({ address: CONTRACT_ADDRESS, functionName: "get_workspace", args: [wid], transactionHashVariant: TransactionHashVariant.LATEST_FINAL }),
        readClient.readContract({ address: CONTRACT_ADDRESS, functionName: "get_statements", args: [wid, 1, 50], transactionHashVariant: TransactionHashVariant.LATEST_FINAL }),
        readClient.readContract({ address: CONTRACT_ADDRESS, functionName: "get_attempts", args: [wid, 1, 50], transactionHashVariant: TransactionHashVariant.LATEST_FINAL }),
      ]);
      const next = { workspace: workspace as Workspace, statements: statements as Statement[], attempts: attempts as Attempt[] };
      setLedgerWorkspace(String(wid));
      setLedger(next);
      return next;
    } catch (error) {
      toast.error("Workspace could not be loaded", { description: errorMessage(error) });
      throw error;
    } finally {
      setLedgerLoading(false);
    }
  }, [ledgerWorkspace]);

  const counts = useMemo(
    () => [
      ["WORKSPACES", loadingConfig ? "—" : String(config?.workspace_count ?? 0), "finalized namespaces"],
      ["ENGINE", config ? `v${config.version}` : "—", config?.prompt_version ?? "loading profile"],
      ["CHAIN", "61999", "StudioNet"],
      ["SOURCE", "VERIFIED", `${SOURCE_SHA.slice(0, 8)}…${SOURCE_SHA.slice(-6)}`],
    ],
    [config, loadingConfig],
  );
  const writeBusy = !!writeStatus && writeStatus !== "FINALIZED" && writeStatus !== "STOPPED";

  return (
    <main className="app-shell">
      <Toaster position="bottom-right" richColors closeButton />
      <Tabs value={tab} onValueChange={setTab} className="min-h-screen gap-0">
        <header className="topbar">
          <button className="brand" onClick={() => setTab("overview")} aria-label="Amendra overview">
            <span className="brand-mark" aria-hidden="true"><Fingerprint size={22} /></span>
            <span><strong>Amendra</strong><small>REVISION PROVENANCE</small></span>
          </button>
          <TabsList variant="line" className="nav-tabs">
            {navItems.map(([value, label], index) => (
              <TabsTrigger key={value} value={value} className="nav-tab"><span>{String(index + 1).padStart(2, "0")}</span>{label}</TabsTrigger>
            ))}
          </TabsList>
          <div className="header-actions">
            <a className="contract-chip" href={EXPLORER_URL} target="_blank" rel="noreferrer"><span className="live-dot" />{compact(CONTRACT_ADDRESS)}</a>
            <Button className="connect-button" onClick={() => void connectWallet().catch((error) => toast.error("Wallet connection stopped", { description: errorMessage(error) }))}><Wallet />{account ? compact(account) : "Connect wallet"}</Button>
          </div>
        </header>

        <div className="network-strip"><span><i /> STUDIONET / 61999</span><span>FINALIZED READS</span><span className="strip-copy">Immutable statements · semantic retractions · public audit trail</span></div>

        <TabsContent value="overview" className="page-frame overview-page">
          <section className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow coral">GENLAYER / SEMANTIC REVISION LEDGER</span>
              <h1>Change the record.<br /><em>Keep the trace.</em></h1>
              <p>Register a public statement, submit a precise retraction, and preserve every verdict in an append-only ledger. The words may change. The history does not.</p>
              <div className="hero-actions">
                <Button size="lg" className="primary-action" onClick={() => setTab("workspace")}>Open a workspace <ArrowRight /></Button>
                <Button size="lg" variant="outline" className="secondary-action" onClick={() => setTab("ledger")}>Inspect the ledger</Button>
              </div>
            </div>
            <div className="revision-map" aria-label="Amendra revision flow diagram">
              <div className="map-grid" /><span className="map-label">REVISION SPINE / APPEND-ONLY</span><div className="spine" />
              <div className="node node-one"><span>01 / ORIGIN</span><strong>Statement</strong><small>ACTIVE</small></div>
              <div className="node node-two"><span>02 / INTENT</span><strong>Retraction</strong><small>SEMANTIC REVIEW</small></div>
              <div className="node node-three"><span>03 / VERDICT</span><strong>Ledger</strong><small>FINALIZED</small></div>
              <div className="seal"><Fingerprint /><strong>AMENDRA</strong><small>v1.3</small></div>
            </div>
          </section>
          <section className="metric-grid" aria-label="Live contract summary">
            {counts.map(([label, value, caption]) => <article key={label}><span className="eyebrow">{label}</span><strong>{value}</strong><small>{caption}</small></article>)}
          </section>
          <section className="rule-grid">
            <article><span>RULE 01</span><FileText /><h2>Statements stay intact.</h2><p>The original wording remains readable after every later attempt.</p></article>
            <article><span>RULE 02</span><ScanLine /><h2>Meaning decides.</h2><p>A correction or replacement is not automatically a complete retraction.</p></article>
            <article><span>RULE 03</span><ShieldCheck /><h2>Final means final.</h2><p>A clear retraction latches the statement and blocks replay.</p></article>
          </section>
        </TabsContent>

        <TabsContent value="workspace" className="page-frame workspace-page">
          <section className="section-heading"><div><span className="eyebrow coral">01 / NAMESPACE</span><h1>Create a clean workspace.</h1></div><p>Each workspace belongs to its creator. Only that wallet can register statements inside it.</p></section>
          <div className="action-layout">
            <article className="action-card focal-card">
              <span className="card-icon"><Layers3 /></span><span className="eyebrow">NEW WORKSPACE</span><h2>Start an isolated record.</h2><p>No constructor arguments. No mutable policy knobs. One transaction opens the next workspace ID.</p>
              <div className="scope-list"><span><Check /> Creator-gated statements</span><span><Check /> Statement-scoped semantic cache</span><span><Check /> Append-only attempts</span></div>
              <Button size="lg" className="primary-action wide" onClick={() => void createWorkspace()} disabled={writeBusy}><Plus /> Create workspace</Button>
              <TxPanel txHash={txHash} status={writeStatus} />
            </article>
            <aside className="side-stack">
              <article className="data-card"><span className="eyebrow">CURRENT COUNT</span><strong>{config?.workspace_count ?? "—"}</strong><small>finalized workspaces</small></article>
              <article className="data-card"><span className="eyebrow">CAPACITY</span><strong>{config?.max_statements_per_workspace ?? 100}</strong><small>statements / workspace</small></article>
              <article className="data-card"><span className="eyebrow">WALLET</span><strong className="mono-value">{account ? compact(account) : "NOT CONNECTED"}</strong><small>transaction author</small></article>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="statements" className="page-frame form-page">
          <section className="section-heading"><div><span className="eyebrow coral">02 / ORIGIN</span><h1>Put the original words on record.</h1></div><p>The exact statement text becomes the semantic reference point for every later retraction.</p></section>
          <div className="form-layout">
            <article className="form-card"><div className="form-index">S</div>
              <div className="field-group"><FieldLabel hint="creator-owned namespace">Workspace ID</FieldLabel><Input value={statementWorkspace} onChange={(event) => setStatementWorkspace(event.target.value)} inputMode="numeric" /></div>
              <div className="field-group"><FieldLabel hint={`${statementText.length} / 3000`}>Statement text</FieldLabel><Textarea value={statementText} onChange={(event) => setStatementText(event.target.value)} maxLength={3000} placeholder="Write the statement exactly as it should appear in the public record…" className="statement-area" /></div>
              <Button size="lg" className="primary-action wide" onClick={() => void registerStatement()} disabled={writeBusy}>Register statement <ArrowRight /></Button><TxPanel txHash={txHash} status={writeStatus} />
            </article>
            <aside className="principle-card"><span className="eyebrow">WHY EXACT WORDING MATTERS</span><div className="quote-mark">“</div><h2>The cited assertion is the unit of truth.</h2><p>Later text is judged against this exact statement—not against a summary, a topic, or a convenient paraphrase.</p><div className="boundary"><Fingerprint /><span><strong>Immutable origin</strong><small>Stored before semantic evaluation</small></span></div></aside>
          </div>
        </TabsContent>

        <TabsContent value="retract" className="page-frame form-page">
          <section className="section-heading"><div><span className="eyebrow coral">03 / SEMANTIC INTENT</span><h1>Withdraw the claim—not just its wording.</h1></div><p>Amendra records the attempt, asks validators for a strict binary verdict, and latches only a clear complete retraction.</p></section>
          <div className="form-layout">
            <article className="form-card"><div className="form-index">R</div>
              <div className="double-field"><div className="field-group"><FieldLabel>Workspace ID</FieldLabel><Input value={retractWorkspace} onChange={(event) => setRetractWorkspace(event.target.value)} inputMode="numeric" /></div><div className="field-group"><FieldLabel>Statement ID</FieldLabel><Input value={retractStatement} onChange={(event) => setRetractStatement(event.target.value)} inputMode="numeric" /></div></div>
              <div className="field-group"><FieldLabel hint={`${retractionText.length} / 3000`}>Retraction text</FieldLabel><Textarea value={retractionText} onChange={(event) => setRetractionText(event.target.value)} maxLength={3000} placeholder="State clearly what you are withdrawing from the cited statement…" className="statement-area" /></div>
              <Button size="lg" className="primary-action wide" onClick={() => void submitRetraction()} disabled={writeBusy}><Undo2 /> Submit for semantic verdict</Button><TxPanel txHash={txHash} status={writeStatus} />
            </article>
            <aside className="verdict-stack"><article className="verdict-card clear"><span>RETRACTION_CLEAR</span><h2>Revocation + complete scope</h2><p>The author clearly withdraws the cited assertion as a whole.</p></article><article className="verdict-card none"><span>RETRACTION_NONE</span><h2>No clear complete retraction</h2><p>Corrections, replacements, ambiguity, and partial withdrawals remain active.</p></article></aside>
          </div>
        </TabsContent>

        <TabsContent value="ledger" className="page-frame ledger-page">
          <section className="section-heading ledger-heading"><div><span className="eyebrow coral">04 / FINALIZED STATE</span><h1>Read the complete revision trail.</h1></div><div className="ledger-search"><Input value={ledgerWorkspace} onChange={(event) => setLedgerWorkspace(event.target.value)} inputMode="numeric" aria-label="Workspace ID" /><Button className="primary-action" onClick={() => void loadLedger().catch(() => undefined)} disabled={ledgerLoading}>{ledgerLoading ? <LoaderCircle className="spin" /> : <RefreshCw />} Load workspace</Button></div></section>
          {!ledger ? <div className="empty-ledger"><Database /><h2>No workspace loaded.</h2><p>Enter a finalized workspace ID to inspect its statements and semantic attempts.</p></div> : (
            <div className="ledger-content">
              <section className="workspace-summary"><article><span className="eyebrow">WORKSPACE</span><strong>#{ledger.workspace.workspace_id}</strong><small>{compact(ledger.workspace.creator)}</small></article><article><span className="eyebrow">STATEMENTS</span><strong>{ledger.workspace.statement_count}</strong><small>{ledger.workspace.active_count} active</small></article><article><span className="eyebrow">RETRACTED</span><strong>{ledger.workspace.retracted_count}</strong><small>terminal records</small></article><article><span className="eyebrow">ATTEMPTS</span><strong>{ledger.workspace.attempt_count}</strong><small>append-only</small></article></section>
              <div className="ledger-columns"><section><div className="column-title"><FileText /><span><strong>Statements</strong><small>Origin records</small></span></div><div className="record-list">{ledger.statements.length ? ledger.statements.map((statement) => <article className="record-card" key={statement.statement_id}><header><span>STATEMENT {String(statement.statement_id).padStart(2, "0")}</span><b className={statement.status === "RETRACTED" ? "status-retracted" : "status-active"}>{statement.status}</b></header><p>{statement.statement_text}</p><footer>{compact(statement.author)}{statement.retracted_by_attempt ? ` · retracted by attempt ${statement.retracted_by_attempt}` : ""}</footer></article>) : <p className="empty-copy">No statements in this workspace.</p>}</div></section>
                <section><div className="column-title"><Undo2 /><span><strong>Retraction attempts</strong><small>Semantic decisions</small></span></div><div className="record-list">{ledger.attempts.length ? ledger.attempts.map((attempt) => <article className="record-card attempt-card" key={attempt.attempt_id}><header><span>ATTEMPT {String(attempt.attempt_id).padStart(2, "0")} · S{attempt.statement_id}</span><b className={attempt.verdict === "RETRACTION_CLEAR" ? "status-retracted" : "status-none"}>{attempt.verdict.replace("RETRACTION_", "")}</b></header><p>{attempt.retraction_text}</p><footer>{compact(attempt.author)}</footer></article>) : <p className="empty-copy">No retraction attempts in this workspace.</p>}</div></section></div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="proof" className="page-frame proof-page">
          <section className="section-heading"><div><span className="eyebrow coral">05 / DEPLOYMENT PROOF</span><h1>Verify the engine behind Amendra.</h1></div><p>The project has a distinct identity. Its underlying Intelligent Contract remains independently inspectable.</p></section>
          <div className="proof-grid">
            <article className="proof-card hero-proof"><span className="proof-icon"><ShieldCheck /></span><span className="eyebrow">SOURCE PARITY</span><h2>Verified byte-for-byte.</h2><p>The deployed project contract matches the audited v1.2 source after newline normalization.</p><div className="hash-row"><code>{SOURCE_SHA}</code><Button size="icon" variant="ghost" aria-label="Copy source hash" onClick={() => void navigator.clipboard.writeText(SOURCE_SHA).then(() => toast.success("Source hash copied"))}><Copy /></Button></div></article>
            <article className="proof-card"><span className="eyebrow">PROJECT CONTRACT</span><h2>{compact(CONTRACT_ADDRESS)}</h2><p>StudioNet · chain 61999</p><a href={EXPLORER_URL} target="_blank" rel="noreferrer">Open explorer <ExternalLink /></a></article>
            <article className="proof-card"><span className="eyebrow">SEMANTIC ENGINE</span><h2>{config?.name ?? "Amendra"}</h2><p>Contract v{config?.version ?? "1.3"} · {config?.prompt_version ?? "2026-09-v1.2"}</p><span className="verified-line"><Check /> Finalized config read</span></article>
            <article className="proof-card"><span className="eyebrow">LIMITS</span><h2>{config?.max_statements_per_workspace ?? 100} / {config?.max_attempts_per_workspace ?? 200}</h2><p>Statements / attempts per workspace</p><span className="verified-line"><Check /> Deterministic caps</span></article>
          </div>
        </TabsContent>

        <footer className="site-footer"><div><span className="brand-mark mini"><Fingerprint /></span><strong>AMENDRA / STUDIONET</strong></div><span>Project interface · semantic decisions require validator consensus</span><a href={EXPLORER_URL} target="_blank" rel="noreferrer">Explore contract <ExternalLink /></a></footer>
      </Tabs>
    </main>
  );
}
