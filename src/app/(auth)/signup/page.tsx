import { getSignUpFormOptions } from "@/features/auth/components/signup/server";

async function SignUpPage() {
  const formattedData = await getSignUpFormOptions();
  return <div>signup page</div>;
}

export default SignUpPage;
