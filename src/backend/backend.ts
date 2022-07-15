import processedData from "../data/processed.json";
import baseline from "../data/baseline.json";
import { brands } from "./brands";
import avgDiffs from "../data/avgDiffs.json";

// model -> car year -> inspection year -> stats
const fullData = processedData as any as Record<
  string,
  Record<string, Record<string, InspectionStats>>
>;

const baselineData = baseline as any as Record<
  string,
  {
    med: number | undefined;
    p75: number | undefined;
    p25: number | undefined;
  }
>;

const diffData = avgDiffs as any as Record<string, number>;

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

export const getBaseline = () => baselineData;

export const getTopList = () =>
  Object.entries(diffData).sort((a, b) => b[1] - a[1]);

export const getTopListByBrand = () => {
  return Object.entries(
    brands.reduce((acc, b) => {
      const models = Object.keys(diffData).filter((model) =>
        model.startsWith(b)
      );
      const sum = models.reduce(
        (total, model: any) => diffData[model] + total,
        0
      );

      return Object.assign(acc, {
        [b]: sum / models.length,
      });
    }, {})
  ).sort((a: any, b: any) => b[1] - a[1]);
};
