//WORKING EXAMPLE
SELECT *
FROM hr_proposals_back."Users"
WHERE "masterId" IN
(
    SELECT CAST(unnest(string_to_array("headsMasterIds", ',')) AS integer)
    FROM hr_proposals_back."Users"
    WHERE "masterId" = 857383
    LIMIT 1
);
////


//WORKING EXAMPLE2
SELECT *
FROM hr_proposals_back."Users"
WHERE "headsMasterIds" LIKE '%' ||
(
    SELECT unnest(string_to_array("headsMasterIds", ','))
    FROM hr_proposals_back."Users"
    WHERE "masterId" = 857383
    LIMIT 1
) || '%';
////


//FINISH RESULT
SELECT * FROM hr_proposals_back."Users" where head in (select head from hr_proposals_back."Users" WHERE "masterId" = 857383 )
///
