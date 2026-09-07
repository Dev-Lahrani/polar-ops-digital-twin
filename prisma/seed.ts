import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const USERS = [
  { id: "user_1", name: "Station Commander", email: "commander@maitri.gov.in", password: "maitri2026", role: "ADMIN" as const },
  { id: "user_2", name: "Operations Engineer", email: "ops@bharati.gov.in", password: "bharati2026", role: "ENGINEER" as const },
  { id: "user_3", name: "Mission Viewer", email: "viewer@ncpor.gov.in", password: "viewer2026", role: "VIEWER" as const },
];

const STATIONS = [
  {
    id: "maitri",
    name: "Maitri",
    latitude: -70.7667,
    longitude: 23.2667,
    crewMax: 40,
    crewCount: 25,
    temperature: -32,
    windSpeed: 45,
    riskLevel: "WARNING",
    fuelCurrentL: 27000,
    fuelCapacityL: 50000,
    fuelDaysRemaining: 25,
    waterDaysRemaining: 18,
    foodDaysRemaining: 45,
    generatorLoad: 82,
    nextResupplyDays: 28,
    subsystems: [
      { subsystemId: "habitat", name: "Central Habitat", type: "habitat", status: "NOMINAL", loadPercent: 68, details: { Capacity: "25 personnel", Temperature: "22°C", AirQuality: "Good (AQI 42)", PowerDraw: "120 kW", Uptime: "99.97%" } },
      { subsystemId: "generator", name: "Generator Room", type: "power", status: "WARNING", loadPercent: 82, details: { Type: "Diesel Generators x3", Output: "500 kW total", ActiveUnits: "2 / 3", FuelRate: "45 L/hr", NextService: "120 hrs" } },
      { subsystemId: "fuel", name: "Fuel Storage", type: "storage", status: "NOMINAL", loadPercent: 54, details: { Capacity: "50,000 L", Current: "27,000 L", Rate: "-45 L/hr", DaysRemaining: "25 days", LastDelivery: "2026-08-15" } },
      { subsystemId: "hvac", name: "HVAC System", type: "climate", status: "NOMINAL", loadPercent: 71, details: { HeatingLoad: "85 kW", CoolingLoad: "20 kW", OutdoorTemp: "-32°C", SetPoint: "22°C", Efficiency: "94%" } },
      { subsystemId: "water", name: "Water Treatment", type: "water", status: "CRITICAL", loadPercent: 95, details: { Output: "2,400 L/day", Demand: "2,280 L/day", Reserve: "8,000 L", FilterAge: "87%", Alert: "Filter replacement due" } },
      { subsystemId: "comms", name: "Communications", type: "comms", status: "NOMINAL", loadPercent: 34, details: { Link: "VSAT Ku-band", Bandwidth: "10 Mbps", Latency: "680 ms", Uptime: "99.9%", NextWindow: "14:30 UTC" } },
      { subsystemId: "science", name: "Science Lab", type: "science", status: "NOMINAL", loadPercent: 58, details: { ActiveExperiments: "4", SamplesStored: "127", TempRange: "-80°C to +40°C", PowerDraw: "35 kW", Status: "All nominal" } },
      { subsystemId: "emergency", name: "Emergency Systems", type: "safety", status: "NOMINAL", loadPercent: 12, details: { FireSuppression: "Armed", MedBay: "Stocked", EvacRoutes: "3 clear", BackupPower: "Standby", LastDrill: "2026-08-28" } },
    ],
  },
  {
    id: "bharati",
    name: "Bharati",
    latitude: -69.3731,
    longitude: 76.375,
    crewMax: 47,
    crewCount: 35,
    temperature: -18,
    windSpeed: 38,
    riskLevel: "CAUTION",
    fuelCurrentL: 204000,
    fuelCapacityL: 204000,
    fuelDaysRemaining: 164,
    waterDaysRemaining: 65,
    foodDaysRemaining: 75,
    generatorLoad: 68,
    nextResupplyDays: 45,
    subsystems: [
      { subsystemId: "habitat", name: "Central Habitat", type: "habitat", status: "NOMINAL", loadPercent: 45, details: { Capacity: "35 personnel", Temperature: "21°C", AirQuality: "Good (AQI 38)", PowerDraw: "95 kW", Uptime: "99.99%" } },
      { subsystemId: "generator", name: "Generator Room", type: "power", status: "NOMINAL", loadPercent: 56, details: { Type: "Wind-Diesel Hybrid", Output: "750 kW total", ActiveUnits: "All operational", FuelRate: "30 L/hr", WindContribution: "35%" } },
      { subsystemId: "fuel", name: "Fuel Storage", type: "storage", status: "NOMINAL", loadPercent: 72, details: { Capacity: "204,000 L", Current: "204,000 L", Rate: "-52 L/hr", DaysRemaining: "164 days", LastDelivery: "2026-07-01" } },
      { subsystemId: "hvac", name: "HVAC System", type: "climate", status: "WARNING", loadPercent: 78, details: { HeatingLoad: "110 kW", CoolingLoad: "15 kW", OutdoorTemp: "-28°C", SetPoint: "21°C", Efficiency: "89%" } },
      { subsystemId: "water", name: "Water Treatment", type: "water", status: "NOMINAL", loadPercent: 40, details: { Output: "3,200 L/day", Demand: "1,800 L/day", Reserve: "15,000 L", FilterAge: "42%", Alert: "None" } },
      { subsystemId: "comms", name: "Communications", type: "comms", status: "NOMINAL", loadPercent: 28, details: { Link: "VSAT Ka-band + Iridium", Bandwidth: "25 Mbps", Latency: "620 ms", Uptime: "99.95%", NextWindow: "Continuous" } },
      { subsystemId: "science", name: "Science Lab", type: "science", status: "NOMINAL", loadPercent: 63, details: { ActiveExperiments: "7", SamplesStored: "243", TempRange: "-80°C to +40°C", PowerDraw: "50 kW", Status: "All nominal" } },
      { subsystemId: "emergency", name: "Emergency Systems", type: "safety", status: "NOMINAL", loadPercent: 8, details: { FireSuppression: "Armed", MedBay: "Stocked", EvacRoutes: "4 clear", BackupPower: "Standby", LastDrill: "2026-09-01" } },
    ],
  },
];

const COMPONENTS = [
  { id: "gen_primary", name: "Primary Diesel Generator", category: "power", weibullShape: 2.5, weibullScale: 15000, operatingHours: 8760, mtbf: 13320, lastMaintenanceDate: "2026-07-15", nextScheduledMaintenance: "2026-10-15" },
  { id: "gen_secondary", name: "Secondary Diesel Generator", category: "power", weibullShape: 2.8, weibullScale: 18000, operatingHours: 6500, mtbf: 16010, lastMaintenanceDate: "2026-08-01", nextScheduledMaintenance: "2026-11-01" },
  { id: "gen_backup", name: "Emergency Backup Generator", category: "power", weibullShape: 2.2, weibullScale: 12000, operatingHours: 2100, mtbf: 10660, lastMaintenanceDate: "2026-06-20", nextScheduledMaintenance: "2026-12-20" },
  { id: "hvac_main", name: "HVAC Heating System", category: "life-support", weibullShape: 3.0, weibullScale: 20000, operatingHours: 10200, mtbf: 17900, lastMaintenanceDate: "2026-08-10", nextScheduledMaintenance: "2026-11-10" },
  { id: "water_ro", name: "RO Water Treatment Plant", category: "life-support", weibullShape: 2.0, weibullScale: 10000, operatingHours: 7800, mtbf: 8860, lastMaintenanceDate: "2026-07-01", nextScheduledMaintenance: "2026-10-01" },
  { id: "water_filters", name: "Water Filter Assembly", category: "life-support", weibullShape: 1.5, weibullScale: 3000, operatingHours: 2800, mtbf: 2000, lastMaintenanceDate: "2026-09-01", nextScheduledMaintenance: "2026-10-01" },
  { id: "comms_vsat", name: "VSAT Antenna System", category: "comms", weibullShape: 3.5, weibullScale: 25000, operatingHours: 5400, mtbf: 22490, lastMaintenanceDate: "2026-08-15", nextScheduledMaintenance: "2027-02-15" },
  { id: "comms_iridium", name: "Iridium Backup Transceiver", category: "comms", weibullShape: 2.0, weibullScale: 15000, operatingHours: 4200, mtbf: 13320, lastMaintenanceDate: "2026-07-20", nextScheduledMaintenance: "2027-01-20" },
  { id: "solar_panels", name: "Solar Panel Array", category: "power", weibullShape: 1.8, weibullScale: 22000, operatingHours: 12000, mtbf: 19630, lastMaintenanceDate: "2026-06-01", nextScheduledMaintenance: "2026-12-01" },
  { id: "battery_bank", name: "Battery Storage Bank", category: "power", weibullShape: 2.3, weibullScale: 8000, operatingHours: 7000, mtbf: 7110, lastMaintenanceDate: "2026-08-20", nextScheduledMaintenance: "2026-11-20" },
  { id: "refrigeration", name: "Cold Storage / Freezer Units", category: "life-support", weibullShape: 2.7, weibullScale: 14000, operatingHours: 9500, mtbf: 12530, lastMaintenanceDate: "2026-07-25", nextScheduledMaintenance: "2026-10-25" },
  { id: "fire_suppression", name: "Fire Suppression System", category: "safety", weibullShape: 4.0, weibullScale: 30000, operatingHours: 10200, mtbf: 27200, lastMaintenanceDate: "2026-09-01", nextScheduledMaintenance: "2027-03-01" },
];

const INVENTORY = [
  { name: "Diesel Fuel", category: "fuel", currentAmount: 27000, maxCapacity: 50000, unit: "L", reorderPoint: 10000, unitCost: 1.2 },
  { name: "Drinking Water", category: "fuel", currentAmount: 8000, maxCapacity: 20000, unit: "L", reorderPoint: 5000, unitCost: 0.5 },
  { name: "Food Rations", category: "food", currentAmount: 1200, maxCapacity: 2000, unit: "kg", reorderPoint: 500, unitCost: 8.0 },
  { name: "Medical Supplies", category: "medical", currentAmount: 85, maxCapacity: 200, unit: "kits", reorderPoint: 30, unitCost: 150.0 },
  { name: "Generator Spare Parts", category: "spare-parts", currentAmount: 12, maxCapacity: 50, unit: "sets", reorderPoint: 5, unitCost: 2500.0 },
  { name: "Water Treatment Filters", category: "spare-parts", currentAmount: 3, maxCapacity: 20, unit: "units", reorderPoint: 5, unitCost: 800.0 },
  { name: "Science Equipment", category: "science", currentAmount: 45, maxCapacity: 100, unit: "units", reorderPoint: 20, unitCost: 500.0 },
  { name: "Batteries (AA/AAA)", category: "general", currentAmount: 500, maxCapacity: 1000, unit: "pcs", reorderPoint: 100, unitCost: 0.5 },
];

function generateEnvironmentalData(stationId: string, baseTemp: number) {
  const data = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const ts = new Date(now);
    ts.setHours(ts.getHours() - (23 - i));
    const hourOfDay = ts.getHours();
    const tempVariation = Math.sin((hourOfDay / 24) * Math.PI * 2) * 3;
    data.push({
      stationId,
      timestamp: ts,
      temperature: baseTemp + tempVariation + (Math.random() - 0.5) * 2,
      windSpeed: 30 + Math.random() * 30,
      windDir: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(Math.random() * 8)],
      humidity: 60 + Math.random() * 30,
      pressure: 980 + Math.random() * 40,
      visibility: 5 + Math.random() * 15,
      uvIndex: Math.max(0, Math.sin((hourOfDay / 24) * Math.PI) * 8),
    });
  }
  return data;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.environmentalData.deleteMany();
  await prisma.simulation.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.component.deleteMany();
  await prisma.subsystem.deleteMany();
  await prisma.station.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Seed users
  for (const u of USERS) {
    const hash = await bcrypt.hash(u.password, 12);
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: hash,
        role: u.role,
      },
    });
  }
  console.log(`  ✅ Created ${USERS.length} users`);

  // Seed stations + subsystems
  for (const s of STATIONS) {
    const { subsystems, ...stationData } = s;
    await prisma.station.create({
      data: {
        ...stationData,
        subsystems: {
          create: subsystems.map((sub) => ({
            id: `${s.id}_${sub.subsystemId}`,
            subsystemId: sub.subsystemId,
            name: sub.name,
            type: sub.type,
            status: sub.status,
            loadPercent: sub.loadPercent,
            details: sub.details,
          })),
        },
      },
    });
  }
  console.log(`  ✅ Created ${STATIONS.length} stations with subsystems`);

  // Seed components
  for (const c of COMPONENTS) {
    await prisma.component.create({ data: c });
  }
  console.log(`  ✅ Created ${COMPONENTS.length} components`);

  // Seed inventory for each station
  let invCount = 0;
  for (const station of STATIONS) {
    for (const item of INVENTORY) {
      await prisma.inventoryItem.create({
        data: {
          stationId: station.id,
          name: item.name,
          category: item.category,
          currentAmount: item.currentAmount * (station.id === "bharati" ? 1.5 : 1),
          maxCapacity: item.maxCapacity,
          unit: item.unit,
          reorderPoint: item.reorderPoint,
          unitCost: item.unitCost,
        },
      });
      invCount++;
    }
  }
  console.log(`  ✅ Created ${invCount} inventory items`);

  // Seed environmental data
  let envCount = 0;
  for (const s of STATIONS) {
    const envData = generateEnvironmentalData(s.id, s.temperature);
    for (const e of envData) {
      await prisma.environmentalData.create({ data: e });
      envCount++;
    }
  }
  console.log(`  ✅ Created ${envCount} environmental readings`);

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
