"use server";

import { pool } from "@/lib/db";

const getSignUpFormOptionsQuery = `
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

type EmailRoleChoice = {
  email_suffix_id: number;
  email_suffix: string;
  role_id: number;
  role_name: string;
  school_id: number;
  school_name: string;
  program_id: number;
  program_name: string;
};

type Schools = {
  [id: number]: {
    name: string;
    programs: (keyof typeof programs)[];
  };
};

type Options = {
  [id: number]: {
    email_suffix: string;
    role: { id: number; name: string };
    schools: (keyof typeof schools)[];
  };
};

type Programs = {
  [id: number]: string;
};

const programs: Programs = {
  121: "CS",
  2313: "EE",
  30804: "CE",
  1348: "SDP",
  2232: "CND",
  3590: "CH",
};

const schools: Schools = {
  1213: {
    name: "DSSE",
    programs: [121, 2313, 30804],
  },
  211: {
    name: "AHSS",
    programs: [1348, 2232, 3590],
  },
};

const options: Options = {
  98: {
    email_suffix: "@st.habib.edu.pk",
    role: { id: 12, name: "student" },
    schools: [1213, 211],
  },
  103: {
    email_suffix: "@sse.habib.edu.pk",
    role: { id: 15, name: "faculty" },
    schools: [1213],
  },
  104: {
    email_suffix: "@ahss.habib.edu.pk",
    role: { id: 15, name: "faculty" },
    schools: [211],
  },
  105: {
    email_suffix: "@habib.edu.pk",
    role: { id: 20, name: "staff" },
    schools: [],
  },
};

export async function getSignUpFormOptions() {
  const result = await pool.query(getSignUpFormOptionsQuery);
  const formattedData = formatSignUpFormOptions(
    result.rows as EmailRoleChoice[]
  );
  console.log(formattedData.options);
  return formattedData;
}

type FormattedSignUpData = {
  options: Options;
  schools: Schools;
  programs: Programs;
};

function formatSignUpFormOptions(
  choices: EmailRoleChoice[]
): FormattedSignUpData {
  const options: Options = {};
  const schools: Schools = {};
  const programs: Programs = {};

  // First pass: build schools and programs maps
  for (const choice of choices) {
    // Add program to programs map
    if (choice.program_id && choice.program_name) {
      programs[choice.program_id] = choice.program_name;
    }

    // Build schools map with their programs
    if (choice.school_id && choice.school_name) {
      if (!schools[choice.school_id]) {
        schools[choice.school_id] = {
          name: choice.school_name,
          programs: [],
        };
      }

      // Add program to school if it exists and isn't already added
      if (
        choice.program_id &&
        !schools[choice.school_id].programs.includes(choice.program_id)
      ) {
        schools[choice.school_id].programs.push(choice.program_id);
      }
    }
  }

  // Second pass: build options structure
  for (const choice of choices) {
    const suffixId = choice.email_suffix_id;

    // Initialize the option entry if it doesn't exist
    if (!options[suffixId]) {
      options[suffixId] = {
        email_suffix: choice.email_suffix,
        role: {
          id: choice.role_id,
          name: choice.role_name,
        },
        schools: [],
      };
    }

    // Add school to the option's schools array if it exists and isn't already added
    if (
      choice.school_id &&
      !options[suffixId].schools.includes(choice.school_id)
    ) {
      options[suffixId].schools.push(choice.school_id);
    }
  }

  return { options, schools, programs };
}

// Example usage:
// const { options, schools, programs } = formatSignUpFormOptions(emailRoleChoices);
//
// Now you can use the data for your signup form:
// const suffix_id = 98;
// const role = options[suffix_id].role;
// const school_options = options[suffix_id].schools;
// const school_id = school_options[0];
// const program_options = schools[school_id].programs;
// const program_id = program_options[0];
// const program_name = programs[program_id];

// display selection box for email prefix
// user chooses email prefix
// we get the suffix_id and also select the role
const suffix_id = 98;
const role = options[suffix_id].role;
const role_id = role.id;

//
const school_options = options[suffix_id].schools;
// user selects school
const school_id = school_options[0];

const program_options = schools[school_id].programs;
// user selects program
const program_id = program_options[0];

// user enters first name
const first_name = "John";
// user enters last name
const last_name = "Doe";

// user enters password
const password = "password";

// user enters confirm password
const confirm_password = "password";

// user clicks sign up
const sign_up = true;
