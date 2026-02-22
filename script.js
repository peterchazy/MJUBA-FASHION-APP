const STORAGE_KEY = "tailoring_app_data_v1";

const translations = {
  en: {
    appTitle: "Tailoring Management System",
    appSubtitle: "Manage customers, measurements, orders, and payments.",
    customerSection: "Add Customer",
    name: "Name",
    phone: "Phone",
    addCustomer: "Add Customer",
    measurementSection: "Add Measurements",
    customer: "Customer",
    chest: "Chest",
    waist: "Waist",
    hips: "Hips",
    length: "Length",
    saveMeasurement: "Save Measurement",
    orderSection: "Create Order",
    design: "Design/Item",
    totalAmount: "Total Amount",
    deadline: "Deadline",
    createOrder: "Create Order",
    paymentSection: "Payments & Balance",
    order: "Order",
    paymentAmount: "Payment Amount",
    addPayment: "Add Payment",
    noCustomers: "No customers yet.",
    noMeasurements: "No measurements yet.",
    noOrders: "No orders yet.",
    noFinance: "No payment records yet.",
    paid: "Paid",
    balance: "Balance",
    forOrder: "for order",
    on: "on",
    customerAdded: "Customer added successfully.",
    measurementSaved: "Measurements saved.",
    orderCreated: "Order created successfully.",
    paymentSaved: "Payment added."
  },
  sw: {
    appTitle: "Mfumo wa Usimamizi wa Ushonaji",
    appSubtitle: "Simamia wateja, vipimo, oda na malipo.",
    customerSection: "Ongeza Mteja",
    name: "Jina",
    phone: "Simu",
    addCustomer: "Ongeza Mteja",
    measurementSection: "Ongeza Vipimo",
    customer: "Mteja",
    chest: "Kifua",
    waist: "Kiuno",
    hips: "Nyonga",
    length: "Urefu",
    saveMeasurement: "Hifadhi Vipimo",
    orderSection: "Tengeneza Oda",
    design: "Muundo/Bidhaa",
    totalAmount: "Jumla ya Kiasi",
    deadline: "Mwisho wa Kukamilisha",
    createOrder: "Tengeneza Oda",
    paymentSection: "Malipo na Salio",
    order: "Oda",
    paymentAmount: "Kiasi cha Malipo",
    addPayment: "Ongeza Malipo",
    noCustomers: "Bado hakuna wateja.",
    noMeasurements: "Bado hakuna vipimo.",
    noOrders: "Bado hakuna oda.",
    noFinance: "Bado hakuna rekodi za malipo.",
    paid: "Imelipwa",
    balance: "Salio",
    forOrder: "kwa oda",
    on: "tarehe",
    customerAdded: "Mteja ameongezwa kikamilifu.",
    measurementSaved: "Vipimo vimehifadhiwa.",
    orderCreated: "Oda imetengenezwa kikamilifu.",
    paymentSaved: "Malipo yameongezwa."
  }
};

const state = loadState();

const customerForm = document.getElementById("customerForm");
const measurementForm = document.getElementById("measurementForm");
const orderForm = document.getElementById("orderForm");
const paymentForm = document.getElementById("paymentForm");
const langToggle = document.getElementById("langToggle");

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const defaults = {
    lang: "en",
    customers: [],
    measurements: [],
    orders: [],
    payments: []
  };

  if (!raw) return defaults;

  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function t(key) {
  return translations[state.lang][key] || key;
}

function formatCurrency(value) {
  return new Intl.NumberFormat(state.lang === "sw" ? "sw-TZ" : "en-US", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function notify(messageKey) {
  window.alert(t(messageKey));
}

function setLanguage(lang) {
  state.lang = lang;
  saveState();

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  langToggle.textContent = state.lang === "en" ? "SW" : "EN";
  renderAll();
}

function getCustomerName(customerId) {
  return state.customers.find((c) => c.id === customerId)?.name || "-";
}

function renderCustomerOptions() {
  const customerSelects = [
    document.getElementById("measurementCustomer"),
    document.getElementById("orderCustomer")
  ];

  customerSelects.forEach((select) => {
    select.innerHTML = "";
    state.customers.forEach((customer) => {
      const option = document.createElement("option");
      option.value = customer.id;
      option.textContent = `${customer.name} (${customer.phone})`;
      select.appendChild(option);
    });
  });
}

function renderOrderOptions() {
  const paymentOrder = document.getElementById("paymentOrder");
  paymentOrder.innerHTML = "";

  state.orders.forEach((order) => {
    const option = document.createElement("option");
    option.value = order.id;
    option.textContent = `#${order.id.slice(-4)} - ${getCustomerName(order.customerId)} (${order.design})`;
    paymentOrder.appendChild(option);
  });
}

function renderCustomers() {
  const list = document.getElementById("customerList");
  list.innerHTML = "";

  if (!state.customers.length) {
    list.innerHTML = `<li class="empty">${t("noCustomers")}</li>`;
    return;
  }

  state.customers.forEach((customer) => {
    const li = document.createElement("li");
    li.textContent = `${customer.name} • ${customer.phone}`;
    list.appendChild(li);
  });
}

function renderMeasurements() {
  const list = document.getElementById("measurementList");
  list.innerHTML = "";

  if (!state.measurements.length) {
    list.innerHTML = `<li class="empty">${t("noMeasurements")}</li>`;
    return;
  }

  [...state.measurements].reverse().forEach((m) => {
    const li = document.createElement("li");
    li.textContent = `${getCustomerName(m.customerId)} — ${t("chest")}: ${m.chest}, ${t("waist")}: ${m.waist}, ${t("hips")}: ${m.hips}, ${t("length")}: ${m.length}`;
    list.appendChild(li);
  });
}

function calculatePaid(orderId) {
  return state.payments
    .filter((p) => p.orderId === orderId)
    .reduce((sum, payment) => sum + payment.amount, 0);
}

function renderOrders() {
  const list = document.getElementById("orderList");
  list.innerHTML = "";

  if (!state.orders.length) {
    list.innerHTML = `<li class="empty">${t("noOrders")}</li>`;
    return;
  }

  [...state.orders].reverse().forEach((order) => {
    const paid = calculatePaid(order.id);
    const balance = order.total - paid;

    const li = document.createElement("li");
    li.textContent = `${getCustomerName(order.customerId)} • ${order.design} • ${formatCurrency(order.total)} • ${t("paid")}: ${formatCurrency(paid)} • ${t("balance")}: ${formatCurrency(balance)} • ${t("deadline")}: ${order.deadline}`;
    list.appendChild(li);
  });
}

function renderFinanceSummary() {
  const box = document.getElementById("financeSummary");
  box.innerHTML = "";

  if (!state.orders.length) {
    box.innerHTML = `<div class="item empty">${t("noFinance")}</div>`;
    return;
  }

  [...state.orders].reverse().forEach((order) => {
    const paid = calculatePaid(order.id);
    const balance = order.total - paid;

    const item = document.createElement("div");
    item.className = `item ${balance > 0 ? "balance-danger" : ""}`;
    item.textContent = `${getCustomerName(order.customerId)} ${t("forOrder")} ${order.design} — ${t("paid")}: ${formatCurrency(paid)} | ${t("balance")}: ${formatCurrency(balance)}`;
    box.appendChild(item);
  });
}

function renderAll() {
  renderCustomerOptions();
  renderOrderOptions();
  renderCustomers();
  renderMeasurements();
  renderOrders();
  renderFinanceSummary();
}

customerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  if (!name || !phone) return;

  state.customers.push({
    id: crypto.randomUUID(),
    name,
    phone
  });

  saveState();
  renderAll();
  customerForm.reset();
  notify("customerAdded");
});

measurementForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!state.customers.length) return;

  state.measurements.push({
    id: crypto.randomUUID(),
    customerId: document.getElementById("measurementCustomer").value,
    chest: Number(document.getElementById("chest").value),
    waist: Number(document.getElementById("waist").value),
    hips: Number(document.getElementById("hips").value),
    length: Number(document.getElementById("length").value)
  });

  saveState();
  renderAll();
  measurementForm.reset();
  notify("measurementSaved");
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!state.customers.length) return;

  state.orders.push({
    id: crypto.randomUUID(),
    customerId: document.getElementById("orderCustomer").value,
    design: document.getElementById("orderDesign").value.trim(),
    total: Number(document.getElementById("orderTotal").value),
    deadline: document.getElementById("orderDeadline").value
  });

  saveState();
  renderAll();
  orderForm.reset();
  notify("orderCreated");
});

paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!state.orders.length) return;

  state.payments.push({
    id: crypto.randomUUID(),
    orderId: document.getElementById("paymentOrder").value,
    amount: Number(document.getElementById("paymentAmount").value),
    date: new Date().toISOString()
  });

  saveState();
  renderAll();
  paymentForm.reset();
  notify("paymentSaved");
});

langToggle.addEventListener("click", () => {
  setLanguage(state.lang === "en" ? "sw" : "en");
});

setLanguage(state.lang);
