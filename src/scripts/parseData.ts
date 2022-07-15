import baseData from "../data/main.json" assert { type: "json" };
import fs from "fs";
import { all, median, sort } from "ramda";
import { InspectionStats } from "../backend/backend";

const tickSize = 5000;
const maxKms = 400000;

const main = baseData as any;
const nonSumRows = main.data.filter(
  (d: any) => !d.key[1].includes("yhteensä") && !d.key[2].includes("yhteensä")
);

const processedData = nonSumRows
  //.filter((r: any) => r.key[1].includes("Volkswagen"))
  .filter((r: any) => !isNaN(r.values[0]))
  .map((r: any) => ({
    inspectionYear: r.key[0],
    model: r.key[1],
    carYear: r.key[2],
    stat: r.key[3],
    value: Number(r.values[0]),
  }))
  .reduce((acc: any, row: any) => {
    const { model, inspectionYear, carYear } = row;
    if (!(model in acc)) {
      acc[model] = {};
    }

    if (!(carYear in acc[model])) {
      acc[model][carYear] = {};
    }

    if (!(inspectionYear in acc[model][carYear])) {
      acc[model][carYear][inspectionYear] = {};
    }

    switch (row.stat) {
      case "Lkm":
        acc[model][carYear][inspectionYear].count = row.value;
        return acc;
      case "Ka":
        acc[model][carYear][inspectionYear].avgKm = row.value;
        return acc;
      case "Mediaani":
        acc[model][carYear][inspectionYear].medKm = row.value;
        return acc;
      case "Hyvaksytyt":
        acc[model][carYear][inspectionYear].okCount = row.value;
        return acc;
      case "Hylatyt":
        acc[model][carYear][inspectionYear].failCount = row.value;
        return acc;
    }

    return acc;
  }, {});

fs.writeFileSync(
  "./src/data/processed.json",
  JSON.stringify(processedData),
  {}
);

const percentile = (data: number[], percentile: number): number => {
  const idx = Math.round(percentile * data.length);
  const sorted = sort((a, b) => a - b, data);
  return sorted[idx];
};

const flatStats = Object.values(processedData).flatMap((d: any) =>
  Object.values(d).flatMap((s: any) => Object.values(s))
) as InspectionStats[];

const percentagesByKm = flatStats.reduce((acc: any, cur: any) => {
  // KEEP IN SYNC WITH Chart.ts
  const key = cur.avgKm - (cur.avgKm % tickSize);
  if (!(key in acc)) {
    acc[key] = [];
  }

  if (cur.count > 0) {
    const perc = ((cur.failCount ?? 0) / cur.count) * 100;

    acc[key].push(perc);
  }
  return acc;
}, {} as Record<string, number[]>);

const baseLineData = Object.entries(percentagesByKm).reduce(
  (acc, [km, percentages]: any) =>
    Object.assign(acc, {
      [km]: {
        med: percentages.length > 0 ? median(percentages) : undefined,
        p75: percentages.length > 0 ? percentile(percentages, 0.75) : undefined,
        p25: percentages.length > 0 ? percentile(percentages, 0.25) : undefined,
      },
    }),
  {} as Record<
    string,
    {
      med: number | undefined;
      p75: number | undefined;
      p25: number | undefined;
    }
  >
);

fs.writeFileSync("./src/data/baseline.json", JSON.stringify(baseLineData), {});

const averageDiffsByModel = Object.keys(processedData).reduce((acc, model) => {
  const allStats: InspectionStats[] = Object.values(
    processedData[model]
  ).flatMap((d: any) => Object.values(d));

  const diffs = allStats
    .filter((stat) => stat.avgKm <= maxKms)
    .map((stat) => {
      const kmSlot = stat.avgKm - (stat.avgKm % tickSize);
      const baseline = baseLineData[kmSlot.toString()];
      return baseline.med! - (100 * (stat.failCount || 0)) / stat.count;
    });

  const avgDiff = diffs.reduce((total, cur) => total + cur, 0) / diffs.length;

  return Object.assign(acc, { [model]: avgDiff });
}, {} as Record<string, number>);

fs.writeFileSync(
  "./src/data/avgDiffs.json",
  JSON.stringify(averageDiffsByModel),
  {}
);
