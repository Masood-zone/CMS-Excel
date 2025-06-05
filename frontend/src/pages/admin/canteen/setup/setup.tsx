import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Users } from "lucide-react";
import SetupCanteen from "./list/_test/setup-canteen";
import Owings from "../owings/owings";

export default function SetupCanteenTabs() {
  const [activeTab, setActiveTab] = useState("canteen");

  return (
    <div className="container mx-auto py-6 px-3 sm:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Admin Canteen Management
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {activeTab === "canteen"
              ? "Setup and manage daily canteen records for students"
              : "Track and manage students with outstanding payments"}
          </p>
        </div>
        <Tabs
          defaultValue="canteen"
          className="w-full sm:w-[400px]"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="canteen"
              className="flex items-center justify-center text-xs sm:text-base"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Canteen Setup
            </TabsTrigger>
            <TabsTrigger
              value="owings"
              className="flex items-center justify-center text-xs sm:text-base"
            >
              <Users className="h-4 w-4 mr-2" />
              Student Owings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs
        defaultValue="canteen"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsContent value="canteen">
          <SetupCanteen />
        </TabsContent>
        <TabsContent value="owings">
          <Owings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
