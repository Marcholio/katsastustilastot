import processedData from '../data/processed_2023.json'
import baseline from '../data/baseline_2023.json'
import { brands } from './brands'
import avgDiffs from '../data/avgDiffs_2023.json'
import { InspectionStats, ProcessedData } from '../types'

// model -> car year -> inspection year -> stats
const fullData = processedData as any as ProcessedData

const baselineData = baseline as any as Record<
  string,
  {
    med: number | undefined
    p75: number | undefined
    p25: number | undefined
  }
>

const diffData = avgDiffs as any as Record<string, number>

export const getBrands = (): string[] => brands

export const getModels = (brand: string): string[] =>
  Object.keys(fullData)
    .filter((model) => model.startsWith(brand))
    .map((model) => model.slice(brand.length + 1))

export const getYears = (model: string): string[] =>
  fullData[model]
    ? Object.keys(fullData[model]).filter((year) =>
        Object.values(fullData[model][year]).some((stat) => stat.count > 0)
      )
    : []

export const getData = (
  model: string,
  carYear: string | undefined
): InspectionStats[] => {
  if (!fullData[model]) {
    return Object.keys(fullData)
      .filter((m) => m.startsWith(model))
      .flatMap((m) =>
        Object.values(fullData[m]).flatMap((val) => Object.values(val))
      )
  }

  if (carYear && carYear !== '0') {
    return Object.values(fullData[model][carYear])
  }

  return Object.values(fullData[model]).flatMap((val) => Object.values(val))
}

export const getBaseline = () => baselineData

export const getTopList = () =>
  Object.entries(diffData).sort((a, b) => b[1] - a[1])

export const getTopListByBrand = (): [string, number][] => {
  return Object.entries(
    brands.reduce((acc, b) => {
      const models = Object.keys(diffData).filter((model) =>
        model.startsWith(b)
      )

      const sum = models.reduce(
        (total, model: any) => diffData[model] + total,
        0
      )

      return Object.assign(acc, {
        [b]: sum / models.length,
      })
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])
}
