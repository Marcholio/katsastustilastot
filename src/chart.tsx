import { getBaseline, getData, InspectionStats } from "./backend/backend";
import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Scatter,
  Tooltip,
  Line,
  Label,
} from "recharts";

const tickSize = 5000;
const maxKms = 400000;

const createCarData = (dataset: InspectionStats[]) =>
  Object.fromEntries(
    Object.entries(
      Object.values(dataset)
        .map((d) => ({
          km: d.avgKm - (d.avgKm % tickSize),
          perc: d.count > 0 ? ((d.failCount ?? 0) / d.count) * 100 : undefined,
        }))
        .reduce((acc, cur) => {
          if (cur.km in acc) {
            acc[cur.km].perc.push(cur.perc);
            return acc;
          }
          return Object.assign(acc, { [cur.km]: { ...cur, perc: [cur.perc] } });
        }, {} as Record<number, { km: number; perc: (number | undefined)[] }>)
    ).map(([km, value]) => [
      km,
      {
        ...value,
        perc:
          value.perc
            .filter((p) => p !== undefined)
            .reduce((total: number, cur) => (cur ? total + cur : total), 0) /
          (value.perc.filter((p) => p !== undefined).length || 1),
      },
    ])
  );

const round = (
  num: number | undefined,
  decimalPlaces: number
): number | undefined =>
  num !== undefined
    ? Math.round(num * 10 * decimalPlaces) / (10 * decimalPlaces)
    : undefined;

const getTitle = (
  props: { model: string; year: string | undefined } | undefined
): string => {
  if (!props) {
    return "";
  }

  const { model, year } = props;

  if (model && year && year !== "0") {
    return `${model} (${year})`;
  }

  if (model) {
    return `${model}`;
  }

  return "";
};

export const Chart = ({
  left,
  right,
}: {
  left: {
    model: string;
    year: string | undefined;
  };
  right?: { model: string; year: string | undefined };
}) => {
  const leftData = getData(left.model, left.year);

  const rightData = right ? getData(right?.model, right?.year) : [];
  const baseline = getBaseline();

  const leftCarData = createCarData(leftData);
  const rightCarData = createCarData(rightData);

  const chartData = [...new Array(Math.floor(maxKms / tickSize))].map(
    (_a, i) => {
      const baselineData = baseline[i * tickSize];
      if (!baselineData) {
        return {
          name: "data",
          km: (i * tickSize) / 1000,
        };
      }

      return {
        name: "data",
        km: `${(i * tickSize) / 1000}`,
        baseline: round(baselineData.med, 1),
        baseline75: round(baselineData.p75, 1),
        baseline25: round(baselineData.p25, 1),
        percLeft: round(leftCarData[i * tickSize]?.perc, 1),
        percRight: round(rightCarData[i * tickSize]?.perc, 1),
      };
    }
  );

  return (
    <div className="chart-container">
      <h1>
        {getTitle(left)} {right && `vs. ${getTitle(right)}`}
      </h1>
      <ComposedChart
        width={window.innerWidth * 0.8}
        height={window.innerHeight * 0.6}
        margin={{ top: 20, right: 20, bottom: 100, left: 200 }}
        data={chartData}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="km" name="Kilometrit" unit="tkm">
          <Label position="bottom">Kilometrit</Label>
        </XAxis>
        <YAxis unit="%" name="Hylk??ysprosentti">
          <Label position="left">Hylk??ysprosentti</Label>
        </YAxis>
        <Tooltip />
        <Line
          name="Kaikki (mediaani)"
          type="monotone"
          dataKey="baseline"
          stroke="black"
          dot={false}
          connectNulls={true}
        />
        <Line
          name="Kaikki (p25)"
          type="monotone"
          dataKey="baseline25"
          stroke="grey"
          dot={false}
          connectNulls={true}
          strokeDasharray="10 10"
        />
        <Line
          name="Kaikki (p75)"
          type="monotone"
          dataKey="baseline75"
          stroke="grey"
          dot={false}
          connectNulls={true}
          strokeDasharray="10 10"
        />
        <Scatter name={getTitle(left)} fill="blue" dataKey="percLeft" />
        {right && (
          <Scatter name={getTitle(right)} fill="red" dataKey="percRight" />
        )}
        <Legend align="right" layout="vertical" verticalAlign="middle" />
      </ComposedChart>
    </div>
  );
};
