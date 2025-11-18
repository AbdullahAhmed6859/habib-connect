import { getSignUpFormOptions } from "@/features/auth/server";
import Signup from "@/features/auth/components/Signup";

async function SignUpPage() {
  const formOptions = await getSignUpFormOptions();
  return <Signup formOptions={formOptions} />;
}

export default SignUpPage;
