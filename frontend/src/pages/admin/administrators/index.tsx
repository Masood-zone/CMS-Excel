import { Outlet } from "react-router-dom";

export default function AdministratorLayout() {
  return (
    <section className="p-5">
      <Outlet />
    </section>
  );
}
