const pool = require('../db');



exports.importStates = async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");

    // Read JSON File
    const statesPath = path.join(__dirname, "../json/states.json");

    const states = JSON.parse(
      fs.readFileSync(statesPath, "utf8")
    );

    // Insert States
    for (const state of states) {

      // Check already exists
      const [existing] = await pool.query(
        `SELECT id FROM states WHERE name = ?`,
        [state.name]
      );

      if (existing.length > 0) {
        console.log(`State already exists: ${state.name}`);
        continue;
      }

      // Insert
      await pool.query(
        `
        INSERT INTO states (
          name
        )
        VALUES (?)
        `,
        [
          state.name
        ]
      );

      console.log(`Inserted State: ${state.name}`);
    }

    res.json({
      success: true,
      message: "States Imported Successfully"
    });

  } catch (error) {
    console.log("IMPORT STATES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to import states"
    });
  }
};

exports.importDistricts = async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");

    // Read JSON File
    const districtPath = path.join(
      __dirname,
      "../json/districts.json"
    );

    const districts = JSON.parse(
      fs.readFileSync(districtPath, "utf8")
    );

    // Insert Districts
    for (const district of districts) {

      // Check already exists
      const [existing] = await pool.query(
        `
        SELECT id
        FROM districts
        WHERE name = ?
        AND state_id = ?
        `,
        [
          district.name,
          district.state_id
        ]
      );

      if (existing.length > 0) {
        console.log(
          `District already exists: ${district.name}`
        );

        continue;
      }

      // Insert
      await pool.query(
        `
        INSERT INTO districts (
          state_id,
          name
        )
        VALUES (?, ?)
        `,
        [
          district.state_id,
          district.name
        ]
      );

      console.log(
        `Inserted District: ${district.name}`
      );
    }

    res.json({
      success: true,
      message: "Districts Imported Successfully"
    });

  } catch (error) {
    console.log(
      "IMPORT DISTRICTS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to import districts"
    });
  }
};


exports.importCities = async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");

    // Read JSON File
    const citiesPath = path.join(
      __dirname,
      "../json/cities.json"
    );

    const cities = JSON.parse(
      fs.readFileSync(citiesPath, "utf8")
    );

    // Insert Cities
    for (const city of cities) {

      // Check already exists
      const [existing] = await pool.query(
        `
        SELECT id
        FROM cities
        WHERE name = ?
        AND district_id = ?
        `,
        [
          city.name,
          city.district_id
        ]
      );

      if (existing.length > 0) {
        console.log(
          `City already exists: ${city.name}`
        );

        continue;
      }

      // Insert
      await pool.query(
        `
        INSERT INTO cities (
          district_id,
          name
        )
        VALUES (?, ?)
        `,
        [
          city.district_id,
          city.name
        ]
      );

      console.log(
        `Inserted City: ${city.name}`
      );
    }

    res.json({
      success: true,
      message: "Cities Imported Successfully"
    });

  } catch (error) {
    console.log(
      "IMPORT CITIES ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to import cities"
    });
  }
};

exports.importCategory = async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");

    // Read JSON File
    const categoryPath = path.join(
      __dirname,
      "../json/category.json"
    );

    const category = JSON.parse(
      fs.readFileSync(categoryPath, "utf8")
    );

    // Insert Cities
    for (const item of category) {

      // Check already exists
      const [existing] = await pool.query(
        `
        SELECT id
        FROM categories
        WHERE name = ?
        `,
        [
          item.name,
          item.district_id
        ]
      );

      if (existing.length > 0) {
        console.log(
          `Category already exists: ${item.name}`
        );

        continue;
      }

      // Insert
      await pool.query(
        `
        INSERT INTO categories (
          name
        )
        VALUES (?)
        `,
        [
          item.name
        ]
      );

      console.log(
        `Inserted category: ${item.name}`
      );
    }

    res.json({
      success: true,
      message: "category Imported Successfully"
    });

  } catch (error) {
    console.log(
      "IMPORT category ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to import category"
    });
  }
};






