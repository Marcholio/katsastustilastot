import baseData from "../data/main.json" assert { type: "json" };
import fs from "fs";
import { InspectionStats } from "../backend/backend";

const main = baseData as any;
const nonSumRows = main.data.filter(
  (d: any) => !d.key[1].includes("yhteensä") && !d.key[2].includes("yhteensä")
);

const processedData = nonSumRows
  //.filter((r: any) => r.key[1].includes("Volkswagen"))
  .map((r: any) => ({
    inspectionYear: r.key[0],
    model: r.key[1],
    carYear: r.key[2],
    stat: r.key[3],
    value: !isNaN(Number(r.values[0])) ? Number(r.values[0]) : 0,
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
  }, {} as Record<string, InspectionStats>);

fs.writeFileSync(
  "./src/data/processed.json",
  JSON.stringify(processedData),
  {}
);
