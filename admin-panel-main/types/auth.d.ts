interface Permission {
  module: string;
  access: string[];
  _id: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  scope: string;
  isSuperAdmin: boolean;
  permissions: Permission[];
}

interface LoginResponse {
  status: boolean;
  // message: string;
  token: string;
  user: User;
}

export default LoginResponse;
