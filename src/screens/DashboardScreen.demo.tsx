import React from "react";
import DashboardScreen from "@/screens/DashboardScreen";

/**
 * Demo do DashboardScreen com dados de exemplo
 */
export const DashboardDemo: React.FC = () => {
  // Demo: usar IDs fixos para testar (em produção viria de context)
  const demoUserId = "demo-user-123";
  const demoOrganizationId = "demo-org-456";

  return (
    <DashboardScreen userId={demoUserId} organizationId={demoOrganizationId} />
  );
};

export default DashboardDemo;
