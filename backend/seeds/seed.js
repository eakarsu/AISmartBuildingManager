import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

async function createDatabase() {
  const pool = new Pool({ ...DB_CONFIG, database: 'postgres' });
  try {
    const result = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'smart_building'"
    );
    if (result.rows.length === 0) {
      await pool.query('CREATE DATABASE smart_building');
      console.log('Database smart_building created.');
    } else {
      console.log('Database smart_building already exists.');
    }
  } finally {
    await pool.end();
  }
}

async function seed() {
  console.log('Starting seed process...\n');

  // Step 1: Create database if needed
  await createDatabase();

  // Step 2: Connect to smart_building
  const pool = new Pool({ ...DB_CONFIG, database: 'smart_building' });

  try {
    // Step 3: Drop existing tables
    console.log('Dropping existing tables...');
    await pool.query(`
      DROP TABLE IF EXISTS building_settings CASCADE;
      DROP TABLE IF EXISTS activity_log CASCADE;
      DROP TABLE IF EXISTS alerts CASCADE;
      DROP TABLE IF EXISTS elevator_systems CASCADE;
      DROP TABLE IF EXISTS fire_safety_systems CASCADE;
      DROP TABLE IF EXISTS waste_records CASCADE;
      DROP TABLE IF EXISTS visitor_logs CASCADE;
      DROP TABLE IF EXISTS parking_zones CASCADE;
      DROP TABLE IF EXISTS water_systems CASCADE;
      DROP TABLE IF EXISTS space_utilization CASCADE;
      DROP TABLE IF EXISTS security_events CASCADE;
      DROP TABLE IF EXISTS comfort_scores CASCADE;
      DROP TABLE IF EXISTS energy_records CASCADE;
      DROP TABLE IF EXISTS maintenance_items CASCADE;
      DROP TABLE IF EXISTS climate_zones CASCADE;
      DROP TABLE IF EXISTS lighting_zones CASCADE;
      DROP TABLE IF EXISTS hvac_units CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('Tables dropped.\n');

    // Step 4: Create tables
    console.log('Creating tables...');

    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - users table created');

    await pool.query(`
      CREATE TABLE hvac_units (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        zone VARCHAR(255),
        floor INTEGER,
        status VARCHAR(50),
        current_temp DECIMAL,
        target_temp DECIMAL,
        efficiency DECIMAL,
        mode VARCHAR(50),
        energy_kwh DECIMAL,
        last_maintained TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - hvac_units table created');

    await pool.query(`
      CREATE TABLE lighting_zones (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        floor INTEGER,
        zone VARCHAR(255),
        occupancy_count INTEGER,
        brightness_level INTEGER,
        mode VARCHAR(50),
        schedule VARCHAR(255),
        energy_usage DECIMAL,
        status VARCHAR(50),
        last_motion TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - lighting_zones table created');

    await pool.query(`
      CREATE TABLE climate_zones (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        floor INTEGER,
        zone VARCHAR(255),
        temperature DECIMAL,
        humidity DECIMAL,
        co2_level INTEGER,
        air_quality_index INTEGER,
        ventilation_mode VARCHAR(50),
        status VARCHAR(50),
        last_reading TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - climate_zones table created');

    await pool.query(`
      CREATE TABLE maintenance_items (
        id SERIAL PRIMARY KEY,
        equipment_name VARCHAR(255),
        equipment_type VARCHAR(50),
        location VARCHAR(255),
        status VARCHAR(50),
        priority VARCHAR(50),
        health_score INTEGER,
        predicted_failure_date DATE,
        last_service DATE,
        next_service DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - maintenance_items table created');

    await pool.query(`
      CREATE TABLE energy_records (
        id SERIAL PRIMARY KEY,
        source VARCHAR(100),
        zone VARCHAR(255),
        consumption_kwh DECIMAL,
        cost DECIMAL,
        date DATE,
        peak_hours BOOLEAN,
        efficiency_rating VARCHAR(50),
        carbon_footprint DECIMAL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - energy_records table created');

    await pool.query(`
      CREATE TABLE comfort_scores (
        id SERIAL PRIMARY KEY,
        tenant_name VARCHAR(255),
        unit VARCHAR(100),
        floor INTEGER,
        overall_score DECIMAL,
        temperature_score DECIMAL,
        air_quality_score DECIMAL,
        lighting_score DECIMAL,
        noise_score DECIMAL,
        feedback TEXT,
        survey_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - comfort_scores table created');

    await pool.query(`
      CREATE TABLE security_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50),
        location VARCHAR(255),
        floor INTEGER,
        severity VARCHAR(50),
        status VARCHAR(50),
        camera_id VARCHAR(100),
        description TEXT,
        reported_at TIMESTAMP,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - security_events table created');

    await pool.query(`
      CREATE TABLE space_utilization (
        id SERIAL PRIMARY KEY,
        space_name VARCHAR(255),
        floor INTEGER,
        zone VARCHAR(255),
        space_type VARCHAR(50),
        capacity INTEGER,
        current_occupancy INTEGER,
        utilization_rate DECIMAL,
        peak_hour VARCHAR(50),
        avg_daily_usage DECIMAL,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - space_utilization table created');

    await pool.query(`
      CREATE TABLE water_systems (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        zone VARCHAR(255),
        floor INTEGER,
        system_type VARCHAR(50),
        flow_rate DECIMAL,
        daily_usage DECIMAL,
        pressure DECIMAL,
        quality_index INTEGER,
        leak_detected BOOLEAN DEFAULT false,
        status VARCHAR(50),
        last_inspection DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - water_systems table created');

    await pool.query(`
      CREATE TABLE parking_zones (
        id SERIAL PRIMARY KEY,
        zone_name VARCHAR(255),
        level VARCHAR(100),
        zone_type VARCHAR(50),
        total_spots INTEGER,
        occupied_spots INTEGER,
        available_spots INTEGER,
        hourly_rate DECIMAL,
        revenue_today DECIMAL,
        sensor_status VARCHAR(50),
        peak_occupancy_time VARCHAR(50),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - parking_zones table created');

    await pool.query(`
      CREATE TABLE visitor_logs (
        id SERIAL PRIMARY KEY,
        visitor_name VARCHAR(255),
        company VARCHAR(255),
        host_name VARCHAR(255),
        host_floor INTEGER,
        purpose VARCHAR(50),
        badge_number VARCHAR(100),
        check_in TIMESTAMP,
        check_out TIMESTAMP,
        status VARCHAR(50),
        id_verified BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - visitor_logs table created');

    await pool.query(`
      CREATE TABLE waste_records (
        id SERIAL PRIMARY KEY,
        container_name VARCHAR(255),
        location VARCHAR(255),
        floor INTEGER,
        waste_type VARCHAR(50),
        capacity_liters INTEGER,
        fill_level INTEGER,
        last_collected TIMESTAMP,
        next_collection TIMESTAMP,
        daily_avg_kg DECIMAL,
        contamination_rate DECIMAL,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - waste_records table created');

    await pool.query(`
      CREATE TABLE fire_safety_systems (
        id SERIAL PRIMARY KEY,
        system_name VARCHAR(255),
        system_type VARCHAR(50),
        location VARCHAR(255),
        floor INTEGER,
        status VARCHAR(50),
        last_tested DATE,
        next_test DATE,
        battery_level INTEGER,
        compliance_status VARCHAR(50),
        zone_coverage VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - fire_safety_systems table created');

    await pool.query(`
      CREATE TABLE elevator_systems (
        id SERIAL PRIMARY KEY,
        elevator_name VARCHAR(255),
        elevator_type VARCHAR(50),
        serving_floors VARCHAR(255),
        current_floor INTEGER,
        status VARCHAR(50),
        daily_trips INTEGER,
        avg_wait_time DECIMAL,
        capacity_kg INTEGER,
        last_maintenance DATE,
        next_maintenance DATE,
        health_score INTEGER,
        energy_consumption DECIMAL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - elevator_systems table created');

    console.log('All tables created.\n');

    // Step 5: Seed data
    console.log('Inserting seed data...');

    // Users
    const adminPass = await bcrypt.hash('password123', 10);
    const managerPass = await bcrypt.hash('password123', 10);
    await pool.query(
      `INSERT INTO users (email, password, name, role) VALUES
        ($1, $2, 'Admin User', 'admin'),
        ($3, $4, 'Building Manager', 'manager')`,
      ['admin@smartbuilding.com', adminPass, 'manager@smartbuilding.com', managerPass]
    );
    console.log('  - 2 users inserted');

    // HVAC Units (15)
    await pool.query(`
      INSERT INTO hvac_units (name, zone, floor, status, current_temp, target_temp, efficiency, mode, energy_kwh, last_maintained) VALUES
        ('Main Lobby HVAC', 'Lobby', 1, 'running', 23.5, 22.0, 92.5, 'cooling', 45.2, '2026-03-01 10:00:00'),
        ('Floor 2 East Wing AC', 'East Wing', 2, 'running', 24.1, 22.0, 88.0, 'cooling', 38.7, '2026-02-15 14:00:00'),
        ('Server Room Cooling', 'Data Center', 3, 'running', 18.2, 18.0, 95.0, 'cooling', 120.5, '2026-03-10 08:00:00'),
        ('Parking Level Ventilation', 'Parking', -1, 'idle', 20.0, 20.0, 75.0, 'fan', 15.3, '2026-01-20 09:00:00'),
        ('Executive Suite Climate', 'Executive', 25, 'running', 22.0, 22.0, 97.5, 'auto', 28.4, '2026-03-05 11:00:00'),
        ('Cafeteria HVAC', 'Common Area', 1, 'running', 23.8, 22.5, 85.0, 'cooling', 52.1, '2026-02-28 16:00:00'),
        ('Conference Center AC', 'Conference', 10, 'idle', 21.5, 22.0, 90.0, 'auto', 22.6, '2026-03-12 10:00:00'),
        ('Floor 5 North Wing', 'North Wing', 5, 'running', 24.5, 23.0, 82.0, 'cooling', 41.3, '2026-02-01 13:00:00'),
        ('Gym Ventilation', 'Amenities', 2, 'running', 20.5, 20.0, 78.0, 'fan', 35.8, '2026-03-08 07:00:00'),
        ('Floor 3 West Wing', 'West Wing', 3, 'maintenance', 25.2, 22.0, 62.0, 'heating', 55.9, '2025-12-15 10:00:00'),
        ('Rooftop Unit A', 'Rooftop', 25, 'running', 19.8, 20.0, 91.0, 'heating', 48.2, '2026-03-14 09:00:00'),
        ('Basement Circulation', 'Basement', -2, 'running', 21.0, 21.0, 70.0, 'fan', 18.6, '2026-01-10 08:00:00'),
        ('Floor 4 South Wing', 'South Wing', 4, 'running', 23.0, 22.5, 89.5, 'cooling', 37.4, '2026-03-02 15:00:00'),
        ('Emergency HVAC Backup', 'Utility', 1, 'off', 22.0, 22.0, 98.0, 'auto', 0.0, '2026-03-15 12:00:00'),
        ('Loading Dock Ventilation', 'Loading Dock', 1, 'running', 26.3, 24.0, 68.0, 'fan', 25.1, '2026-02-20 11:00:00')
    `);
    console.log('  - 15 HVAC units inserted');

    // Lighting Zones (15)
    await pool.query(`
      INSERT INTO lighting_zones (name, floor, zone, occupancy_count, brightness_level, mode, schedule, energy_usage, status, last_motion) VALUES
        ('Main Lobby', 1, 'Lobby', 45, 85, 'auto', '06:00-22:00', 12.5, 'on', '2026-03-19 08:30:00'),
        ('Floor 2 Open Office', 2, 'East Wing', 120, 75, 'auto', '07:00-19:00', 28.3, 'on', '2026-03-19 09:00:00'),
        ('Parking Level B1', -1, 'Parking', 8, 40, 'auto', '00:00-23:59', 8.2, 'dimmed', '2026-03-19 07:45:00'),
        ('Executive Floor Corridor', 25, 'Executive', 12, 70, 'scheduled', '07:00-20:00', 5.1, 'on', '2026-03-19 08:15:00'),
        ('Cafeteria', 1, 'Common Area', 85, 90, 'auto', '06:00-21:00', 15.7, 'on', '2026-03-19 08:45:00'),
        ('Conference Room A', 10, 'Conference', 0, 0, 'auto', '08:00-18:00', 0.5, 'off', '2026-03-18 17:30:00'),
        ('Server Room', 3, 'Data Center', 2, 100, 'manual', '00:00-23:59', 4.8, 'on', '2026-03-19 06:00:00'),
        ('Floor 3 West Wing', 3, 'West Wing', 65, 80, 'auto', '07:00-19:00', 18.9, 'on', '2026-03-19 09:10:00'),
        ('Emergency Stairwell', 1, 'Safety', 0, 30, 'manual', '00:00-23:59', 3.2, 'dimmed', '2026-03-19 03:00:00'),
        ('Rooftop Garden', 25, 'Rooftop', 5, 60, 'scheduled', '08:00-20:00', 6.4, 'on', '2026-03-19 07:00:00'),
        ('Reception Area', 1, 'Lobby', 15, 80, 'auto', '06:00-22:00', 7.8, 'on', '2026-03-19 08:00:00'),
        ('Floor 4 Break Room', 4, 'South Wing', 18, 70, 'eco', '07:00-19:00', 4.3, 'on', '2026-03-19 08:55:00'),
        ('Security Office', 1, 'Security', 4, 65, 'manual', '00:00-23:59', 3.9, 'on', '2026-03-19 09:05:00'),
        ('Gym Area', 2, 'Amenities', 22, 85, 'scheduled', '05:00-23:00', 11.2, 'on', '2026-03-19 06:30:00'),
        ('Loading Dock', 1, 'Loading Dock', 3, 50, 'auto', '06:00-20:00', 5.6, 'dimmed', '2026-03-19 07:20:00')
    `);
    console.log('  - 15 lighting zones inserted');

    // Climate Zones (15)
    await pool.query(`
      INSERT INTO climate_zones (name, floor, zone, temperature, humidity, co2_level, air_quality_index, ventilation_mode, status, last_reading) VALUES
        ('Main Lobby Climate', 1, 'Lobby', 22.5, 45.0, 420, 28, 'auto', 'optimal', '2026-03-19 09:00:00'),
        ('Floor 2 East Office', 2, 'East Wing', 23.8, 52.0, 680, 42, 'auto', 'optimal', '2026-03-19 09:00:00'),
        ('Server Room Climate', 3, 'Data Center', 19.0, 35.0, 450, 22, 'high', 'optimal', '2026-03-19 09:00:00'),
        ('Parking Garage', -1, 'Parking', 20.5, 60.0, 850, 72, 'high', 'warning', '2026-03-19 09:00:00'),
        ('Executive Floor', 25, 'Executive', 22.0, 42.0, 400, 20, 'auto', 'optimal', '2026-03-19 09:00:00'),
        ('Cafeteria Zone', 1, 'Common Area', 23.5, 55.0, 780, 55, 'high', 'warning', '2026-03-19 09:00:00'),
        ('Conference Level', 10, 'Conference', 22.2, 48.0, 520, 35, 'auto', 'optimal', '2026-03-19 09:00:00'),
        ('Floor 5 North', 5, 'North Wing', 24.0, 50.0, 620, 40, 'auto', 'optimal', '2026-03-19 09:00:00'),
        ('Gym Climate', 2, 'Amenities', 21.0, 65.0, 900, 58, 'high', 'warning', '2026-03-19 09:00:00'),
        ('Floor 3 West', 3, 'West Wing', 25.5, 58.0, 1100, 85, 'recirculate', 'critical', '2026-03-19 09:00:00'),
        ('Rooftop Area', 25, 'Rooftop', 19.5, 38.0, 410, 25, 'auto', 'optimal', '2026-03-19 09:00:00'),
        ('Basement Storage', -2, 'Basement', 20.0, 68.0, 550, 48, 'low', 'warning', '2026-03-19 09:00:00'),
        ('Floor 4 South', 4, 'South Wing', 23.0, 46.0, 580, 38, 'auto', 'optimal', '2026-03-19 09:00:00'),
        ('Loading Dock Climate', 1, 'Loading Dock', 26.0, 62.0, 950, 78, 'high', 'warning', '2026-03-19 09:00:00'),
        ('Floor 15 Central', 15, 'Central', 22.8, 44.0, 490, 30, 'auto', 'optimal', '2026-03-19 09:00:00')
    `);
    console.log('  - 15 climate zones inserted');

    // Maintenance Items (15)
    await pool.query(`
      INSERT INTO maintenance_items (equipment_name, equipment_type, location, status, priority, health_score, predicted_failure_date, last_service, next_service, notes) VALUES
        ('Elevator Bank A', 'elevator', 'Main Lobby', 'operational', 'low', 95, '2027-06-15', '2026-02-01', '2026-05-01', 'Annual inspection completed. All systems nominal.'),
        ('Elevator Bank B', 'elevator', 'East Wing', 'needs_attention', 'medium', 72, '2026-08-20', '2026-01-15', '2026-04-15', 'Minor vibration detected in cable system.'),
        ('Main Chiller Unit', 'hvac', 'Rooftop', 'operational', 'low', 88, '2027-01-10', '2026-03-01', '2026-06-01', 'Refrigerant levels optimal.'),
        ('Floor 3 AHU', 'hvac', 'Floor 3 Mechanical', 'critical', 'urgent', 35, '2026-04-01', '2025-11-20', '2026-03-20', 'Bearing failure imminent. Replacement parts ordered.'),
        ('Main Electrical Panel', 'electrical', 'Basement Level 2', 'operational', 'low', 92, '2028-01-01', '2026-01-10', '2026-07-10', 'Thermal imaging shows normal operation.'),
        ('Floor 10 Transformer', 'electrical', 'Floor 10 Utility', 'needs_attention', 'high', 58, '2026-06-30', '2025-12-05', '2026-03-25', 'Oil analysis shows elevated contaminant levels.'),
        ('Main Water Supply Pump', 'plumbing', 'Basement Level 1', 'operational', 'medium', 81, '2026-12-15', '2026-02-20', '2026-05-20', 'Seal replacement scheduled for next service.'),
        ('Floor 15 Restroom Plumbing', 'plumbing', 'Floor 15 Core', 'needs_attention', 'medium', 65, '2026-07-01', '2026-01-05', '2026-04-05', 'Slow drain reported. Possible pipe scaling.'),
        ('Fire Suppression System A', 'fire_safety', 'Building Wide', 'operational', 'low', 98, '2028-03-01', '2026-03-10', '2026-09-10', 'Semi-annual inspection passed. All heads functional.'),
        ('Stairwell Pressurization Fan', 'fire_safety', 'Core Stairwell', 'scheduled', 'medium', 77, '2026-10-15', '2025-10-15', '2026-04-15', 'Scheduled for belt replacement.'),
        ('Elevator Bank C', 'elevator', 'West Wing', 'operational', 'low', 90, '2027-03-20', '2026-02-15', '2026-05-15', 'Door sensor calibration completed.'),
        ('Cooling Tower', 'hvac', 'Rooftop', 'needs_attention', 'high', 55, '2026-05-15', '2025-09-30', '2026-03-30', 'Scale buildup detected. Chemical treatment needed.'),
        ('Emergency Generator', 'electrical', 'Basement Level 2', 'operational', 'medium', 85, '2027-02-01', '2026-02-28', '2026-05-28', 'Load test passed. Fuel levels adequate.'),
        ('Sprinkler System Floor 20', 'fire_safety', 'Floor 20', 'operational', 'low', 94, '2027-09-01', '2026-03-05', '2026-09-05', 'Flow test completed successfully.'),
        ('Sump Pump B', 'plumbing', 'Basement Level 2', 'critical', 'urgent', 28, '2026-03-25', '2025-08-10', '2026-03-19', 'Motor showing signs of failure. Backup unit on standby.')
    `);
    console.log('  - 15 maintenance items inserted');

    // Energy Records (15)
    await pool.query(`
      INSERT INTO energy_records (source, zone, consumption_kwh, cost, date, peak_hours, efficiency_rating, carbon_footprint) VALUES
        ('hvac', 'Lobby', 1250.5, 187.58, '2026-03-18', true, 'good', 0.625),
        ('hvac', 'East Wing', 2100.0, 315.00, '2026-03-18', true, 'average', 1.050),
        ('lighting', 'All Floors', 890.3, 133.55, '2026-03-18', false, 'excellent', 0.445),
        ('elevator', 'Main Core', 450.0, 67.50, '2026-03-18', true, 'good', 0.225),
        ('common_areas', 'Cafeteria', 380.2, 57.03, '2026-03-18', true, 'average', 0.190),
        ('data_center', 'Server Room', 3200.0, 480.00, '2026-03-18', false, 'good', 1.600),
        ('hvac', 'West Wing', 1890.0, 283.50, '2026-03-17', true, 'poor', 0.945),
        ('lighting', 'Parking', 320.5, 48.08, '2026-03-17', false, 'excellent', 0.160),
        ('elevator', 'Service Elevator', 280.0, 42.00, '2026-03-17', false, 'good', 0.140),
        ('common_areas', 'Gym', 520.8, 78.12, '2026-03-17', true, 'average', 0.260),
        ('hvac', 'Executive Floor', 680.0, 102.00, '2026-03-16', false, 'excellent', 0.340),
        ('data_center', 'Network Room', 1500.0, 225.00, '2026-03-16', false, 'good', 0.750),
        ('lighting', 'Conference Rooms', 180.5, 27.08, '2026-03-16', false, 'excellent', 0.090),
        ('common_areas', 'Loading Dock', 290.0, 43.50, '2026-03-16', true, 'poor', 0.145),
        ('hvac', 'North Wing', 1650.3, 247.55, '2026-03-15', true, 'average', 0.825)
    `);
    console.log('  - 15 energy records inserted');

    // Comfort Scores (15)
    await pool.query(`
      INSERT INTO comfort_scores (tenant_name, unit, floor, overall_score, temperature_score, air_quality_score, lighting_score, noise_score, feedback, survey_date) VALUES
        ('Acme Corp', 'Suite 2A', 2, 8.5, 9.0, 8.0, 8.5, 8.5, 'Very comfortable working environment. Slight draft near windows.', '2026-03-15'),
        ('TechStart Inc', 'Suite 5B', 5, 6.2, 5.5, 6.0, 7.0, 6.5, 'Temperature fluctuates too much during the day. Otherwise decent.', '2026-03-15'),
        ('Global Finance', 'Suite 25A', 25, 9.2, 9.5, 9.0, 9.0, 9.5, 'Excellent conditions on the executive floor. Very quiet.', '2026-03-14'),
        ('Creative Studio', 'Suite 10C', 10, 7.0, 7.5, 6.5, 8.0, 5.5, 'Good lighting but noise from conference rooms is distracting.', '2026-03-14'),
        ('Law Partners LLP', 'Suite 20A', 20, 8.0, 8.5, 7.5, 8.0, 8.0, 'Comfortable overall. Air feels a bit dry in winter months.', '2026-03-13'),
        ('MedTech Solutions', 'Suite 15B', 15, 7.5, 7.0, 8.0, 7.5, 7.5, 'Good air quality. Temperature could be slightly warmer.', '2026-03-13'),
        ('Digital Marketing Co', 'Suite 3A', 3, 4.8, 3.5, 5.0, 6.0, 4.5, 'Too cold in summer. HVAC seems to be malfunctioning on our floor.', '2026-03-12'),
        ('Research Labs', 'Suite 8A', 8, 7.8, 8.0, 8.5, 7.0, 7.5, 'Air quality is great. Lighting could use more natural light options.', '2026-03-12'),
        ('Consulting Group', 'Suite 12B', 12, 8.2, 8.0, 8.0, 8.5, 8.5, 'Very satisfied with the environment. Minor issue with elevator wait times.', '2026-03-11'),
        ('StartupHub', 'Suite 4C', 4, 6.5, 6.0, 7.0, 6.5, 6.5, 'Open plan creates noise issues. Temperature is acceptable.', '2026-03-11'),
        ('Insurance Partners', 'Suite 18A', 18, 7.2, 7.5, 7.0, 7.0, 7.5, 'Generally comfortable. Some complaints about afternoon sun glare.', '2026-03-10'),
        ('Retail HQ', 'Suite 6B', 6, 5.5, 5.0, 6.0, 5.5, 5.5, 'Multiple issues: too warm, poor air circulation, buzzing from lights.', '2026-03-10'),
        ('Arch Design Studio', 'Suite 22A', 22, 8.8, 8.5, 9.0, 9.0, 8.5, 'Great natural light and air quality on this floor.', '2026-03-09'),
        ('Healthcare Admin', 'Suite 14B', 14, 7.0, 7.0, 7.5, 6.5, 7.0, 'Adequate conditions. Carpet in hallway needs replacement - odor issue.', '2026-03-09'),
        ('Education Foundation', 'Suite 9A', 9, 6.8, 7.0, 6.5, 7.0, 6.5, 'Satisfactory overall. Would appreciate better humidity control.', '2026-03-08')
    `);
    console.log('  - 15 comfort scores inserted');

    // Security Events (15)
    await pool.query(`
      INSERT INTO security_events (event_type, location, floor, severity, status, camera_id, description, reported_at, resolved_at) VALUES
        ('access', 'Main Entrance', 1, 'low', 'resolved', 'CAM-001', 'After-hours access by authorized maintenance personnel.', '2026-03-18 23:15:00', '2026-03-18 23:20:00'),
        ('visitor', 'Reception', 1, 'low', 'resolved', 'CAM-002', 'Visitor badge not returned at end of day. Badge deactivated remotely.', '2026-03-18 18:30:00', '2026-03-18 19:00:00'),
        ('intrusion', 'Parking Level B2', -2, 'high', 'investigating', 'CAM-015', 'Unauthorized vehicle detected in restricted area after hours.', '2026-03-19 02:45:00', NULL),
        ('fire', 'Floor 7 Kitchen', 7, 'critical', 'resolved', 'CAM-028', 'Smoke detector triggered in break room. Burnt food confirmed - no fire.', '2026-03-17 12:30:00', '2026-03-17 12:45:00'),
        ('water_leak', 'Floor 12 Restroom', 12, 'medium', 'resolved', 'CAM-045', 'Water sensor detected leak in mens restroom. Plumber dispatched.', '2026-03-16 14:20:00', '2026-03-16 16:00:00'),
        ('power', 'Floor 8 East', 8, 'high', 'resolved', 'CAM-032', 'Partial power outage on floor 8 east wing. UPS engaged. Breaker reset.', '2026-03-15 09:10:00', '2026-03-15 09:45:00'),
        ('access', 'Server Room', 3, 'medium', 'resolved', 'CAM-010', 'Failed access attempt with expired credentials. Employee badge updated.', '2026-03-18 10:30:00', '2026-03-18 11:00:00'),
        ('intrusion', 'Loading Dock', 1, 'medium', 'false_alarm', 'CAM-020', 'Motion sensor triggered. Confirmed as stray animal. Perimeter checked.', '2026-03-14 04:00:00', '2026-03-14 04:30:00'),
        ('visitor', 'Floor 25 Executive', 25, 'low', 'resolved', 'CAM-050', 'VIP visitor escort protocol completed successfully.', '2026-03-18 14:00:00', '2026-03-18 17:00:00'),
        ('fire', 'Basement Electrical', -1, 'high', 'resolved', 'CAM-005', 'Heat sensor alert in electrical panel area. Thermal imaging showed hotspot. Panel replaced.', '2026-03-13 08:00:00', '2026-03-13 14:00:00'),
        ('access', 'Gym After Hours', 2, 'low', 'resolved', 'CAM-008', 'Tenant accessed gym outside operating hours. Reminder notice sent.', '2026-03-17 23:30:00', '2026-03-18 08:00:00'),
        ('water_leak', 'Rooftop HVAC', 25, 'medium', 'active', 'CAM-051', 'Condensation leak detected near cooling tower. Maintenance team notified.', '2026-03-19 06:00:00', NULL),
        ('power', 'Emergency Generator', -2, 'high', 'resolved', 'CAM-003', 'Monthly generator test. Transfer switch operated normally.', '2026-03-12 06:00:00', '2026-03-12 06:30:00'),
        ('intrusion', 'Floor 4 Window', 4, 'critical', 'resolved', 'CAM-016', 'Window sensor triggered on floor 4. Strong wind caused sensor trip. Window intact.', '2026-03-11 03:15:00', '2026-03-11 03:45:00'),
        ('access', 'Parking Gate B', -1, 'low', 'resolved', 'CAM-014', 'Tailgating detected at parking gate. Second vehicle verified as authorized.', '2026-03-19 08:15:00', '2026-03-19 08:20:00')
    `);
    console.log('  - 15 security events inserted');

    // Space Utilization (15)
    await pool.query(`
      INSERT INTO space_utilization (space_name, floor, zone, space_type, capacity, current_occupancy, utilization_rate, peak_hour, avg_daily_usage, status) VALUES
        ('Main Lobby', 1, 'Lobby', 'lobby', 200, 45, 22.5, '09:00', 8.5, 'available'),
        ('Floor 2 Open Office', 2, 'East Wing', 'office', 150, 120, 80.0, '10:00', 9.0, 'occupied'),
        ('Board Room', 25, 'Executive', 'meeting_room', 30, 0, 0.0, '14:00', 4.5, 'available'),
        ('Conference Room A', 10, 'Conference', 'meeting_room', 20, 12, 60.0, '11:00', 6.0, 'occupied'),
        ('Conference Room B', 10, 'Conference', 'meeting_room', 15, 0, 0.0, '10:00', 5.5, 'reserved'),
        ('Floor 1 Cafeteria', 1, 'Common Area', 'common_area', 250, 85, 34.0, '12:00', 5.0, 'occupied'),
        ('Parking Level B1', -1, 'Parking', 'parking', 300, 245, 81.7, '09:30', 10.0, 'occupied'),
        ('Parking Level B2', -2, 'Parking', 'parking', 200, 120, 60.0, '09:00', 9.5, 'occupied'),
        ('Fitness Center', 2, 'Amenities', 'gym', 50, 22, 44.0, '17:30', 4.0, 'occupied'),
        ('Floor 5 North Office', 5, 'North Wing', 'office', 100, 65, 65.0, '10:30', 8.5, 'occupied'),
        ('Floor 3 West Office', 3, 'West Wing', 'office', 120, 95, 79.2, '10:00', 9.0, 'occupied'),
        ('Floor 15 Common Area', 15, 'Central', 'common_area', 80, 18, 22.5, '12:30', 6.0, 'available'),
        ('Server Room', 3, 'Data Center', 'office', 10, 2, 20.0, '10:00', 4.0, 'occupied'),
        ('Floor 20 Meeting Pod', 20, 'South Wing', 'meeting_room', 6, 4, 66.7, '15:00', 5.5, 'occupied'),
        ('Main Reception', 1, 'Lobby', 'lobby', 50, 15, 30.0, '09:00', 10.0, 'occupied')
    `);
    console.log('  - 15 space utilization records inserted');

    // Water Systems (15)
    await pool.query(`
      INSERT INTO water_systems (name, zone, floor, system_type, flow_rate, daily_usage, pressure, quality_index, leak_detected, status, last_inspection) VALUES
        ('Main Supply Line', 'Building Core', 1, 'supply', 150.0, 12500.0, 65.0, 95, false, 'normal', '2026-03-01'),
        ('Floor 5 Bathroom Supply', 'North Wing', 5, 'supply', 25.0, 1800.0, 58.0, 92, false, 'normal', '2026-02-20'),
        ('Irrigation System North', 'Exterior North', 1, 'irrigation', 45.0, 3200.0, 40.0, 88, false, 'normal', '2026-03-10'),
        ('Fire Suppression Level B2', 'Basement', -2, 'fire_suppression', 0.0, 0.0, 85.0, 98, false, 'normal', '2026-03-15'),
        ('Greywater Recycling Unit', 'Utility Room', 1, 'recycling', 30.0, 4500.0, 35.0, 78, false, 'normal', '2026-02-28'),
        ('Cooling Tower Water', 'Rooftop', 25, 'supply', 200.0, 18000.0, 50.0, 85, false, 'warning', '2026-01-15'),
        ('Kitchen Supply Line', 'Cafeteria', 1, 'supply', 35.0, 2800.0, 60.0, 94, false, 'normal', '2026-03-05'),
        ('Floor 10 Hot Water', 'East Wing', 10, 'supply', 20.0, 1500.0, 55.0, 91, false, 'normal', '2026-02-25'),
        ('Rainwater Collection', 'Rooftop', 25, 'recycling', 15.0, 2000.0, 20.0, 82, false, 'normal', '2026-03-12'),
        ('Pool Filtration System', 'Amenities', 2, 'recycling', 80.0, 9500.0, 45.0, 90, false, 'normal', '2026-03-08'),
        ('Floor 15 Supply', 'Central', 15, 'supply', 22.0, 1600.0, 52.0, 93, false, 'normal', '2026-02-18'),
        ('Emergency Water Reserve', 'Basement', -1, 'fire_suppression', 0.0, 0.0, 80.0, 99, false, 'normal', '2026-03-14'),
        ('Fountain Circulation', 'Lobby', 1, 'recycling', 10.0, 500.0, 15.0, 87, false, 'normal', '2026-03-01'),
        ('Floor 20 Bathroom', 'South Wing', 20, 'supply', 28.0, 2100.0, 48.0, 89, true, 'warning', '2026-02-10'),
        ('Boiler Feed Water', 'Mechanical Room', -1, 'supply', 60.0, 5500.0, 70.0, 96, false, 'normal', '2026-03-11')
    `);
    console.log('  - 15 water systems inserted');

    // Parking Zones (15)
    await pool.query(`
      INSERT INTO parking_zones (zone_name, level, zone_type, total_spots, occupied_spots, available_spots, hourly_rate, revenue_today, sensor_status, peak_occupancy_time, status) VALUES
        ('Level B1 Zone A', 'B1', 'standard', 80, 72, 8, 5.00, 1850.00, 'online', '09:30', 'open'),
        ('Level B1 Zone B', 'B1', 'standard', 75, 70, 5, 5.00, 1720.00, 'online', '09:15', 'open'),
        ('Level B2 Zone A', 'B2', 'standard', 90, 55, 35, 4.00, 980.00, 'online', '10:00', 'open'),
        ('Level B2 Zone B', 'B2', 'standard', 85, 48, 37, 4.00, 865.00, 'online', '09:45', 'open'),
        ('Level B3 Zone A', 'B3', 'standard', 100, 30, 70, 3.00, 420.00, 'online', '10:30', 'open'),
        ('Surface Lot East', 'Surface', 'standard', 50, 45, 5, 8.00, 2100.00, 'online', '08:45', 'open'),
        ('Surface Lot West', 'Surface', 'standard', 45, 40, 5, 8.00, 1900.00, 'online', '08:30', 'open'),
        ('EV Charging Section', 'B1', 'ev_charging', 20, 18, 2, 6.00, 580.00, 'online', '09:00', 'open'),
        ('Visitor Parking', 'Surface', 'visitor', 30, 22, 8, 10.00, 1250.00, 'online', '11:00', 'open'),
        ('Executive Reserved', 'B1', 'reserved', 15, 12, 3, 0.00, 0.00, 'online', '08:00', 'open'),
        ('Motorcycle Zone', 'B2', 'motorcycle', 25, 10, 15, 2.00, 95.00, 'online', '09:00', 'open'),
        ('Level B1 Handicap', 'B1', 'handicap', 12, 5, 7, 0.00, 0.00, 'online', '10:00', 'open'),
        ('Level B3 Zone B', 'B3', 'standard', 95, 25, 70, 3.00, 350.00, 'maintenance', '10:15', 'open'),
        ('Loading Dock', 'Surface', 'reserved', 8, 3, 5, 0.00, 0.00, 'online', '07:00', 'open'),
        ('Valet Area', 'Surface', 'reserved', 20, 15, 5, 15.00, 1350.00, 'online', '09:00', 'open')
    `);
    console.log('  - 15 parking zones inserted');

    // Visitor Logs (15)
    await pool.query(`
      INSERT INTO visitor_logs (visitor_name, company, host_name, host_floor, purpose, badge_number, check_in, check_out, status, id_verified, notes) VALUES
        ('Sarah Johnson', 'Acme Consulting', 'John Smith', 10, 'meeting', 'V-1001', '2026-03-19 09:00:00', '2026-03-19 11:30:00', 'checked_out', true, 'Quarterly review meeting'),
        ('Michael Chen', 'TechPro Solutions', 'Emily Davis', 15, 'meeting', 'V-1002', '2026-03-19 08:45:00', NULL, 'checked_in', true, 'Software demo presentation'),
        ('Lisa Rodriguez', 'FedEx', 'Reception', 1, 'delivery', 'V-1003', '2026-03-19 07:30:00', '2026-03-19 07:45:00', 'checked_out', true, 'Package delivery to mailroom'),
        ('David Kim', 'HVAC Specialists Inc', 'Tom Brown', 3, 'maintenance', 'V-1004', '2026-03-19 08:00:00', NULL, 'checked_in', true, 'Scheduled HVAC repair Floor 3'),
        ('Jennifer Park', 'N/A', 'HR Department', 20, 'interview', 'V-1005', '2026-03-19 10:00:00', NULL, 'checked_in', true, 'Job interview - Senior Developer position'),
        ('Robert Wilson', 'City Building Inspectors', 'Facilities Manager', 1, 'tour', 'V-1006', '2026-03-19 09:30:00', NULL, 'checked_in', true, 'Annual building safety inspection'),
        ('Amanda Foster', 'ElectriCo', 'Maintenance Dept', 8, 'contractor', 'V-1007', '2026-03-18 08:00:00', '2026-03-18 17:00:00', 'checked_out', true, 'Electrical panel upgrade Floor 8'),
        ('James Taylor', 'Apex Marketing', 'Sarah Lee', 5, 'meeting', 'V-1008', '2026-03-18 14:00:00', '2026-03-18 16:00:00', 'checked_out', true, 'Marketing strategy session'),
        ('Maria Garcia', 'UPS', 'Mailroom', 1, 'delivery', 'V-1009', '2026-03-18 10:15:00', '2026-03-18 10:25:00', 'checked_out', false, 'Multiple package delivery'),
        ('Thomas Wright', 'Wright & Associates', 'Legal Dept', 22, 'meeting', 'V-1010', '2026-03-18 11:00:00', '2026-03-18 13:00:00', 'checked_out', true, 'Contract review meeting'),
        ('Karen White', 'SecureGuard Systems', 'Security Office', 1, 'contractor', 'V-1011', '2026-03-17 07:00:00', '2026-03-17 18:00:00', 'checked_out', true, 'Security camera installation'),
        ('Daniel Brown', 'N/A', 'Mike Johnson', 12, 'tour', 'V-1012', '2026-03-17 15:00:00', '2026-03-17 16:30:00', 'checked_out', true, 'Prospective tenant tour'),
        ('Emily Chang', 'CloudNet Services', 'IT Department', 3, 'maintenance', 'V-1013', '2026-03-19 07:45:00', NULL, 'checked_in', true, 'Server room network maintenance'),
        ('Richard Martinez', 'N/A', 'HR Department', 20, 'interview', 'V-1014', '2026-03-20 10:00:00', NULL, 'pre_registered', false, 'Job interview - Project Manager'),
        ('Susan Lee', 'Greenscape Landscaping', 'Facilities', 1, 'contractor', 'V-1015', '2026-03-19 06:30:00', NULL, 'checked_in', true, 'Monthly landscaping maintenance')
    `);
    console.log('  - 15 visitor logs inserted');

    // Waste Records (15)
    await pool.query(`
      INSERT INTO waste_records (container_name, location, floor, waste_type, capacity_liters, fill_level, last_collected, next_collection, daily_avg_kg, contamination_rate, status) VALUES
        ('Lobby General Waste', 'Main Lobby', 1, 'general', 240, 75, '2026-03-18 06:00:00', '2026-03-19 18:00:00', 45.0, 2.5, 'normal'),
        ('Lobby Recycling', 'Main Lobby', 1, 'recycling', 240, 60, '2026-03-18 06:00:00', '2026-03-19 18:00:00', 32.0, 5.0, 'normal'),
        ('Cafeteria Organic', 'Cafeteria', 1, 'organic', 360, 85, '2026-03-18 20:00:00', '2026-03-19 20:00:00', 68.0, 3.0, 'nearly_full'),
        ('Floor 5 General', 'North Wing Corridor', 5, 'general', 120, 45, '2026-03-18 18:00:00', '2026-03-20 18:00:00', 18.0, 1.5, 'normal'),
        ('Floor 5 Recycling', 'North Wing Corridor', 5, 'recycling', 120, 55, '2026-03-18 18:00:00', '2026-03-20 18:00:00', 15.0, 8.0, 'normal'),
        ('Floor 10 General', 'Conference Area', 10, 'general', 120, 30, '2026-03-18 18:00:00', '2026-03-20 18:00:00', 12.0, 2.0, 'normal'),
        ('Server Room E-Waste', 'Data Center', 3, 'electronic', 60, 40, '2026-03-01 10:00:00', '2026-04-01 10:00:00', 0.5, 0.0, 'normal'),
        ('Maintenance Hazardous', 'Utility Room', -1, 'hazardous', 60, 25, '2026-03-10 08:00:00', '2026-03-24 08:00:00', 0.3, 0.0, 'normal'),
        ('Floor 15 General', 'Central Corridor', 15, 'general', 120, 50, '2026-03-18 18:00:00', '2026-03-20 18:00:00', 16.0, 1.8, 'normal'),
        ('Floor 15 Recycling', 'Central Corridor', 15, 'recycling', 120, 65, '2026-03-18 18:00:00', '2026-03-20 18:00:00', 14.0, 12.0, 'contaminated'),
        ('Floor 20 General', 'South Wing', 20, 'general', 120, 35, '2026-03-18 18:00:00', '2026-03-20 18:00:00', 14.0, 2.0, 'normal'),
        ('Executive Floor Waste', 'Executive Suite', 25, 'general', 60, 20, '2026-03-18 20:00:00', '2026-03-19 20:00:00', 5.0, 1.0, 'normal'),
        ('Loading Dock Compactor', 'Loading Dock', 1, 'general', 4000, 70, '2026-03-17 06:00:00', '2026-03-20 06:00:00', 350.0, 3.5, 'normal'),
        ('Gym Recycling', 'Fitness Center', 2, 'recycling', 120, 90, '2026-03-18 20:00:00', '2026-03-19 08:00:00', 22.0, 4.0, 'nearly_full'),
        ('Parking E-Waste Bin', 'Parking Level B1', -1, 'electronic', 120, 15, '2026-02-15 10:00:00', '2026-04-15 10:00:00', 0.2, 0.0, 'normal')
    `);
    console.log('  - 15 waste records inserted');

    // Fire Safety Systems (15)
    await pool.query(`
      INSERT INTO fire_safety_systems (system_name, system_type, location, floor, status, last_tested, next_test, battery_level, compliance_status, zone_coverage, notes) VALUES
        ('Lobby Smoke Detector A', 'smoke_detector', 'Main Lobby', 1, 'operational', '2026-03-01', '2026-06-01', 95, 'compliant', 'Lobby Zone A', 'Annual test passed. Sensitivity within spec.'),
        ('Floor 5 Sprinkler System', 'sprinkler', 'North Wing', 5, 'operational', '2026-02-15', '2026-08-15', NULL, 'compliant', 'Floor 5 Full', 'Flow test completed. All heads functional.'),
        ('Main Fire Alarm Panel', 'fire_alarm', 'Security Office', 1, 'operational', '2026-03-10', '2026-06-10', 100, 'compliant', 'Building Wide', 'Central panel firmware updated. All zones reporting.'),
        ('Floor 10 Extinguisher Set', 'extinguisher', 'Conference Area', 10, 'needs_inspection', '2025-09-15', '2026-03-15', NULL, 'non_compliant', 'Floor 10 East', 'Inspection overdue. Scheduled for this week.'),
        ('Stairwell A Fire Door', 'fire_door', 'Core Stairwell A', 1, 'operational', '2026-01-20', '2026-07-20', NULL, 'compliant', 'Stairwell A All Floors', 'Door closer adjusted. Seal integrity verified.'),
        ('Floor 15 Emergency Light', 'emergency_light', 'Central Corridor', 15, 'operational', '2026-02-28', '2026-05-28', 88, 'compliant', 'Floor 15 Central', '90-minute battery test passed.'),
        ('Basement Sprinkler System', 'sprinkler', 'Parking Level B1', -1, 'operational', '2026-03-05', '2026-09-05', NULL, 'compliant', 'Basement Full', 'Dry system test completed. Pressure holding.'),
        ('Floor 20 Smoke Detector B', 'smoke_detector', 'South Wing', 20, 'operational', '2026-02-10', '2026-05-10', 72, 'compliant', 'Floor 20 South', 'Detector cleaned. Battery at 72%.'),
        ('Rooftop Fire Alarm', 'fire_alarm', 'Rooftop Mechanical', 25, 'testing', '2026-03-18', '2026-06-18', 100, 'pending_review', 'Rooftop Zone', 'Currently undergoing quarterly test cycle.'),
        ('Floor 3 Extinguisher', 'extinguisher', 'West Wing', 3, 'operational', '2026-03-12', '2026-09-12', NULL, 'compliant', 'Floor 3 West', 'Recharged and inspected. Tag updated.'),
        ('Floor 8 Emergency Light', 'emergency_light', 'East Wing Corridor', 8, 'faulty', '2026-01-15', '2026-04-15', 15, 'non_compliant', 'Floor 8 East', 'Battery failing. Replacement ordered.'),
        ('Stairwell B Fire Door', 'fire_door', 'Core Stairwell B', 1, 'operational', '2026-02-05', '2026-08-05', NULL, 'compliant', 'Stairwell B All Floors', 'All floors verified. Magnetic hold-open devices tested.'),
        ('Floor 22 Sprinkler System', 'sprinkler', 'Design Studio', 22, 'operational', '2026-03-08', '2026-09-08', NULL, 'compliant', 'Floor 22 Full', 'Visual inspection complete. No corrosion detected.'),
        ('Garage Smoke Detector', 'smoke_detector', 'Parking Level B2', -2, 'operational', '2026-03-14', '2026-06-14', 90, 'compliant', 'Parking B2', 'Heat detector combo unit. Tested with smoke canister.'),
        ('Floor 12 Emergency Light', 'emergency_light', 'Core Corridor', 12, 'replaced', '2026-03-16', '2026-06-16', 100, 'compliant', 'Floor 12 Core', 'Unit replaced with new LED model. Full charge verified.')
    `);
    console.log('  - 15 fire safety systems inserted');

    // Elevator Systems (15)
    await pool.query(`
      INSERT INTO elevator_systems (elevator_name, elevator_type, serving_floors, current_floor, status, daily_trips, avg_wait_time, capacity_kg, last_maintenance, next_maintenance, health_score, energy_consumption) VALUES
        ('Elevator 1', 'passenger', 'B2-25', 1, 'operational', 320, 28.5, 1600, '2026-03-01', '2026-06-01', 95, 85.2),
        ('Elevator 2', 'passenger', 'B2-25', 15, 'operational', 305, 30.0, 1600, '2026-02-15', '2026-05-15', 92, 82.8),
        ('Elevator 3', 'passenger', 'B2-25', 8, 'operational', 290, 32.5, 1600, '2026-03-10', '2026-06-10', 94, 80.5),
        ('Elevator 4', 'passenger', '1-25', 22, 'operational', 275, 25.0, 1600, '2026-02-28', '2026-05-28', 97, 78.3),
        ('Elevator 5', 'passenger', '1-25', 5, 'operational', 310, 27.0, 1600, '2026-03-05', '2026-06-05', 93, 83.1),
        ('Elevator 6', 'passenger', 'B2-12', 1, 'operational', 280, 22.0, 1600, '2026-01-20', '2026-04-20', 88, 65.4),
        ('Elevator 7', 'passenger', '13-25', 18, 'operational', 195, 20.0, 1600, '2026-02-10', '2026-05-10', 96, 55.2),
        ('Elevator 8', 'passenger', 'B2-25', 1, 'out_of_service', 0, 0.0, 1600, '2026-03-18', '2026-03-22', 45, 0.0),
        ('Freight A', 'freight', 'B2-25', -1, 'operational', 85, 180.0, 4500, '2026-03-08', '2026-06-08', 90, 120.5),
        ('Freight B', 'freight', 'B2-10', 1, 'operational', 60, 195.0, 4500, '2026-02-20', '2026-05-20', 87, 95.3),
        ('Freight C', 'freight', 'B2-5', -2, 'maintenance', 0, 0.0, 4500, '2026-03-15', '2026-06-15', 62, 0.0),
        ('Service 1', 'service', 'B2-25', 3, 'operational', 45, 120.0, 2500, '2026-03-12', '2026-06-12', 91, 42.8),
        ('Service 2', 'service', 'B2-25', 10, 'operational', 38, 135.0, 2500, '2026-02-25', '2026-05-25', 89, 38.5),
        ('Emergency 1', 'emergency', 'B2-25', 1, 'operational', 5, 15.0, 1200, '2026-03-14', '2026-06-14', 99, 8.2),
        ('Emergency 2', 'emergency', 'B2-25', 1, 'operational', 3, 15.0, 1200, '2026-03-14', '2026-06-14', 98, 6.5)
    `);
    console.log('  - 15 elevator systems inserted');

    // Alerts table
    await pool.query(`
      CREATE TABLE alerts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        severity VARCHAR(50) DEFAULT 'info',
        source VARCHAR(100),
        location VARCHAR(100),
        floor INTEGER,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        acknowledged_at TIMESTAMP,
        resolved_at TIMESTAMP
      );
    `);
    console.log('  - alerts table created');

    // Activity Log table
    await pool.query(`
      CREATE TABLE activity_log (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        action VARCHAR(50),
        resource_type VARCHAR(100),
        resource_id INTEGER,
        description TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - activity_log table created');

    // Building Settings table
    await pool.query(`
      CREATE TABLE building_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        category VARCHAR(100),
        description TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('  - building_settings table created');

    // Seed alerts
    await pool.query(`
      INSERT INTO alerts (title, message, severity, source, location, floor, status, created_at) VALUES
        ('High CO2 Levels Detected', 'CO2 levels in Zone A exceeding 1000 ppm threshold', 'critical', 'climate', 'Zone A - East Wing', 5, 'active', NOW() - INTERVAL '2 hours'),
        ('HVAC Unit 3 Efficiency Drop', 'Efficiency dropped below 70% - requires inspection', 'warning', 'hvac', 'Server Room B', 3, 'active', NOW() - INTERVAL '5 hours'),
        ('Water Leak Sensor Triggered', 'Moisture detected near pipe junction in basement', 'critical', 'water', 'Basement Utility Room', -1, 'active', NOW() - INTERVAL '1 hour'),
        ('Elevator 8 Out of Service', 'Elevator 8 has been taken out of service for repairs', 'warning', 'elevators', 'Main Lobby', 1, 'acknowledged', NOW() - INTERVAL '1 day'),
        ('Fire Panel Battery Low', 'Battery level at 15% on Floor 7 fire panel', 'warning', 'fire', 'Floor 7 Panel Room', 7, 'active', NOW() - INTERVAL '3 hours'),
        ('Parking Level B2 Sensor Offline', 'Occupancy sensor not responding', 'info', 'parking', 'Parking Level B2', -2, 'resolved', NOW() - INTERVAL '2 days'),
        ('Energy Peak Threshold Exceeded', 'Building energy consumption exceeded 4500 kWh target', 'warning', 'energy', 'Building-Wide', 0, 'active', NOW() - INTERVAL '6 hours'),
        ('Visitor Badge Not Returned', 'Badge #V-2847 not returned after checkout', 'info', 'visitors', 'Main Reception', 1, 'active', NOW() - INTERVAL '4 hours'),
        ('Waste Container 95% Full', 'Recycling container on Floor 10 needs collection', 'info', 'waste', 'Floor 10 Service Area', 10, 'active', NOW() - INTERVAL '8 hours'),
        ('Security Camera 12 Offline', 'Camera in parking garage not transmitting', 'critical', 'security', 'Parking Garage Entry', -1, 'active', NOW() - INTERVAL '30 minutes')
    `);
    console.log('  - 10 alerts inserted');

    // Seed activity log
    await pool.query(`
      INSERT INTO activity_log (user_name, user_email, action, resource_type, resource_id, description, ip_address, created_at) VALUES
        ('Admin User', 'admin@smartbuilding.com', 'login', 'auth', NULL, 'User logged in successfully', '192.168.1.100', NOW() - INTERVAL '1 hour'),
        ('Admin User', 'admin@smartbuilding.com', 'update', 'hvac', 3, 'Updated HVAC Unit 3 target temperature to 22°C', '192.168.1.100', NOW() - INTERVAL '2 hours'),
        ('Admin User', 'admin@smartbuilding.com', 'create', 'maintenance', 16, 'Created new maintenance item for Elevator 8', '192.168.1.100', NOW() - INTERVAL '3 hours'),
        ('Admin User', 'admin@smartbuilding.com', 'acknowledge', 'alert', 4, 'Acknowledged elevator out of service alert', '192.168.1.100', NOW() - INTERVAL '4 hours'),
        ('Admin User', 'admin@smartbuilding.com', 'update', 'lighting', 5, 'Changed Floor 5 lighting mode to eco', '192.168.1.100', NOW() - INTERVAL '5 hours'),
        ('Admin User', 'admin@smartbuilding.com', 'resolve', 'alert', 6, 'Resolved parking sensor offline alert', '192.168.1.100', NOW() - INTERVAL '1 day'),
        ('Admin User', 'admin@smartbuilding.com', 'delete', 'visitor', 8, 'Removed expired visitor record', '192.168.1.100', NOW() - INTERVAL '1 day'),
        ('Admin User', 'admin@smartbuilding.com', 'create', 'security', 20, 'Created security event for unauthorized access attempt', '192.168.1.100', NOW() - INTERVAL '2 days'),
        ('Admin User', 'admin@smartbuilding.com', 'update', 'settings', NULL, 'Updated building operating hours', '192.168.1.100', NOW() - INTERVAL '2 days'),
        ('Admin User', 'admin@smartbuilding.com', 'login', 'auth', NULL, 'User logged in successfully', '192.168.1.105', NOW() - INTERVAL '3 days')
    `);
    console.log('  - 10 activity log entries inserted');

    // Seed building settings
    await pool.query(`
      INSERT INTO building_settings (key, value, category, description) VALUES
        ('building_name', 'Smart Building HQ', 'general', 'Name of the building'),
        ('total_floors', '15', 'general', 'Total number of floors including basement'),
        ('timezone', 'America/New_York', 'general', 'Building timezone'),
        ('operating_hours', '06:00-22:00', 'general', 'Daily operating hours'),
        ('email_alerts', 'true', 'notifications', 'Enable email notifications for alerts'),
        ('alert_threshold', 'warning', 'notifications', 'Minimum severity to trigger notifications'),
        ('notify_maintenance', 'true', 'notifications', 'Send notifications for maintenance events'),
        ('notify_security', 'true', 'notifications', 'Send notifications for security events'),
        ('auto_lockdown', 'false', 'security', 'Enable automatic building lockdown on critical events'),
        ('visitor_badge_required', 'true', 'security', 'Require badge for all visitors'),
        ('camera_retention_days', '30', 'security', 'Days to retain camera footage'),
        ('access_log_retention', '90', 'security', 'Days to retain access logs'),
        ('peak_hours_start', '09:00', 'energy', 'Start of peak energy hours'),
        ('peak_hours_end', '17:00', 'energy', 'End of peak energy hours'),
        ('energy_target_kwh', '5000', 'energy', 'Daily energy consumption target in kWh'),
        ('solar_enabled', 'false', 'energy', 'Solar panel system active'),
        ('auto_schedule', 'true', 'maintenance', 'Enable automatic maintenance scheduling'),
        ('inspection_interval_days', '30', 'maintenance', 'Days between routine inspections'),
        ('warranty_alert_days', '60', 'maintenance', 'Days before warranty expiry to alert'),
        ('emergency_contact', '555-0100', 'maintenance', 'Emergency maintenance contact number')
    `);
    console.log('  - 20 building settings inserted');

    console.log('\nSeed completed successfully!');
  } catch (err) {
    console.error('Seed error:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
