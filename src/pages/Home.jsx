import { useOutletContext } from "react-router-dom";
import Curr_balance_card from "../components/Curr_balance_card";
import Pie_chart_card from "../components/Pie_chart_card";
import Upcoming_bills from "../components/Upcoming_bills";
import Transaction_card from "../components/Transaction_card";
import Chart from "../components/Chart";

export default function Home() {
  const { role } = useOutletContext();

  return (
    <>
      {/* Top Row — 3 separate cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Curr_balance_card />
        <Pie_chart_card />
        <Upcoming_bills />
      </div>

      {/* Bottom Row — 2 separate cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Transaction_card role={role} />
        <div className="col-span-1 lg:col-span-2 h-full">
          <Chart />
        </div>
      </div>
    </>
  );
}
