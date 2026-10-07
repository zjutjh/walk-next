import type { UserHome } from "api/types/client";

export interface AlumniRegisterFormValue {
  name: string;
  identity: string;
  tel: string;
  password: string;
  home: UserHome;
}
