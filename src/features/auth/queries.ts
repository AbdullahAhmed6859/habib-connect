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
    es.id AS email_suffix_id,
    CONCAT('@', es.name) AS email_suffix,
    r.id AS role_id,
    r.name AS role_name,
    sch.id AS school_id,
    sch.short AS school_name,
    p.id AS program_id,
    p.short AS program_name
FROM
    email_role_choices erc
JOIN
    email_suffixes es ON erc.email_suffix_id = es.id 
JOIN
    roles r ON erc.role_id = r.id
LEFT JOIN
    schools sch ON erc.school_id = sch.id
LEFT JOIN
    programs p ON p.school_id = erc.school_id AND erc.school_id IS NOT NULL
ORDER BY
    email_suffix,
    role_name,
    school_name NULLS FIRST,
    program_name NULLS FIRST;
`;

export const authenticateUserQuery = `
SELECT u.id, u.password_hash FROM users u
    INNER JOIN email_suffixes es ON u.email_suffix_id = es.id
    WHERE CONCAT(u.email_prefix, '@', es.name) = $1
`;

export const createUserQuery = `
INSERT INTO users (first_name, last_name, email_prefix, email_suffix_id, role_id, program_id, class_of, password_hash) VALUES
($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;

// first_name: string;
//   last_name: string;
//   email_prefix: string;
//   email_suffix_id: number;
//   role_id: number;
//   program_id: number;
//   class_of: number;
//   password_hash: string;
