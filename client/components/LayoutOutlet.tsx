import { Outlet } from "react-router-dom";
import { Layout } from "./Layout";

export default function LayoutOutlet() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
