import React, { ReactElement } from "react";
import { ResponsivePie } from "@nivo/pie";

const MemoryMetricsPieChart = (props) => {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    const filteredData = props.data.filter((entry) => {
      return entry.memory_physical_used_byte > 0;
    });
    setData(
      filteredData.map((entry) => {
        return {
          id: entry.name,
          label: entry.name,
          value: entry.memory_physical_used_byte.toFixed(2),
        };
      })
    );
  }, [props.data]);

  return (
    <ResponsivePie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      colors={{ scheme: "nivo" }}
      borderWidth={1}
      borderColor={{ theme: "background" }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={"#333333"}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
    />
  );
};

export default MemoryMetricsPieChart;
