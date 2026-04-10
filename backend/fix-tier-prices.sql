-- SQL Script to Add Prices to Tiers
-- This adds default prices to any tiers that don't have them set

UPDATE "Project" SET tiers = (
  SELECT jsonb_agg(
    CASE 
      WHEN tier->>'price' IS NOT NULL AND (tier->>'price')::int > 0 THEN tier
      ELSE jsonb_set(tier, '{price}', to_jsonb((CASE (tier->>'level')::int 
        WHEN 1 THEN 2499
        WHEN 2 THEN 3499
        WHEN 3 THEN 4499
        ELSE 2499
      END)))
    END
  )
  FROM jsonb_array_elements(tiers) AS tier
)
WHERE tiers IS NOT NULL AND jsonb_array_length(tiers) > 0;

-- Verify the update
SELECT title, tiers FROM "Project" LIMIT 5;
