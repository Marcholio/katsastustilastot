import { getBaseline, getData } from "./backend/backend";
import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Scatter,
  Tooltip,
  Line,
} from "recharts";

const tickSize = 5000;
const maxKms = 400000;

export const Chart = ({
  model,
  year,
}: {
  model: string;
  year: string | undefined;
}) => {
  const data = getData(model, year);
  const baseline = getBaseline(undefined);

  const carData = Object.values(data)
    .map((d) => ({
      km: d.avgKm - (d.avgKm % tickSize),
      perc: (d.failCount / d.count) * 100,
    }))
    .reduce(
      (acc, cur) => Object.assign(acc, { [cur.km]: cur }),
      {} as Record<number, { km: number; perc: number }>
    );

  const chartData = [...new Array(Math.floor(maxKms / tickSize))].map(
    (_a, i) => ({
      name: "data",
      km: i * tickSize,
      baseline: Math.round(baseline[i * tickSize]?.med * 10) / 10,
      baseline75: Math.round(baseline[i * tickSize]?.p75 * 10) / 10,
      baseline25: Math.round(baseline[i * tickSize]?.p25 * 10) / 10,
      perc: carData[i * tickSize]?.perc
        ? Math.round(carData[i * tickSize]?.perc * 10) / 10
        : undefined,
    })
  );

  return (
    <ComposedChart
      width={1000}
      height={800}
      margin={{ top: 20, right: 20, bottom: 10, left: 10 }}
      data={chartData}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="km" name="Kilometrit" unit="km" />
      <YAxis unit="%" />
      <Legend />
      <Tooltip />
      <Line
        name="Baseline%"
        type="monotone"
        dataKey="baseline"
        stroke="black"
        dot={false}
        connectNulls={true}
      />
      <Line
        name="Baseline 25"
        type="monotone"
        dataKey="baseline25"
        stroke="grey"
        dot={false}
        connectNulls={true}
        strokeDasharray="10 10"
      />
      <Line
        name="Baseline 75"
        type="monotone"
        dataKey="baseline75"
        stroke="grey"
        dot={false}
        connectNulls={true}
        strokeDasharray="10 10"
      />
      <Scatter name="Hylkäys%" fill="blue" dataKey="perc" />
    </ComposedChart>
  );
};
