let participants = JSON.parse(localStorage.getItem("participants")) || [];
let items = JSON.parse(localStorage.getItem("items")) || [];

function saveToLocal() {
  localStorage.setItem("participants", JSON.stringify(participants));
  localStorage.setItem("items", JSON.stringify(items));
}

function addParticipant() {
  const name = document.getElementById("participantInput").value.trim();
  if (!name) return;

  participants.push(name);
  saveToLocal();
  renderParticipants();
  renderCheckboxes();
  document.getElementById("participantInput").value = "";
}

function renderParticipants() {
  const ul = document.getElementById("participantList");
  ul.innerHTML = "";
  participants.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    ul.appendChild(li);
  });
}

function renderCheckboxes() {
  const container = document.getElementById("participantCheckboxes");
  container.innerHTML = "";
  participants.forEach(p => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = p;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(p));
    container.appendChild(label);
  });

  const payerSelect = document.getElementById("payerSelect");
  payerSelect.innerHTML = participants.map(p => `<option value="${p}">${p}</option>`).join("");
}

function addItem() {
  const name = document.getElementById("itemName").value;
  const price = parseFloat(document.getElementById("itemPrice").value);
  const checkboxes = document.querySelectorAll("#participantCheckboxes input:checked");
  const involved = Array.from(checkboxes).map(cb => cb.value);
  const payer = document.getElementById("payerSelect").value;

  if (!name || !price || involved.length === 0 || !payer) return;

  items.push({ name, price, involved, payer });
  saveToLocal();
  renderItems();
  document.getElementById("itemName").value = "";
  document.getElementById("itemPrice").value = "";
  checkboxes.forEach(cb => cb.checked = false);
}

function renderItems() {
  const ul = document.getElementById("itemList");
  ul.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - ₹${item.price} paid by ${item.payer} split between ${item.involved.join(", ")}`;
    ul.appendChild(li);
  });
}

function calculateSplit() {
  const result = document.getElementById("result");
  const owed = {};
  const paid = {};
  participants.forEach(p => {
    owed[p] = 0;
    paid[p] = 0;
  });

  items.forEach(item => {
    const share = item.price / item.involved.length;
    item.involved.forEach(p => {
      owed[p] += share;
    });
    paid[item.payer] += item.price;
  });

  const balances = {};
  participants.forEach(p => {
    balances[p] = paid[p] - owed[p];
  });

  result.innerHTML = "<h4>Summary</h4>";
  participants.forEach(p => {
    const div = document.createElement("div");
    const net = balances[p];
    div.textContent = `${p}: ${net > 0 ? "Gets" : "Owes"} ₹${Math.abs(net).toFixed(2)}`;
    result.appendChild(div);
  });

  result.innerHTML += "<h4>Settlement</h4>";
  const givers = [];
  const takers = [];

  for (const person in balances) {
    const amt = balances[person];
    if (amt < 0) givers.push({ person, amt: -amt });
    else if (amt > 0) takers.push({ person, amt });
  }

  let settlements = "";

  while (givers.length && takers.length) {
    const giver = givers[0];
    const taker = takers[0];
    const min = Math.min(giver.amt, taker.amt);
    settlements += `${giver.person} pays ₹${min.toFixed(2)} to ${taker.person}<br>`;
    giver.amt -= min;
    taker.amt -= min;

    if (giver.amt === 0) givers.shift();
    if (taker.amt === 0) takers.shift();
  }

  result.innerHTML += settlements || "<div>All settled up!</div>";
}



renderParticipants();
renderItems();
renderCheckboxes();