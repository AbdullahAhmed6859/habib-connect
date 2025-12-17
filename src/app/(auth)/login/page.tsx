import { getSignUpFormOptions } from "@/features/auth/server";
import Login from "@/features/auth/components/Login";

async function LoginPage() {
  const formOptions = await getSignUpFormOptions();
  return <Login formOptions={formOptions} />;
}

export default LoginPage;
