import VRDashboard from "@/components/vr-dashboard/VRDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

const VRConfiguratorPage = () => {
  const isMobile = useIsMobile();

  return (
    <div className={isMobile ? "pb-16" : ""}>
      <VRDashboard />
    </div>
  );
};

export default VRConfiguratorPage;