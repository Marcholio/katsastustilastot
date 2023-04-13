export type InspectionStats = {
  count: number
  avgKm: number
  medKm: number
  okCount: number
  failCount: number
}

export type ProcessedData = Record<string, Record<string, Record<string, InspectionStats>>>

export type SelectedCar = {
  brand?: string
  model?: string
  year?: string
}
