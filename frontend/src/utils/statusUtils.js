export const STATUS_CONFIG = {
  assigned: { label: 'Assigned', color: 'info' },
  in_progress: { label: 'In Progress', color: 'warning' },
  completed: { label: 'Completed', color: 'success' },
  overdue: { label: 'Overdue', color: 'error' },
  expired: { label: 'Expired', color: 'default' },
}

export const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || { label: status, color: 'default' }

export const ROLE_LABELS = {
  admin: 'Admin',
  manager: 'Manager',
  supervisor: 'Supervisor',
  employee: 'Employee',
}

export const PREDEFINED_TRAININGS = [
  // General Safety
  'Incident Reporting', 'Ergonomics', 'Slips, Trips & Falls', 'Horseplay',
  'Air Hoses', 'Hand & Portable Tools', 'Abrasive Grinder Use',
  'Welding / Cutting / Brazing', 'Ladders / Scaffolds', 'Vehicle Operations (NTV)',
  'Ground Guides', 'Safety Booklets', 'Operating Procedures',
  'Workplace Hazard Assessment / JESA',
  // PPE & Health
  'Personal Protective Equipment', 'Respiratory Protection', 'Hearing Conservation',
  'Sight Conservation', 'Heat Stress', 'Bloodborne Pathogens', 'Radiation Workers',
  // Fire Safety
  'Fire Extinguisher Use', 'Evacuation Route & Fire Plan', 'Flammable Storage',
  // Hazardous Materials
  'HAZCOM / HAZWASTE', 'Chemicals Handling / HAZCOM', 'SDS (Safety Data Sheets)',
  'HAZWOPER [40, 24, 8 Refresher]', 'Spill Prevention Control & Countermeasures',
  // Electrical
  'Electric Use', 'Authorized Electrical Workers', 'Control of Hazardous Energy LOTO',
  // Environmental
  'Environmental Conservation', 'Reduce, Reuse, Recycle',
  // Emergency
  'Emergency Action Plans',
  // Confined Space & Excavation
  'Confined Space Entry', 'Excavation & Trenching',
  // Working at Height
  'Working at Height', 'Working at Heights [Fall Protection]', 'Working at Heights [Scaffolding]',
  // Machinery & Materials
  'Machine Guards', 'Material Handling', 'Lifting Procedures',
  'Lifting Equipment & Lift Truck License', 'Lift Truck PMCS', 'Powered Industrial Truck Operators',
  'Warehouse and Material Handlers', 'Crane & Hoist Operators', 'Riggers & Signalmen',
  // Housekeeping
  'Disposal of Waste', 'Area Clean-Up Schedule', 'Storage of Material',
  // Compliance & HR
  'Driver Safety [RSDT]', 'Continuity Book / JESA', 'HR training',
  'fire training', 'hazmat',
]

export const CATEGORY_LABELS = {
  safety: 'Safety',
  health: 'Health & Wellness',
  fire_safety: 'Fire Safety',
  hazmat: 'Hazardous Materials',
  emergency: 'Emergency Preparedness',
  electrical: 'Electrical Safety',
  environmental: 'Environmental',
  machinery: 'Machinery & Equipment',
  materials_handling: 'Materials Handling',
  housekeeping: 'Housekeeping & Storage',
  compliance: 'Compliance',
  technical: 'Technical',
  soft_skills: 'Soft Skills',
  hr: 'HR & Workplace',
  leadership: 'Leadership',
  other: 'Other',
}
