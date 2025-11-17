-- Check what size patterns actually exist in the data
SELECT
    SUBSTRING(name FROM '\(([^)]+)\)$') as size_suffix,
    COUNT(*) as count,
    STRING_AGG(DISTINCT name, ', ') as examples
FROM menu_items
WHERE name ~ '\([^)]+\)$'
GROUP BY SUBSTRING(name FROM '\(([^)]+)\)$')
ORDER BY count DESC;
