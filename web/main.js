const API_URL = `${window.location.protocol}//${window.location.hostname}:4000`;

const byId = (id) => document.getElementById(id);

const state = {
  authToken: null,
  loading: false,
};

function setMessage(message, kind = "info") {
  const loginMsg = byId("loginMsg");
  if (!loginMsg) return;
  loginMsg.textContent = message;
  loginMsg.dataset.kind = kind;
}

function setOutput(id, value) {
  const node = byId(id);
  if (!node) return;
  node.textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function scrollToSection(selector) {
  const target = document.querySelector(selector);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function readJson(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return { message: await response.text() };
}

async function fetchWithJson(url, options) {
  const response = await fetch(url, options);
  const data = await readJson(response);
  return { response, data };
}

function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
  return headers;
}

async function handleLogin(event) {
  event.preventDefault();
  if (state.loading) return;

  const email = byId("email").value.trim();
  const password = byId("password").value;
  if (!email || !password) {
    setMessage("Email and password are required.", "error");
    return;
  }

  state.loading = true;
  byId("loginBtn").disabled = true;
  setMessage("Signing in…", "info");

  try {
    const { response, data } = await fetchWithJson(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      state.authToken = null;
      setMessage(data.message || "Login failed.", "error");
      return;
    }

    state.authToken = data.token;
    setMessage(`Signed in as ${data.user.full_name}.`, "success");
    setOutput("accountsOut", `Welcome ${data.user.full_name}. Use “Load accounts” to inspect the live DB.`);
    scrollToSection("#insights");
  } catch (error) {
    state.authToken = null;
    setMessage(error.message || "Unable to sign in.", "error");
  } finally {
    state.loading = false;
    byId("loginBtn").disabled = false;
  }
}

async function handleLoadAccounts() {
  try {
    setOutput("accountsOut", "Loading accounts…");
    const { response, data } = await fetchWithJson(`${API_URL}/accounts`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error(data.message || "Unable to load accounts.");
    }
    setOutput("accountsOut", data);
  } catch (error) {
    setOutput("accountsOut", error.message);
  }
}

async function handleTransfer(event) {
  event.preventDefault();
  const senderAccountId = Number(byId("senderId").value);
  const recipientAccountId = Number(byId("recipientId").value);
  const amount = Number(byId("amount").value);

  try {
    setOutput("transferOut", "Submitting transfer…");
    const { response, data } = await fetchWithJson(`${API_URL}/transactions/transfer`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ senderAccountId, recipientAccountId, amount }),
    });

    if (!response.ok) {
      throw new Error(data.message || "Transfer failed.");
    }

    setOutput("transferOut", data);
    scrollToSection("#activity");
  } catch (error) {
    setOutput("transferOut", error.message);
  }
}

async function handleHistory() {
  try {
    setOutput("transferOut", "Loading history…");
    const { response, data } = await fetchWithJson(`${API_URL}/transactions/history`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error(data.message || "Unable to load history.");
    }
    setOutput("transferOut", data);
  } catch (error) {
    setOutput("transferOut", error.message);
  }
}

document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
document.getElementById("transferForm")?.addEventListener("submit", handleTransfer);
document.getElementById("loadAccountsBtn")?.addEventListener("click", handleLoadAccounts);
document.getElementById("historyBtn")?.addEventListener("click", handleHistory);
document.getElementById("historyBtnPanel")?.addEventListener("click", handleHistory);

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

setMessage("Use the demo account to sign in and unlock the live portal.");
