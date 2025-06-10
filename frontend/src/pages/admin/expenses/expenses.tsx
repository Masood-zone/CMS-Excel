import { Header } from "@/components/typography/heading";
import { useNavigate } from "react-router-dom";
import ExpensesTable from "./list/expenses/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import ReferencesTable from "./list/references/references-table";
import OverallTotals from "./overall/overall";

export default function Expenses() {
  const navigate = useNavigate();

  return (
    <section className="container py-5 px-4 w-full">
      {/* Header */}

      <Header
        title="Accounts"
        buttonText="Setup Accounts"
        buttonAction={() => navigate("/admin/expenses/add")}
      />

      {/* Table Tabs*/}
      <Tabs defaultValue="expenses" className="w-full mt-5">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          {/* <TabsTrigger value="references">References</TabsTrigger> */}
          <TabsTrigger value="overall">Overall</TabsTrigger>
        </TabsList>
        <TabsContent value="expenses" className="space-y-4">
          <ExpensesTable />
        </TabsContent>
        {/* <TabsContent value="references">
          <ReferencesTable />
        </TabsContent> */}
        <TabsContent value="overall">
          <OverallTotals />
        </TabsContent>
      </Tabs>
    </section>
  );
}
