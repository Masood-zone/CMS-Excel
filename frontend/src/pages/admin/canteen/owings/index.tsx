import { Outlet } from "react-router-dom";

export default function OwingsLayout() {
  return (
    <section className="p-6">
      <Outlet />;
    </section>
  );
}
