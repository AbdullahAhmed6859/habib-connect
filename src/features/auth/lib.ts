import { EmailRoleChoice, FormattedSignUpData } from "./types";

export function formatSignUpFormOptions(
  choices: EmailRoleChoice[]
): FormattedSignUpData {
  const options: FormattedSignUpData["options"] = {};
  const schools: FormattedSignUpData["schools"] = {};
  const programs: FormattedSignUpData["programs"] = {};

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
