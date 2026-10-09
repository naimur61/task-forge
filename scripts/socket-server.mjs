#!/usr/bin/env node
/**
 * Demo real-time server (socket.io) for the TaskForge demo API.
 *
 *   npm run socket        # listens on http://localhost:4001
 *
 * How it works:
 *   1. A browser connects with its access token. We check the token by calling
 *      the API (/auth/me) and put the socket in `user:<id>` and in
 *      `project:<id>` for every project the user belongs to.
 *   2. The demo API calls POST /emit after every change. We forward the event
 *      to the right room, and keep room membership in sync when people are
 *      added to or removed from projects.
 *
 * The real backend replaces this file with its own socket.io gateway.
 */

import { createServer } from 'node:http';
import { Server } from 'socket.io';

const PORT = Number(process.env.SOCKET_PORT ?? 4001);
const API_URL = process.env.SOCKET_API_URL ?? 'http://localhost:3000/api/mock';
const CLIENT_ORIGIN = process.env.SOCKET_CLIENT_ORIGIN ?? 'http://localhost:3000';
const EMIT_SECRET = process.env.SOCKET_EMIT_SECRET ?? 'dev-secret';

/** GET an API path as the given user. Returns the JSON body, or null on error. */
async function apiGet(path, token) {
  try {
    const res = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

/** Read a JSON request body. */
function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

const httpServer = createServer(async (req, res) => {
  // Internal endpoint: the API tells us something changed.
  if (req.method === 'POST' && req.url === '/emit') {
    if (req.headers['x-emit-secret'] !== EMIT_SECRET) {
      res.writeHead(401).end();
      return;
    }
    const { room, event, payload } = await readBody(req);
    if (!room || !event) {
      res.writeHead(400).end();
      return;
    }

    const projectRoom = payload?.projectId ? `project:${payload.projectId}` : null;
    // New members (and creators of new projects) start receiving the project's events.
    if (event === 'member.added' && projectRoom) io.in(`user:${payload.userId}`).socketsJoin(projectRoom);
    if (event === 'project.created' && projectRoom) io.in(`user:${payload.actorId}`).socketsJoin(projectRoom);

    io.to(room).emit(event, payload);

    // Removed members stop receiving events after they get the "you were removed" message.
    if (event === 'member.removed' && projectRoom) io.in(`user:${payload.userId}`).socketsLeave(projectRoom);
    if (event === 'project.deleted' && projectRoom) io.in(projectRoom).socketsLeave(projectRoom);

    res.writeHead(204).end();
    return;
  }

  res.writeHead(404).end();
});

const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, credentials: true },
});

// Only signed-in users may connect.
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  const me = token ? await apiGet('/auth/me', token) : null;
  if (!me?.id) return next(new Error('unauthorized'));
  socket.data.userId = me.id;
  socket.data.token = token;
  next();
});

io.on('connection', async (socket) => {
  const { userId, token } = socket.data;
  socket.join(`user:${userId}`);

  const projects = await apiGet('/projects?limit=100', token);
  for (const project of projects?.data ?? []) socket.join(`project:${project.id}`);

  console.log(`[socket] ${userId} connected (${projects?.data?.length ?? 0} projects)`);
  socket.on('disconnect', () => console.log(`[socket] ${userId} disconnected`));
});

httpServer.listen(PORT, () => {
  console.log(`[socket] demo real-time server on http://localhost:${PORT} (API: ${API_URL})`);
});
