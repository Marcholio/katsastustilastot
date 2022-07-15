import processedData from "../data/processed.json";
import { median, sort } from "ramda";
import { brands } from "./brands";

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

export const getBrands = (): string[] => brands;

export const getModels = (brand: string): string[] =>
  Object.keys(fullData)
    .filter((model) => model.startsWith(brand))
    .map((model) => model.slice(brand.length + 1));

export const getYears = (model: string): string[] =>
  fullData[model]
    ? Object.keys(fullData[model]).filter((year) =>
        Object.values(fullData[model][year]).some((stat) => stat.count > 0)
      )
    : [];

export const getData = (
  model: string,
  carYear: string | undefined
): InspectionStats[] => {
  if (!fullData[model]) {
    return Object.keys(fullData)
      .filter((m) => m.startsWith(model))
      .flatMap((m) =>
        Object.values(fullData[m]).flatMap((val) => Object.values(val))
      );
  }

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

    if (cur.count > 0) {
      const perc = ((cur.failCount ?? 0) / cur.count) * 100;

      acc[key].push(perc);
    }
    return acc;
  }, {} as Record<string, number[]>);

  const baseLineData = Object.entries(percentagesByKm).reduce(
    (acc, [km, percentages]) =>
      Object.assign(acc, {
        [km]: {
          med: percentages.length > 0 ? median(percentages) : undefined,
          p75:
            percentages.length > 0 ? percentile(percentages, 0.75) : undefined,
          p25:
            percentages.length > 0 ? percentile(percentages, 0.25) : undefined,
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

  return baseLineData;
};
