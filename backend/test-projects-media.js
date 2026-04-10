import { pool } from "./src/config/database.js";

async function checkProjects() {
  try {
    console.log("\n=== CHECKING PROJECTS IN DATABASE ===\n");

    const result = await pool.query(`
      SELECT 
        id, 
        title, 
        media,
        jsonb_array_length(media->'images') as image_count
      FROM "Project"
      LIMIT 5
    `);

    console.log("Total projects:", result.rows.length);
    console.log("\nFirst few projects:");

    result.rows.forEach((row, idx) => {
      console.log(`\n[${idx + 1}] ${row.title}`);
      console.log("  ID:", row.id);
      console.log("  Image Count:", row.image_count);
      console.log("  Media:", JSON.stringify(row.media, null, 2));
    });

    // Also check count of projects with images
    const countRes = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE jsonb_array_length(media->'images') > 0) as with_images
      FROM "Project"
    `);

    console.log("\n=== SUMMARY ===");
    console.log("Total projects:", countRes.rows[0].total);
    console.log("Projects with images:", countRes.rows[0].with_images);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkProjects();
