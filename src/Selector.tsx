import { useEffect, useState } from 'react'
import { SearchSelect, SearchSelectOption } from './SearchSelect'
import { getBrands, getModels, getYears } from './backend/backend'

type Props = {
  onChange: (val: { brand?: string; model?: string; year?: string }) => void
  brand?: string
  model?: string
  year?: string
}

const modelOptions = (
  brand: string | undefined,
  models: string[],
): SearchSelectOption[] =>
  [undefined, ...[...models].sort()].map((model) => ({
    name: model ?? 'Kaikki mallit',
    value: model ? `${brand} ${model}` : `${brand}`,
  }))

const yearOptions = (years: string[]): SearchSelectOption[] =>
  [undefined, ...years].map((year) => ({
    name: year ?? 'Kaikki käyttöönottovuodet',
    value: year ?? '0',
  }))

export const Selector = ({ onChange, brand, model, year }: Props) => {
  const brands = getBrands()
  const brandOptions: SearchSelectOption[] = brands.map((b) => ({
    name: b,
    value: b,
  }))

  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(brand)
  const [models, setModels] = useState<string[]>(brand ? getModels(brand) : [])
  const [selectedModel, setSelectedModel] = useState<string | undefined>(model)
  const [years, setYears] = useState<string[]>(model ? getYears(model) : [])
  const [selectedYear, setSelectedYear] = useState<string | undefined>(year)

  useEffect(() => {
    if (selectedBrand) {
      setModels(getModels(selectedBrand))
      setSelectedYear(undefined)
    }
  }, [selectedBrand])

  useEffect(() => {
    if (selectedModel) {
      const newYears = getYears(selectedModel)
      if (selectedYear && !newYears.includes(selectedYear)) {
        setSelectedYear(undefined)
      }
      setYears(newYears)
    }
  }, [selectedModel])

  useEffect(() => {
    const years = selectedModel ? getYears(selectedModel) : []
    const validYear =
      !selectedYear ||
      selectedYear === '0' ||
      (selectedYear && years.includes(selectedYear))

    if (validYear) {
      onChange({
        brand: selectedBrand,
        model: selectedModel,
        year: selectedYear,
      })
    }
  }, [selectedBrand, selectedModel, selectedYear])

  return (
    <div className="selector-container">
      <SearchSelect
        options={brandOptions}
        placeholder="Valitse merkki"
        search
        onChange={(val) => setSelectedBrand(val)}
        value={selectedBrand}
      />
      <SearchSelect
        options={modelOptions(selectedBrand, models)}
        placeholder="Valitse malli"
        search
        onChange={(val) => setSelectedModel(val)}
        value={selectedModel}
      />
      <SearchSelect
        options={yearOptions(years)}
        placeholder="Valitse käyttöönottovuosi"
        onChange={(val) => setSelectedYear(val)}
        value={selectedYear}
      />
    </div>
  )
}
