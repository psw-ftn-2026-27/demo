#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';

const SCRIPT_VERSION = 1;
const SESSION_FOLDERS = ['sessions', 'archived_sessions'];
const WORKSPACE_FOLDERS = ['specs', 'study'];
const INPUT_LIMIT = 2000;
const RESULT_LIMIT = 4000;

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

function git(args, cwd) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

function realPath(target) {
  try {
    return fs.realpathSync.native(target);
  } catch {
    return path.resolve(target);
  }
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function firstRecord(file) {
  const descriptor = fs.openSync(file, 'r');
  const chunk = Buffer.alloc(64 * 1024);
  let text = '';
  try {
    for (;;) {
      const read = fs.readSync(descriptor, chunk, 0, chunk.length, null);
      if (read > 0) text += chunk.toString('utf8', 0, read);
      const end = text.indexOf('\n');
      if (end !== -1 || read === 0) return JSON.parse(end === -1 ? text : text.slice(0, end));
      if (text.length > 8 * 1024 * 1024) return null;
    }
  } catch {
    return null;
  } finally {
    fs.closeSync(descriptor);
  }
}

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function parseLines(buffer) {
  const records = [];
  for (const line of buffer.toString('utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      records.push(JSON.parse(line));
    } catch {
      records.push({ type: 'unparseable' });
    }
  }
  return records;
}

function clip(text, limit) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}\n[... ${text.length - limit} more characters, see raw]`;
}

function blockText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return content == null ? '' : JSON.stringify(content);
  return content.map((block) => (typeof block.text === 'string' ? block.text : `[${block.type}]`)).join('\n');
}

function isContext(text) {
  return text.startsWith('<') || text.startsWith('# AGENTS.md instructions');
}

function readTitles(codexHome) {
  const titles = new Map();
  const file = path.join(codexHome, 'session_index.jsonl');
  if (!fs.existsSync(file)) return titles;
  for (const record of parseLines(fs.readFileSync(file))) {
    if (record.id && record.thread_name) titles.set(record.id, record.thread_name);
  }
  return titles;
}

function summarize(records) {
  const summary = {
    firstTimestamp: null, lastTimestamp: null, models: new Set(), branches: new Set(),
    turns: 0, userMessages: 0, assistantMessages: 0, toolCalls: 0, unparseableLines: 0,
  };
  for (const record of records) {
    const payload = record.payload ?? {};
    if (record.type === 'unparseable') summary.unparseableLines++;
    if (record.type === 'session_meta' && payload.git?.branch) summary.branches.add(payload.git.branch);
    if (record.type === 'turn_context' && payload.model) summary.models.add(payload.model);
    if (record.type === 'event_msg' && payload.type === 'task_started') summary.turns++;
    if (record.type !== 'response_item') continue;
    if (record.timestamp) {
      summary.firstTimestamp ??= record.timestamp;
      summary.lastTimestamp = record.timestamp;
    }
    if (payload.type === 'message' && payload.role === 'assistant') summary.assistantMessages++;
    if (payload.type === 'message' && payload.role === 'user' && !isContext(blockText(payload.content))) summary.userMessages++;
    if (payload.type?.endsWith('_call')) summary.toolCalls++;
  }
  return { ...summary, models: [...summary.models], branches: [...summary.branches] };
}

function render(records, heading) {
  const lines = [...heading, ''];
  const toolNames = new Map();
  const stamp = (record) => (record.timestamp ? `[${record.timestamp}] ` : '');
  const say = (record, label, text) => lines.push(`${stamp(record)}${label}`, text, '');

  for (const record of records) {
    const payload = record.payload ?? {};
    if (record.type === 'compacted') {
      say(record, 'COMPACTION SUMMARY', blockText(payload.message));
      continue;
    }
    if (record.type !== 'response_item') continue;
    const type = payload.type ?? '';
    if (type === 'message') {
      const text = blockText(payload.content);
      if (payload.role === 'assistant') say(record, 'ASSISTANT', text);
      else if (payload.role === 'developer') say(record, 'DEVELOPER', clip(text, RESULT_LIMIT));
      else if (isContext(text)) say(record, 'USER (context)', clip(text, RESULT_LIMIT));
      else say(record, 'USER', text);
    } else if (type === 'reasoning') {
      const text = blockText(payload.summary);
      if (text) say(record, 'ASSISTANT (reasoning summary)', text);
    } else if (type === 'agent_message') {
      say(record, `AGENT MESSAGE ${payload.author ?? ''} -> ${payload.recipient ?? ''}`, blockText(payload.content));
    } else if (type.endsWith('_call_output')) {
      const name = toolNames.get(payload.call_id) ?? 'tool';
      say(record, `RESULT ${name}`, clip(blockText(payload.output), RESULT_LIMIT));
    } else if (type.endsWith('_call')) {
      const name = payload.name ?? type;
      toolNames.set(payload.call_id, name);
      const input = payload.input ?? payload.arguments ?? payload.action ?? '';
      say(record, `TOOL ${name}`, clip(typeof input === 'string' ? input : JSON.stringify(input, null, 2), INPUT_LIMIT));
    } else {
      lines.push(`${stamp(record)}[${type}]`, '');
    }
  }
  return lines.join('\n');
}

const CRC_TABLE = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function crc32(buffer) {
  if (typeof zlib.crc32 === 'function') return zlib.crc32(buffer);
  let value = 0xffffffff;
  for (const byte of buffer) value = CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

class ZipWriter {
  constructor(file) {
    this.descriptor = fs.openSync(file, 'w');
    this.offset = 0;
    this.entries = [];
  }

  write(buffer) {
    fs.writeSync(this.descriptor, buffer);
    this.offset += buffer.length;
  }

  add(name, data, modified = new Date()) {
    if (data.length >= 0xffffffff || this.offset >= 0xffffffff || this.entries.length >= 0xfffe) {
      throw new Error('Archive exceeds the limits of the plain zip format.');
    }
    const nameBytes = Buffer.from(name, 'utf8');
    const deflated = zlib.deflateRawSync(data, { level: 9 });
    const stored = deflated.length >= data.length;
    const body = stored ? data : deflated;
    const year = Math.max(modified.getFullYear(), 1980);
    const entry = {
      nameBytes, method: stored ? 0 : 8, crc: crc32(data), packed: body.length, size: data.length, offset: this.offset,
      time: (modified.getHours() << 11) | (modified.getMinutes() << 5) | (modified.getSeconds() >> 1),
      date: ((year - 1980) << 9) | ((modified.getMonth() + 1) << 5) | modified.getDate(),
    };
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x0800, 6);
    header.writeUInt16LE(entry.method, 8);
    header.writeUInt16LE(entry.time, 10);
    header.writeUInt16LE(entry.date, 12);
    header.writeUInt32LE(entry.crc, 14);
    header.writeUInt32LE(entry.packed, 18);
    header.writeUInt32LE(entry.size, 22);
    header.writeUInt16LE(nameBytes.length, 26);
    this.write(header);
    this.write(nameBytes);
    this.write(body);
    this.entries.push(entry);
  }

  close() {
    const start = this.offset;
    for (const entry of this.entries) {
      const header = Buffer.alloc(46);
      header.writeUInt32LE(0x02014b50, 0);
      header.writeUInt16LE(20, 4);
      header.writeUInt16LE(20, 6);
      header.writeUInt16LE(0x0800, 8);
      header.writeUInt16LE(entry.method, 10);
      header.writeUInt16LE(entry.time, 12);
      header.writeUInt16LE(entry.date, 14);
      header.writeUInt32LE(entry.crc, 16);
      header.writeUInt32LE(entry.packed, 20);
      header.writeUInt32LE(entry.size, 24);
      header.writeUInt16LE(entry.nameBytes.length, 28);
      header.writeUInt32LE(entry.offset, 42);
      this.write(header);
      this.write(entry.nameBytes);
    }
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(this.entries.length, 8);
    end.writeUInt16LE(this.entries.length, 10);
    end.writeUInt32LE(this.offset - start, 12);
    end.writeUInt32LE(start, 16);
    this.write(end);
    fs.closeSync(this.descriptor);
  }
}

const startDirectory = path.resolve(argument('--repo') ?? process.cwd());
const repoRoot = realPath(git(['rev-parse', '--show-toplevel'], startDirectory) || startDirectory);
const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
const outDirectory = path.resolve(argument('--out') ?? path.join(repoRoot, '.workspace', 'export'));

const sessionDirectories = SESSION_FOLDERS.map((name) => path.join(codexHome, name)).filter((directory) => fs.existsSync(directory));
if (sessionDirectories.length === 0) {
  console.error(`No Codex sessions found: ${path.join(codexHome, 'sessions')} does not exist.`);
  process.exit(1);
}

const titles = readTitles(codexHome);
const folders = new Map();
for (const directory of sessionDirectories) {
  for (const file of walk(directory).filter((name) => path.basename(name).startsWith('rollout-') && name.endsWith('.jsonl'))) {
    const meta = firstRecord(file);
    const cwd = meta?.type === 'session_meta' ? meta.payload?.cwd : null;
    if (!cwd) continue;
    const inside = [cwd, realPath(cwd)].find((candidate) => isInside(repoRoot, candidate));
    if (!inside) continue;
    const relative = path.relative(repoRoot, inside);
    const name = relative === '' ? '_root' : relative.split(path.sep).join('-');
    if (!folders.has(name)) folders.set(name, []);
    folders.get(name).push({ file, meta: meta.payload });
  }
}

if (folders.size === 0) {
  console.error(`No Codex sessions are recorded for ${repoRoot}.`);
  process.exit(1);
}

const userName = git(['config', 'user.name'], repoRoot) || os.userInfo().username;
const userEmail = git(['config', 'user.email'], repoRoot);
const now = new Date();
const pad = (value) => String(value).padStart(2, '0');
const stampText = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
const slug = userName.normalize('NFKD').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'student';

fs.mkdirSync(outDirectory, { recursive: true });
const zipPath = path.join(outDirectory, `${slug}-codex-${stampText}.zip`);
const zip = new ZipWriter(zipPath);
const manifest = {
  tool: 'codex', scriptVersion: SCRIPT_VERSION, generatedAt: now.toISOString(), repoRoot, codexHome,
  platform: process.platform, node: process.version, gitUserName: userName, gitUserEmail: userEmail, folders: [],
};
let rawBytes = 0;

for (const [name, sessions] of [...folders].sort()) {
  const folderEntry = { name, sessions: [] };
  for (const { file, meta } of sessions.sort((a, b) => a.file.localeCompare(b.file))) {
    const data = fs.readFileSync(file);
    rawBytes += data.length;
    const relative = path.relative(codexHome, file).split(path.sep);
    zip.add(['raw', name, ...relative].join('/'), data, fs.statSync(file).mtime);

    const records = parseLines(data);
    const summary = summarize(records);
    const threadId = meta.id ?? path.basename(file, '.jsonl');
    const spawn = meta.source?.subagent?.thread_spawn;
    const parentThreadId = meta.parent_thread_id ?? spawn?.parent_thread_id ?? null;
    const agentPath = spawn?.agent_path ?? (typeof meta.source?.subagent === 'string' ? meta.source.subagent : null);
    const title = titles.get(threadId) ?? null;
    folderEntry.sessions.push({
      threadId, sessionId: meta.session_id ?? threadId, parentThreadId, agentPath, title, file: relative.join('/'),
      bytes: data.length, source: meta.source ?? null, originator: meta.originator ?? null, cliVersion: meta.cli_version ?? null,
      ...summary,
    });
    const target = parentThreadId ? ['readable', name, parentThreadId, `${threadId}.txt`] : ['readable', name, `${threadId}.txt`];
    zip.add(target.join('/'), Buffer.from(render(records, [
      `Thread: ${threadId}`, `Title: ${title ?? ''}`, `Parent thread: ${parentThreadId ?? ''}`, `Agent: ${agentPath ?? ''}`,
      `Working directory: ${meta.cwd ?? ''}`, `From: ${summary.firstTimestamp ?? ''}  To: ${summary.lastTimestamp ?? ''}`,
      `Model: ${summary.models.join(', ')}  Codex: ${meta.cli_version ?? ''}`,
    ]), 'utf8'));
  }
  manifest.folders.push(folderEntry);
}

manifest.workspace = {};
for (const folderName of WORKSPACE_FOLDERS) {
  const directory = path.join(repoRoot, '.workspace', folderName);
  const files = fs.existsSync(directory) ? walk(directory) : [];
  for (const file of files) {
    const relative = path.relative(directory, file).split(path.sep);
    zip.add(['workspace', folderName, ...relative].join('/'), fs.readFileSync(file), fs.statSync(file).mtime);
  }
  manifest.workspace[folderName] = files.length;
}

zip.add('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'));
zip.close();

const megabytes = (bytes) => (bytes / 1024 / 1024).toFixed(1);
for (const folder of manifest.folders) {
  const subagents = folder.sessions.filter((session) => session.parentThreadId).length;
  console.log(`${folder.name}: ${folder.sessions.length - subagents} sessions, ${subagents} subagent threads`);
}
for (const folderName of WORKSPACE_FOLDERS) console.log(`.workspace/${folderName}: ${manifest.workspace[folderName]} files`);
console.log(`Raw size: ${megabytes(rawBytes)} MB, archive: ${megabytes(fs.statSync(zipPath).size)} MB`);
console.log(zipPath);
