// Adding a new year:
// 1. Export the data from Trafi (see processData.ts)
// 2. Save tha data as year.json in the data folder
// 3. Change year to the new year in const
// 4. Change the year to processed_year.json
// 5. Run the script yarn add-year
// 6. Print brands and copy to backend/brands.ts
// 7. Change year to backend/backend.ts
// 8. Change years to Home.tsx, sitemap.xml and README.md
// 9. Profit

import yearData from '../data/2023.json' assert { type: 'json' }
import prevData from '../data/processed_2022.json' assert { type: 'json' }

import fs from 'fs'
import { median, sort, mergeDeepLeft, uniq } from 'ramda'
import { InspectionStats } from '../types.js'
import { processRawJsonDump } from './processData.js'

const tickSize = 5000
const maxKms = 400000

const YEAR = 2023

const main = yearData as { data: any }
const processedData = processRawJsonDump(main.data)
const mergedData = mergeDeepLeft(prevData, processedData)

fs.writeFileSync(
  `./src/data/processed_${YEAR}.json`,
  JSON.stringify(mergedData),
  {}
)

const printBrands = () => {
  console.log(
    uniq(
      Object.keys(mergedData).map((model) =>
        // Usually model names are in caps, so remove them. This is sort of best effort thing,
        // data needs to be cleaned manually afterwards anyway. Eg. Tesla and Tesla Motors are the same thing actually.
        model
          .split(' ')
          .slice(0, -1)
          .join(' ')
          .replaceAll(/\s[A-Z]{2,}/g, '')
          .trim()
      )
    ).sort()
  )
}

printBrands()

const percentile = (data: number[], percentile: number): number => {
  const idx = Math.round(percentile * data.length)
  const sorted = sort((a, b) => a - b, data)
  return sorted[idx]
}

const flatStats = Object.values(mergedData).flatMap((d: any) =>
  Object.values(d).flatMap((s: any) => Object.values(s))
) as InspectionStats[]

const percentagesByKm = flatStats.reduce((acc: any, cur: any) => {
  // KEEP IN SYNC WITH Chart.ts
  const key = cur.avgKm - (cur.avgKm % tickSize)
  if (!(key in acc)) {
    acc[key] = []
  }

  if (cur.count > 0) {
    const perc = ((cur.failCount ?? 0) / cur.count) * 100

    acc[key].push(perc)
  }
  return acc
}, {} as Record<string, number[]>)

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
      med: number | undefined
      p75: number | undefined
      p25: number | undefined
    }
  >
)

fs.writeFileSync(
  `./src/data/baseline_${YEAR}.json`,
  JSON.stringify(baseLineData),
  {}
)

const averageDiffsByModel = Object.keys(mergedData).reduce((acc, model) => {
  const allStats: InspectionStats[] = Object.values(mergedData[model]).flatMap(
    (d: any) => Object.values(d)
  )

  const diffs = allStats
    .filter((stat) => stat.avgKm <= maxKms)
    .map((stat) => {
      const kmSlot = stat.avgKm - (stat.avgKm % tickSize)
      const baseline = baseLineData[kmSlot.toString()]
      return baseline.med! - (100 * (stat.failCount || 0)) / stat.count
    })

  const avgDiff = diffs.reduce((total, cur) => total + cur, 0) / diffs.length

  return Object.assign(acc, { [model]: avgDiff })
}, {} as Record<string, number>)

fs.writeFileSync(
  `./src/data/avgDiffs_${YEAR}.json`,
  JSON.stringify(averageDiffsByModel),
  {}
)
