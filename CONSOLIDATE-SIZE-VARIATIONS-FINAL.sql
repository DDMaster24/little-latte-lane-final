-- ============================================================================
-- SIZE VARIATION CONSOLIDATION SCRIPT (FINAL VERSION)
-- Only consolidates items with (S), (M), (L), (R) suffixes
-- Preserves order history and ignores non-size suffixes
-- ============================================================================

BEGIN;

DO $$
DECLARE
    base_name TEXT;
    base_item_id UUID;
    item RECORD;
    size_name TEXT;
    display_order INT;
    duplicate_ids UUID[];
BEGIN
    -- Get all unique base names (only for items with size suffixes S/M/L/R)
    FOR base_name IN
        SELECT DISTINCT REGEXP_REPLACE(mi.name, '\s*\([SMLR]\)$', '') as base
        FROM menu_items mi
        WHERE mi.name ~ '\([SMLR]\)$'  -- Only S, M, L, R (not D, V, or other suffixes)
        ORDER BY base
    LOOP
        DECLARE
            item_count INT;
        BEGIN
            -- Count how many sizes exist
            SELECT COUNT(*) INTO item_count
            FROM menu_items
            WHERE REGEXP_REPLACE(name, '\s*\([SMLR]\)$', '') = base_name
            AND name ~ '\([SMLR]\)$';

            IF item_count > 1 THEN
                -- Pick the first item as base (S > M > L > R)
                SELECT id INTO base_item_id
                FROM menu_items
                WHERE REGEXP_REPLACE(name, '\s*\([SMLR]\)$', '') = base_name
                AND name ~ '\([SMLR]\)$'
                ORDER BY
                    CASE
                        WHEN name ~ '\(S\)$' THEN 1
                        WHEN name ~ '\(M\)$' THEN 2
                        WHEN name ~ '\(L\)$' THEN 3
                        WHEN name ~ '\(R\)$' THEN 4
                    END
                LIMIT 1;

                -- Get IDs of duplicates
                SELECT ARRAY_AGG(id)
                INTO duplicate_ids
                FROM menu_items
                WHERE REGEXP_REPLACE(name, '\s*\([SMLR]\)$', '') = base_name
                AND name ~ '\([SMLR]\)$'
                AND id != base_item_id;

                -- Update order history first
                IF duplicate_ids IS NOT NULL THEN
                    UPDATE order_items
                    SET menu_item_id = base_item_id
                    WHERE menu_item_id = ANY(duplicate_ids);
                END IF;

                -- Create variations for all sizes
                FOR item IN
                    SELECT id, name, price
                    FROM menu_items
                    WHERE REGEXP_REPLACE(name, '\s*\([SMLR]\)$', '') = base_name
                    AND name ~ '\([SMLR]\)$'
                LOOP
                    -- Extract size from name using regex
                    size_name := CASE
                        WHEN item.name ~ '\(S\)$' THEN 'Small'
                        WHEN item.name ~ '\(M\)$' THEN 'Medium'
                        WHEN item.name ~ '\(L\)$' THEN 'Large'
                        WHEN item.name ~ '\(R\)$' THEN 'Regular'
                        ELSE NULL
                    END;

                    -- Skip if size_name is NULL (safety check)
                    IF size_name IS NOT NULL THEN
                        display_order := CASE
                            WHEN item.name ~ '\(S\)$' THEN 1
                            WHEN item.name ~ '\(M\)$' THEN 2
                            WHEN item.name ~ '\(L\)$' THEN 3
                            WHEN item.name ~ '\(R\)$' THEN 4
                        END;

                        -- Insert variation
                        INSERT INTO menu_item_variations (menu_item_id, name, absolute_price, is_default, display_order)
                        VALUES (base_item_id, size_name, item.price, item.id = base_item_id, display_order);
                    ELSE
                        RAISE WARNING 'Skipped item with unrecognized size pattern: %', item.name;
                    END IF;
                END LOOP;

                -- Rename base item (remove size suffix)
                UPDATE menu_items
                SET name = base_name
                WHERE id = base_item_id;

                -- Delete duplicates
                DELETE FROM menu_items
                WHERE REGEXP_REPLACE(name, '\s*\([SMLR]\)$', '') = base_name
                AND name ~ '\([SMLR]\)$'
                AND id != base_item_id;

                RAISE NOTICE 'Consolidated %: % sizes', base_name, item_count;
            END IF;
        END;
    END LOOP;
END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check how many items remain
SELECT COUNT(*) as total_items_after FROM menu_items;

-- Check how many have variations now
SELECT
    mi.name,
    COUNT(v.id) as variation_count,
    STRING_AGG(v.name || ' (R' || v.absolute_price || ')', ', ' ORDER BY v.display_order) as sizes
FROM menu_items mi
INNER JOIN menu_item_variations v ON v.menu_item_id = mi.id
GROUP BY mi.id, mi.name
ORDER BY mi.name
LIMIT 20;

-- Check for any remaining S/M/L/R suffixes (should be 0)
SELECT COUNT(*) as remaining_size_suffixes
FROM menu_items
WHERE name ~ '\([SMLR]\)$';

-- Total variations created
SELECT COUNT(*) as total_variations_created FROM menu_item_variations;

-- Items that were NOT consolidated (other suffixes like V, 350g, etc.)
SELECT name
FROM menu_items
WHERE name ~ '\([^)]+\)$'
AND name !~ '\([SMLR]\)$'
ORDER BY name;
