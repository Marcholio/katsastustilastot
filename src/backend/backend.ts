import processedData from "../data/processed.json";
import { median, sort } from "ramda";

// model -> car year -> inspection year -> stats
const fullData = processedData as any as Record<
  string,
  Record<string, Record<string, InspectionStats>>
>;

export type InspectionStats = {
  count: number;
  avgKm: number;
  medKm: number;
  okCount: number;
  failCount: number;
};

export const getModels = (): string[] => Object.keys(fullData);
export const getYears = (model: string): string[] =>
  Object.keys(fullData[model]);

export const getData = (
  model: string,
  carYear: string | undefined
): InspectionStats[] => {
  if (carYear && carYear !== "0") {
    return Object.values(fullData[model][carYear]);
  }

  return Object.values(fullData[model]).flatMap((val) => Object.values(val));
};

const percentile = (data: number[], percentile: number): number => {
  const idx = Math.round(percentile * data.length);
  const sorted = sort((a, b) => a - b, data);
  return sorted[idx];
};

export const getBaseline = (model: string | undefined) => {
  const dataset =
    model !== undefined ? [fullData[model]] : Object.values(fullData);

  const flatStats = dataset.flatMap((d) =>
    Object.values(d).flatMap((s) => Object.values(s))
  );

  const percentagesByKm = flatStats.reduce((acc, cur) => {
    // KEEP IN SYNC WITH Chart.ts
    const key = cur.avgKm - (cur.avgKm % 5000);
    if (!(key in acc)) {
      acc[key] = [];
    }

    const perc = (cur.failCount / cur.count) * 100;

    acc[key].push(perc);
    return acc;
  }, {} as Record<string, number[]>);

  const baseLineData = Object.entries(percentagesByKm).reduce(
    (acc, [km, percentages]) =>
      Object.assign(acc, {
        [km]: {
          med: median(percentages),
          p75: percentile(percentages, 0.75),
          p25: percentile(percentages, 0.25),
        },
      }),
    {} as Record<string, { med: number; p75: number; p25: number }>
  );

  return baseLineData;
};
