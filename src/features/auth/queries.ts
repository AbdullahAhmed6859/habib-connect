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

export const getUserIdAndPasswordHashByEmailQuery = `
SELECT u.id, u.password_hash FROM users u
    INNER JOIN email_suffixes es ON u.email_suffix_id = es.id
    WHERE CONCAT(u.email_prefix, '@', es.name) = $1
`;

export const createUserQuery = `
INSERT INTO users (first_name, last_name, email_prefix, email_suffix_id, role_id, program_id, class_of, password_hash) VALUES
($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;

export const checkEmailAvailabilityQuery = `
SELECT COUNT(*) FROM users 
JOIN email_suffixes es ON users.email_suffix_id = es.id
WHERE users.email_prefix = $1 AND users.email_suffix_id = $2
`;
