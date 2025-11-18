export const getUserByIdQuery = `
SELECT
    u.id,
    u.first_name,
    u.last_name,
    CONCAT(LEFT(u.first_name, 1), LEFT(u.last_name, 1)) AS acronym,
    CONCAT(
        u.email_prefix,
        CASE 
            WHEN sdm.name IS NOT NULL THEN '.' || sdm.name
            ELSE ''
        END,
        '@',
        d.name
    ) AS email,
    r.name AS role,
    sch_prog.name AS school,
    sch_prog.short AS school_short,
    p.name AS program,
    p.short AS program_short,
    u.class_of
FROM users u
LEFT JOIN subdomains sdm ON u.subdomain_id = sdm.id
LEFT JOIN domains d ON u.domain_id = d.id
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN programs p ON u.program_id = p.id
LEFT JOIN schools sch_prog ON p.school_id = sch_prog.id;
WHERE u.id = $1;
`;

export const getSignUpFormOptionsQuery = `
SELECT
    -- 1. Build the email suffix (e.g., @st.habib.edu.pk or @habib.edu.pk)
    CONCAT(
        '@',
        CASE
            WHEN sdm.name IS NOT NULL THEN sdm.name || '.'
            ELSE ''
        END,
        d.name
    ) AS email_suffix,

    -- 2. Get Role info
    r.id AS role_id,
    r.name AS role_name,

    -- 3. Get School info
    sch.id AS school_id,
    sch.name AS school_name,

    -- 4. Get corresponding Program info for that school
    p.id AS program_id,
    p.name AS program_name,
    p.short AS program_short

FROM
    email_role_choices erc
    
-- Join all the definition tables
LEFT JOIN
    subdomains sdm ON erc.subdomain_id = sdm.id
JOIN
    domains d ON erc.domain_id = d.id
JOIN
    roles r ON erc.role_id = r.id
LEFT JOIN
    schools sch ON erc.school_id = sch.id
    
-- This LEFT JOIN connects the programs to the school defined in the rule
LEFT JOIN
    programs p ON p.school_id = erc.school_id

-- Order for clarity
ORDER BY
    email_suffix,
    role_name,
    school_name,
    program_name;
`;
