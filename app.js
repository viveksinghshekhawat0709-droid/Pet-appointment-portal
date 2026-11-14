// Default initial data so the portal works immediately on first load
const defaultProviders = [
  {
    id: 1,
    name: "Dr. Aarav Sharma",
    role: "Veterinarian",
    specialty: "General Checkup, Vaccinations & Diagnostics",
    schedule: "Mon-Sat, 10:00 AM - 4:00 PM",
    fee: 500
  },
  {
    id: 2,
    name: "Paws & Bubbles Studio",
    role: "Groomer",
    specialty: "Full Bath, Haircut, Ear Cleaning & Nail Trim",
    schedule: "Tue-Sun, 11:00 AM - 6:00 PM",
    fee: 800
  },
  {
    id: 3,
    name: "K9 Obedience Academy",
    role: "Trainer",
    specialty: "Puppy Socialization & Behavioral Training",
    schedule: "Mon-Fri, 09:00 AM - 1:00 PM",
    fee: 700
  }
];

const defaultPets = [
  {
    id: 101,
    name: "Bruno",
    species: "Dog",
    breed: "Golden Retriever",
    age: "2"
  }
];

const defaultAppointments = [
  {
    id: 5001,
    ownerName: "Guest Owner",
    petName: "Bruno (Dog)",
    providerName: "Dr. Aarav Sharma",
    service: "Veterinarian",
    date: "2026-11-20",
    time: "10:00 AM",
    notes: "Annual booster vaccination",
    status: "Confirmed"
  }
];

// Initialize localStorage
function initStorage() {
  if (!localStorage.getItem("pc_providers")) {
    localStorage.setItem("pc_providers", JSON.stringify(defaultProviders));
  }
  if (!localStorage.getItem("pc_pets")) {
    localStorage.setItem("pc_pets", JSON.stringify(defaultPets));
  }
  if (!localStorage.getItem("pc_appointments")) {
    localStorage.setItem("pc_appointments", JSON.stringify(defaultAppointments));
  }
}

initStorage();

// Helper getters & setters
const getProviders = () => JSON.parse(localStorage.getItem("pc_providers")) || [];
const saveProviders = (data) => localStorage.setItem("pc_providers", JSON.stringify(data));

const getPets = () => JSON.parse(localStorage.getItem("pc_pets")) || [];
const savePets = (data) => localStorage.setItem("pc_pets", JSON.stringify(data));

const getAppointments = () => JSON.parse(localStorage.getItem("pc_appointments")) || [];
const saveAppointments = (data) => localStorage.setItem("pc_appointments", JSON.stringify(data));

// --- PAGE 1: INDEX.HTML LOGIC ---
const ownerLoginForm = document.getElementById("ownerLoginForm");
if (ownerLoginForm) {
  ownerLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("ownerName").value.trim();
    const email = document.getElementById("ownerEmail").value.trim();
    localStorage.setItem("pc_currentUser", JSON.stringify({ name, email }));
    window.location.href = "dashboard.html";
  });
}

// --- PAGE 2: DASHBOARD.HTML (PET OWNER) LOGIC ---
if (document.getElementById("petList")) {
  const user = JSON.parse(localStorage.getItem("pc_currentUser"));
  if (user && user.name) {
    document.getElementById("welcomeHeading").textContent = `Welcome, ${user.name}!`;
  }

  // Prevent selecting past dates
  const dateInput = document.getElementById("apptDate");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  renderReminders();
  renderPets();
  renderProviders("All");
  renderOwnerAppointments();

  // Add Pet Profile
  document.getElementById("addPetForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pets = getPets();
    const newPet = {
      id: Date.now(),
      name: document.getElementById("petName").value.trim(),
      species: document.getElementById("petSpecies").value,
      breed: document.getElementById("petBreed").value.trim(),
      age: document.getElementById("petAge").value
    };
    pets.push(newPet);
    savePets(pets);
    e.target.reset();
    renderPets();
    alert(`${newPet.name}'s profile has been added!`);
  });

  // Filter Providers
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => {
        b.classList.remove("btn-primary");
        b.classList.add("btn-outline");
      });
      btn.classList.remove("btn-outline");
      btn.classList.add("btn-primary");
      renderProviders(btn.dataset.role);
    });
  });

  // Book Appointment
  document.getElementById("bookAppointmentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pets = getPets();
    if (pets.length === 0) {
      alert("Please add a pet profile first before booking an appointment.");
      return;
    }

    const providers = getProviders();
    const selectedProviderId = Number(document.getElementById("selectProvider").value);
    const provider = providers.find((p) => p.id === selectedProviderId);
    const currentUser = JSON.parse(localStorage.getItem("pc_currentUser")) || { name: "Pet Owner" };

    const appointments = getAppointments();
    const newAppt = {
      id: Math.floor(1000 + Math.random() * 9000),
      ownerName: currentUser.name,
      petName: document.getElementById("selectPet").value,
      providerName: provider.name,
      service: provider.role,
      date: document.getElementById("apptDate").value,
      time: document.getElementById("apptTime").value,
      notes: document.getElementById("apptNotes").value.trim() || "Regular session",
      status: "Pending"
    };

    appointments.unshift(newAppt);
    saveAppointments(appointments);
    e.target.reset();
    renderOwnerAppointments();
    renderReminders();
    alert("Appointment request submitted! Track its status in your service history.");
  });
}

function renderReminders() {
  const container = document.getElementById("reminderContainer");
  if (!container) return;
  const upcoming = getAppointments().filter((a) => a.status === "Confirmed");
  if (upcoming.length === 0) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = upcoming
    .map(
      (a) => `
      <div class="alert">
        <div>
          <strong>🔔 Upcoming Reminder:</strong> <strong>${a.petName}</strong> has a confirmed <strong>${a.service}</strong> appointment with <strong>${a.providerName}</strong> on <strong>${a.date}</strong> at <strong>${a.time}</strong>.
        </div>
      </div>`
    )
    .join("");
}

function renderPets() {
  const petList = document.getElementById("petList");
  const selectPet = document.getElementById("selectPet");
  const pets = getPets();

  if (pets.length === 0) {
    petList.innerHTML = `<p style="color: var(--muted);">No pets added yet. Use the form to add your pet.</p>`;
    selectPet.innerHTML = `<option value="">-- No pets available --</option>`;
    return;
  }

  petList.innerHTML = pets
    .map(
      (pet) => `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3>${pet.name}</h3>
          <span class="badge badge-vet">${pet.species}</span>
        </div>
        <p style="color: var(--muted); margin-top:0.4rem;"><strong>Breed:</strong> ${pet.breed}</p>
        <p style="color: var(--muted);"><strong>Age:</strong> ${pet.age} yrs</p>
        <button class="btn btn-danger btn-sm" style="margin-top:0.8rem;" onclick="deletePet(${pet.id})">Remove</button>
      </div>`
    )
    .join("");

  selectPet.innerHTML = pets
    .map((p) => `<option value="${p.name} (${p.species})">${p.name} - ${p.breed}</option>`)
    .join("");
}

window.deletePet = function (id) {
  const updated = getPets().filter((p) => p.id !== id);
  savePets(updated);
  renderPets();
};

function renderProviders(roleFilter) {
  const providerList = document.getElementById("providerList");
  const selectProvider = document.getElementById("selectProvider");
  const providers = getProviders();

  if (selectProvider) {
    selectProvider.innerHTML = providers
      .map((p) => `<option value="${p.id}">${p.name} (${p.role} - ₹${p.fee})</option>`)
      .join("");
  }

  const filtered = roleFilter === "All" ? providers : providers.filter((p) => p.role === roleFilter);

  providerList.innerHTML = filtered
    .map((p) => {
      const badgeClass =
        p.role === "Veterinarian"
          ? "badge-vet"
          : p.role === "Groomer"
          ? "badge-groomer"
          : "badge-trainer";
      return `
      <div class="card">
        <span class="badge ${badgeClass}">${p.role}</span>
        <h3 style="margin-top:0.6rem;">${p.name}</h3>
        <p style="color: var(--muted); font-size:0.9rem;">${p.specialty}</p>
        <p style="margin-top:0.6rem; font-size:0.9rem;"><strong>Availability:</strong> ${p.schedule}</p>
        <p style="font-size:0.9rem;"><strong>Fee:</strong> ₹${p.fee}</p>
        <button class="btn btn-primary btn-sm" style="margin-top:0.9rem;" onclick="selectProviderForBooking(${p.id})">Book Slot</button>
      </div>`;
    })
    .join("");
}

window.selectProviderForBooking = function (providerId) {
  const selectProvider = document.getElementById("selectProvider");
  selectProvider.value = providerId;
  document.getElementById("bookingSection").scrollIntoView({ behavior: "smooth" });
};

function renderOwnerAppointments() {
  const tbody = document.getElementById("ownerAppointmentsTable");
  if (!tbody) return;
  const appointments = getAppointments();

  if (appointments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--muted);">No appointments booked yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = appointments
    .map(
      (a) => `
      <tr>
        <td>#${a.id}</td>
        <td>${a.petName}</td>
        <td>${a.providerName}</td>
        <td>${a.service}</td>
        <td>${a.date} at ${a.time}</td>
        <td><span class="badge badge-${a.status.toLowerCase()}">${a.status}</span></td>
        <td>
          ${
            a.status === "Pending"
              ? `<button class="btn btn-danger btn-sm" onclick="updateAppointmentStatus(${a.id}, 'Cancelled')">Cancel</button>`
              : "-"
          }
        </td>
      </tr>`
    )
    .join("");
}

// --- PAGE 3: ADMIN.HTML (PROVIDER & ADMIN) LOGIC ---
if (document.getElementById("adminAppointmentsTable")) {
  renderAdminDashboard();

  document.getElementById("addProviderForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const providers = getProviders();
    const newProvider = {
      id: Date.now(),
      name: document.getElementById("provName").value.trim(),
      role: document.getElementById("provRole").value,
      specialty: document.getElementById("provSpecialty").value.trim(),
      schedule: document.getElementById("provSchedule").value.trim(),
      fee: Number(document.getElementById("provFee").value)
    };
    providers.push(newProvider);
    saveProviders(providers);
    e.target.reset();
    renderAdminDashboard();
    alert(`${newProvider.name} added to active service providers!`);
  });
}

function renderAdminDashboard() {
  const pets = getPets();
  const appointments = getAppointments();
  const providers = getProviders();

  document.getElementById("statPets").textContent = pets.length;
  document.getElementById("statPending").textContent = appointments.filter((a) => a.status === "Pending").length;
  document.getElementById("statConfirmed").textContent = appointments.filter(
    (a) => a.status === "Confirmed" || a.status === "Completed"
  ).length;
  document.getElementById("statProviders").textContent = providers.length;

  const tbody = document.getElementById("adminAppointmentsTable");
  tbody.innerHTML = appointments
    .map(
      (a) => `
      <tr>
        <td>#${a.id}</td>
        <td><strong>${a.ownerName}</strong><br><span style="color:var(--muted); font-size:0.85rem;">${a.petName}</span></td>
        <td>${a.providerName}<br><span style="color:var(--muted); font-size:0.85rem;">${a.service}</span></td>
        <td>${a.date}<br>${a.time}</td>
        <td style="font-size:0.85rem;">${a.notes}</td>
        <td><span class="badge badge-${a.status.toLowerCase()}">${a.status}</span></td>
        <td>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button class="btn btn-success btn-sm" onclick="updateAppointmentStatus(${a.id}, 'Confirmed')">Approve</button>
            <button class="btn btn-primary btn-sm" onclick="updateAppointmentStatus(${a.id}, 'Completed')">Complete</button>
            <button class="btn btn-danger btn-sm" onclick="updateAppointmentStatus(${a.id}, 'Cancelled')">Reject</button>
          </div>
        </td>
      </tr>`
    )
    .join("");

  const adminProviderList = document.getElementById("adminProviderList");
  adminProviderList.innerHTML = providers
    .map(
      (p) => `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3>${p.name}</h3>
          <span class="badge badge-vet">${p.role}</span>
        </div>
        <p style="color:var(--muted); font-size:0.9rem; margin-top:0.4rem;">${p.specialty}</p>
        <p style="font-size:0.85rem; margin-top:0.4rem;"><strong>Schedule:</strong> ${p.schedule}</p>
        <p style="font-size:0.85rem;"><strong>Fee:</strong> ₹${p.fee}</p>
        <button class="btn btn-danger btn-sm" style="margin-top:0.8rem;" onclick="deleteProvider(${p.id})">Remove Provider</button>
      </div>`
    )
    .join("");
}

window.updateAppointmentStatus = function (id, newStatus) {
  const appointments = getAppointments().map((a) => (a.id === id ? { ...a, status: newStatus } : a));
  saveAppointments(appointments);
  if (document.getElementById("adminAppointmentsTable")) renderAdminDashboard();
  if (document.getElementById("ownerAppointmentsTable")) {
    renderOwnerAppointments();
    renderReminders();
  }
};

window.deleteProvider = function (id) {
  const updated = getProviders().filter((p) => p.id !== id);
  saveProviders(updated);
  renderAdminDashboard();
};