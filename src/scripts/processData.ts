// Processes raw JSON export from https://trafi2.stat.fi/PXWeb/pxweb/fi/TraFi/TraFi__Katsastuksen_vikatilastot/
// 1. Select "Henkilöautojen määräaikaiskatsastukset malleittain 2017-2022"
// 2. Select latest year
// 3. Select all other fields
// Select JSON as export format

import { InspectionStats } from '../types.js'

export const processRawJsonDump = (data: any): Record<string, Record<string, Record<string, InspectionStats>>> => {
  const nonSumRows = data.filter((d: any) => !d.key[1].includes('yhteensä') && !d.key[2].includes('yhteensä'))

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
      const { model, inspectionYear, carYear } = row
      if (!(model in acc)) {
        acc[model] = {}
      }

      if (!(carYear in acc[model])) {
        acc[model][carYear] = {}
      }

      if (!(inspectionYear in acc[model][carYear])) {
        acc[model][carYear][inspectionYear] = {}
      }

      switch (row.stat) {
        case 'Lkm':
          acc[model][carYear][inspectionYear].count = row.value
          return acc
        case 'Ka':
          acc[model][carYear][inspectionYear].avgKm = row.value
          return acc
        case 'Mediaani':
          acc[model][carYear][inspectionYear].medKm = row.value
          return acc
        case 'Hyvaksytyt':
          acc[model][carYear][inspectionYear].okCount = row.value
          return acc
        case 'Hylatyt':
          acc[model][carYear][inspectionYear].failCount = row.value
          return acc
      }

      return acc
    }, {})

  return processedData
}
