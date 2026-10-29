/* Shared helpers for the Learner Feedback form and report. */
(function () {
  'use strict';

  // ---- Safe storage (private windows or blocked storage must not break the page) ----
  const store = {
    get(k, fallback) {
      try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; }
    },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  // ---- IDs and time ----
  function randHex(n) {
    const a = new Uint8Array(Math.ceil(n / 2));
    (window.crypto || window.msCrypto).getRandomValues(a);
    return Array.from(a, b => b.toString(16).padStart(2, '0')).join('').slice(0, n);
  }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const h = randHex(32);
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
  }
  // Pseudonymous ID kept in this browser. Browsers do not expose hardware IDs.
  function deviceId() {
    let id = store.get('eimfb.device', null);
    if (!id) {
      id = 'D-' + randHex(8).toUpperCase();
      if (!store.set('eimfb.device', id)) id += '-T'; // T = temporary, storage blocked
    }
    return id;
  }
  function isoLocal(d) {
    d = d || new Date();
    const pad = n => String(Math.abs(n)).padStart(2, '0');
    const off = -d.getTimezoneOffset();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' +
      pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) +
      (off >= 0 ? '+' : '-') + pad(Math.floor(Math.abs(off) / 60)) + ':' + pad(Math.abs(off) % 60);
  }
  function fmtDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return String(iso);
    return d.toLocaleString('en-AU', { day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Australia/Brisbane' }) + ' AEST';
  }

  // ---- SHA-256 (Web Crypto, with a pure JS fallback for older or non-secure contexts) ----
  function sha256Fallback(str) {
    const bytes = new TextEncoder().encode(str);
    const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const l = bytes.length, withOne = l + 1, total = Math.ceil((withOne + 8) / 64) * 64;
    const m = new Uint8Array(total); m.set(bytes); m[l] = 0x80;
    const bits = l * 8, dv = new DataView(m.buffer);
    dv.setUint32(total - 8, Math.floor(bits / 2 ** 32)); dv.setUint32(total - 4, bits >>> 0);
    const w = new Uint32Array(64), r = (x, n) => (x >>> n) | (x << (32 - n));
    for (let i = 0; i < total; i += 64) {
      for (let t = 0; t < 16; t++) w[t] = dv.getUint32(i + t * 4);
      for (let t = 16; t < 64; t++) {
        const s0 = r(w[t-15], 7) ^ r(w[t-15], 18) ^ (w[t-15] >>> 3);
        const s1 = r(w[t-2], 17) ^ r(w[t-2], 19) ^ (w[t-2] >>> 10);
        w[t] = (w[t-16] + s0 + w[t-7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let t = 0; t < 64; t++) {
        const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + w[t]) >>> 0;
        const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    return H.map(x => x.toString(16).padStart(8, '0')).join('');
  }
  async function sha256(str) {
    try {
      if (window.crypto && crypto.subtle) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) { /* fall through */ }
    return sha256Fallback(str);
  }

  // ---- Talking to the Apps Script backend ----
  // text/plain keeps the request "simple", so the browser sends no CORS preflight.
  // Errors caused by the connection or the server (not by the response itself) are marked
  // retryable, so the form can keep the response on the device and send it again later.
  function retryable(msg) { const e = new Error(msg); e.retryable = true; return e; }
  async function post(endpoint, body, timeoutMs) {
    const ctl = window.AbortController ? new AbortController() : null;
    const timer = ctl ? setTimeout(() => ctl.abort(), timeoutMs || 30000) : null;
    let res, data;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body),
        redirect: 'follow',
        signal: ctl ? ctl.signal : undefined
      });
      if (!res.ok) throw retryable('Server returned ' + res.status);
      try { data = await res.json(); } catch (e) { throw retryable('The server sent an unexpected reply.'); }
    } catch (e) {
      if (e.retryable) throw e;
      throw retryable(e.name === 'AbortError' ? 'The server took too long to reply.' : 'Could not reach the server.');
    } finally {
      if (timer) clearTimeout(timer);
    }
    if (!data.ok) {
      const msg = data.error || 'Request was not accepted';
      if (/^Server error|busy|lock|timed? ?out/i.test(msg)) throw retryable(msg);
      throw new Error(msg);
    }
    return data;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function questionText(q, program) {
    return (q.textBy && q.textBy[program]) || q.text;
  }

  window.FB = { store, uuid, deviceId, isoLocal, fmtDateTime, sha256, post, esc, questionText };
})();
